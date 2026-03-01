"""
FastAPI RAG server for the thesis chatbot.

Uses TF-IDF to find relevant thesis chunks, then sends them
as context to Claude Haiku for grounded, accurate answers.

Endpoints:
    POST /ask  — accepts {"question": "..."}, returns {"answer": "..."}
"""

import json
import os
import time
from collections import defaultdict
from contextlib import asynccontextmanager

import anthropic
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# --- Configuration ---
CHUNKS_PATH = os.environ.get("CHUNKS_PATH", "/home/ubuntu/chatbot/thesis_chunks.json")
API_KEY = os.environ.get("API_KEY", "change-me-in-production")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGIN", "https://the-memory.info").split(",")]
RATE_LIMIT = int(os.environ.get("RATE_LIMIT", "10"))  # requests per minute
TOP_K = 8  # number of chunks to include as context

# --- Rate limiter ---
_request_log: dict[str, list[float]] = defaultdict(list)


def check_rate_limit(ip: str):
    now = time.time()
    window = 60.0
    _request_log[ip] = [t for t in _request_log[ip] if now - t < window]
    if len(_request_log[ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again later.")
    _request_log[ip].append(now)


# --- RAG components ---
chunks: list[str] = []
vectorizer: TfidfVectorizer | None = None
tfidf_matrix = None
claude_client: anthropic.Anthropic | None = None


def find_relevant_chunks(question: str, top_k: int = TOP_K) -> list[str]:
    """Find the most relevant thesis chunks for a question using TF-IDF similarity."""
    import re

    # Check if the user is asking about a specific chapter number
    ch_match = re.search(r"chapter\s+(\d+)", question, re.IGNORECASE)

    if ch_match:
        ch_num = ch_match.group(1)
        # Return all chunks from that chapter
        ch_chunks = [c for c in chunks if f"Chapter {ch_num}" in c.split("\n")[0]]
        if ch_chunks:
            return ch_chunks[:top_k]

    # Fall back to TF-IDF similarity
    q_vec = vectorizer.transform([question])
    scores = cosine_similarity(q_vec, tfidf_matrix).flatten()
    top_indices = scores.argsort()[-top_k:][::-1]
    return [chunks[i] for i in top_indices if scores[i] > 0]


@asynccontextmanager
async def lifespan(app: FastAPI):
    global chunks, vectorizer, tfidf_matrix, claude_client

    # Load thesis chunks
    print(f"Loading thesis chunks from {CHUNKS_PATH}...")
    with open(CHUNKS_PATH, encoding="utf-8") as f:
        chunks = json.load(f)
    print(f"Loaded {len(chunks)} chunks")

    # Build TF-IDF index
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(chunks)
    print("TF-IDF index built")

    # Init Claude client
    claude_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    print("Claude client ready")

    yield


# --- App ---
app = FastAPI(title="Thesis Chat Bot", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST"],
    allow_headers=["Content-Type", "X-API-Key"],
)


class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    answer: str


SYSTEM_PROMPT = """You are a helpful assistant that answers questions about a master's thesis on episodic memory and event segmentation.

You MUST answer based ONLY on the provided thesis excerpts. If the excerpts don't contain enough information to answer the question, say so honestly. Do not make up information.

Keep your answers concise (2-4 sentences) and academic in tone."""


@app.post("/ask", response_model=AskResponse)
async def ask(req: AskRequest, request: Request):
    # Validate API key
    api_key = request.headers.get("X-API-Key")
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")

    # Rate limit
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(client_ip)

    # Find relevant chunks
    relevant = find_relevant_chunks(req.question)
    if not relevant:
        return AskResponse(answer="I couldn't find relevant information in the thesis to answer that question.")

    context = "\n\n---\n\n".join(relevant)

    # Call Claude
    message = claude_client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=300,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Thesis excerpts:\n\n{context}\n\n---\n\nQuestion: {req.question}",
            }
        ],
    )

    answer = message.content[0].text

    return AskResponse(answer=answer)


@app.get("/health")
async def health():
    return {"status": "ok", "chunks_loaded": len(chunks)}

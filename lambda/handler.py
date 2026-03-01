"""
AWS Lambda handler for the thesis chatbot.

Uses keyword matching to find relevant thesis chunks,
then sends them as context to Claude Haiku.
"""

import json
import math
import os
import re
import time
from collections import Counter, defaultdict

import anthropic

# --- Configuration ---
API_KEY = os.environ.get("API_KEY", "change-me")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGIN", "https://the-memory.info").split(",")]
TOP_K = 8

# --- Load chunks at cold start ---
CHUNKS_PATH = os.path.join(os.path.dirname(__file__), "thesis_chunks.json")
with open(CHUNKS_PATH, encoding="utf-8") as f:
    CHUNKS = json.load(f)

# --- Simple BM25-like scoring (no sklearn needed) ---
# Pre-compute document frequencies
_stop_words = set("the a an is are was were be been being have has had do does did will would shall should may might can could and or but if then else when where how what which who whom this that these those i me my we our you your he him his she her it its they them their in on at to for of with by from as into about between through during".split())


def _tokenize(text: str) -> list[str]:
    return [w for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in _stop_words and len(w) > 1]


# Pre-compute IDF and document token counts
_doc_tokens = [_tokenize(c) for c in CHUNKS]
_doc_freqs: dict[str, int] = defaultdict(int)
for tokens in _doc_tokens:
    for t in set(tokens):
        _doc_freqs[t] += 1
_N = len(CHUNKS)
_avg_dl = sum(len(t) for t in _doc_tokens) / _N if _N > 0 else 1


def _bm25_score(query_tokens: list[str], doc_idx: int, k1: float = 1.5, b: float = 0.75) -> float:
    doc = _doc_tokens[doc_idx]
    doc_len = len(doc)
    tf = Counter(doc)
    score = 0.0
    for qt in query_tokens:
        if qt not in tf:
            continue
        df = _doc_freqs.get(qt, 0)
        idf = math.log((_N - df + 0.5) / (df + 0.5) + 1)
        term_freq = tf[qt]
        numerator = term_freq * (k1 + 1)
        denominator = term_freq + k1 * (1 - b + b * doc_len / _avg_dl)
        score += idf * numerator / denominator
    return score


def find_relevant_chunks(question: str) -> list[str]:
    # Check for specific chapter number queries
    ch_match = re.search(r"chapter\s+(\d+)", question, re.IGNORECASE)
    if ch_match:
        ch_num = ch_match.group(1)
        ch_chunks = [c for c in CHUNKS if f"Chapter {ch_num}" in c.split("\n")[0]]
        if ch_chunks:
            return ch_chunks[:TOP_K]

    # BM25 scoring
    query_tokens = _tokenize(question)
    scores = [(i, _bm25_score(query_tokens, i)) for i in range(_N)]
    scores.sort(key=lambda x: x[1], reverse=True)
    return [CHUNKS[i] for i, s in scores[:TOP_K] if s > 0]


# --- Claude client ---
claude_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """You are a helpful assistant that answers questions about a master's thesis on episodic memory and event segmentation.

You MUST answer based ONLY on the provided thesis excerpts. If the excerpts don't contain enough information to answer the question, say so honestly. Do not make up information.

Keep your answers concise (2-4 sentences) and academic in tone."""


# --- Rate limiting (simple in-memory, resets on cold start) ---
_rate_log: dict[str, list[float]] = defaultdict(list)


def _check_rate(ip: str, limit: int = 10):
    now = time.time()
    _rate_log[ip] = [t for t in _rate_log[ip] if now - t < 60]
    if len(_rate_log[ip]) >= limit:
        return False
    _rate_log[ip].append(now)
    return True


# --- CORS headers ---
def _cors_headers(origin: str) -> dict:
    allowed = origin if origin in ALLOWED_ORIGINS else ALLOWED_ORIGINS[0]
    return {
        "Access-Control-Allow-Origin": allowed,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    }


def _response(status: int, body: dict, origin: str = "") -> dict:
    return {
        "statusCode": status,
        "headers": {**_cors_headers(origin), "Content-Type": "application/json"},
        "body": json.dumps(body),
    }


# --- Lambda handler ---
def lambda_handler(event, context):
    # Handle CORS preflight
    method = event.get("httpMethod") or event.get("requestContext", {}).get("http", {}).get("method", "")
    headers = event.get("headers") or {}
    origin = headers.get("origin", headers.get("Origin", ""))

    if method == "OPTIONS":
        return _response(200, {}, origin)

    # Parse path
    path = event.get("path") or event.get("rawPath", "")

    # Health check
    if path.endswith("/health"):
        return _response(200, {"status": "ok", "chunks": len(CHUNKS)}, origin)

    # Only POST /ask
    if not path.endswith("/ask") or method != "POST":
        return _response(404, {"detail": "Not found"}, origin)

    # Validate API key
    api_key = headers.get("X-API-Key") or headers.get("x-api-key", "")
    if api_key != API_KEY:
        return _response(403, {"detail": "Invalid API key"}, origin)

    # Rate limit
    ip = (event.get("requestContext", {}).get("identity", {}).get("sourceIp")
          or event.get("requestContext", {}).get("http", {}).get("sourceIp", "unknown"))
    if not _check_rate(ip):
        return _response(429, {"detail": "Rate limit exceeded. Try again later."}, origin)

    # Parse body
    try:
        body = json.loads(event.get("body", "{}"))
        question = body["question"]
    except (json.JSONDecodeError, KeyError):
        return _response(400, {"detail": "Request body must contain a 'question' field"}, origin)

    # Find relevant chunks
    relevant = find_relevant_chunks(question)
    if not relevant:
        return _response(200, {"answer": "I couldn't find relevant information in the thesis to answer that question."}, origin)

    context_text = "\n\n---\n\n".join(relevant)

    # Call Claude
    try:
        message = claude_client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"Thesis excerpts:\n\n{context_text}\n\n---\n\nQuestion: {question}",
                }
            ],
        )
        answer = message.content[0].text
    except Exception as e:
        return _response(500, {"detail": f"Error generating response: {str(e)}"}, origin)

    return _response(200, {"answer": answer}, origin)

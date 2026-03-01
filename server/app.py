"""
FastAPI inference server for the fine-tuned GPT-2 thesis chatbot.

Endpoints:
    POST /ask  — accepts {"question": "..."}, returns {"answer": "..."}

Security:
    - CORS restricted to GitHub Pages domain
    - API key validation via X-API-Key header
    - Rate limiting: 10 requests/minute per IP
"""

import os
import time
from collections import defaultdict
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer

# --- Configuration ---
MODEL_PATH = os.environ.get("MODEL_PATH", "/app/model")
API_KEY = os.environ.get("API_KEY", "change-me-in-production")
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "https://sulaimanhayek.github.io")
MAX_NEW_TOKENS = int(os.environ.get("MAX_NEW_TOKENS", "200"))
RATE_LIMIT = int(os.environ.get("RATE_LIMIT", "10"))  # requests per minute

# --- Rate limiter ---
_request_log: dict[str, list[float]] = defaultdict(list)


def check_rate_limit(ip: str):
    now = time.time()
    window = 60.0
    _request_log[ip] = [t for t in _request_log[ip] if now - t < window]
    if len(_request_log[ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again later.")
    _request_log[ip].append(now)


# --- Model loading ---
model = None
tokenizer = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, tokenizer
    print(f"Loading model from {MODEL_PATH}...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForCausalLM.from_pretrained(MODEL_PATH)
    model.eval()
    print("Model loaded.")
    yield


# --- App ---
app = FastAPI(title="Thesis Chat Bot", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_methods=["POST"],
    allow_headers=["Content-Type", "X-API-Key"],
)


class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    answer: str


@app.post("/ask", response_model=AskResponse)
async def ask(req: AskRequest, request: Request):
    # Validate API key
    api_key = request.headers.get("X-API-Key")
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")

    # Rate limit
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(client_ip)

    # Generate response
    prompt = f"<|question|> {req.question}\n<|answer|>"
    inputs = tokenizer(prompt, return_tensors="pt")

    outputs = model.generate(
        **inputs,
        max_new_tokens=MAX_NEW_TOKENS,
        do_sample=True,
        temperature=0.7,
        top_p=0.9,
        pad_token_id=tokenizer.eos_token_id,
    )

    full_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Extract just the answer portion
    if "<|answer|>" in full_text:
        answer = full_text.split("<|answer|>")[-1].strip()
    else:
        answer = full_text[len(prompt):].strip()

    # Clean up: stop at next question token or excessive repetition
    if "<|question|>" in answer:
        answer = answer.split("<|question|>")[0].strip()

    return AskResponse(answer=answer or "I'm not sure how to answer that based on the thesis content.")


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model is not None}

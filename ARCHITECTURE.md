# The Memory Project — Architecture Guide

A beginner-friendly walkthrough of how this project works, from thesis markdown files all the way to a live chatbot that answers questions about the thesis.

---

## What is this project?

This is a web application that publishes a master's thesis as an interactive website and lets visitors **ask questions about the thesis** using a chatbot. The chatbot uses a technique called **RAG (Retrieval-Augmented Generation)** so that answers are grounded in the actual thesis text rather than made up.

The thesis is titled *"What do people remember? Investigating event segmentation in naturalistic scenes based on artificial neural network, perception census, and fMRI models"* by Sulaiman Ahmed, University of Sussex (2025).

**Live site:** [the-memory.info](https://the-memory.info)

---

## Project Structure

```
memory/
├── src/                        # Frontend source code (React)
│   ├── main.jsx                # App entry point
│   ├── App.jsx                 # Routes and page layout
│   ├── styles.css              # Global styles
│   ├── pages/                  # Page components
│   │   ├── Home.jsx            # Landing page with animated chapter cards
│   │   ├── Blog.jsx            # Chapter grid/list view
│   │   ├── ChapterPage.jsx     # Individual chapter reader with sidebar TOC
│   │   ├── About.jsx           # About page
│   │   ├── References.jsx      # Bibliography
│   │   └── Chat.jsx            # Chatbot interface
│   └── content/
│       ├── chapters.js         # Loads and parses all chapter markdown files
│       └── chapters/           # The thesis content as markdown
│           ├── 01-introduction.md
│           ├── 02-event-segmentation.md
│           ├── 03-cnn-model.md
│           ├── 04-perception-census-model.md
│           ├── 05-fmri-model.md
│           ├── 06-online-behavioural-study.md
│           ├── 07-discussion.md
│           └── 08-references.md
│
├── server/                     # Chunking pipeline + local dev server
│   ├── prepare_chunks.py       # Reads chapters → generates thesis_chunks.json
│   ├── app.py                  # FastAPI server (local dev alternative to Lambda)
│   ├── thesis_chunks.json      # Generated chunk data
│   ├── Dockerfile              # Container config for self-hosted deployment
│   └── requirements.txt        # Python dependencies
│
├── lambda/                     # AWS Lambda backend (production)
│   ├── handler.py              # Lambda function — RAG search + Claude API
│   ├── thesis_chunks.json      # Same chunks, copied here for Lambda packaging
│   ├── function.zip            # Deployable Lambda package (handler + deps)
│   └── package/                # Installed Python dependencies for Lambda
│
├── model/                      # Legacy GPT-2 fine-tuning (deprecated, replaced by RAG)
│   ├── train.py                # HuggingFace training script
│   └── prepare_data.py         # Data prep for fine-tuning
│
├── docs/                       # Built frontend (output of `npm run build`)
├── public/                     # Static images and assets
├── index.html                  # HTML shell for the React app
├── vite.config.js              # Vite build configuration
├── package.json                # Node.js dependencies
├── CNAME                       # Custom domain for GitHub Pages
└── .github/workflows/static.yml  # GitHub Pages deployment workflow
```

---

## How the Frontend Works

The frontend is a **React** single-page application (SPA) built with **Vite**.

### Content loading

The thesis lives as markdown files in `src/content/chapters/`. Each file has YAML frontmatter at the top:

```yaml
---
title: "Chapter 1: Introduction"
slug: introduction
author: Sulaiman Ahmed
order: 1
---
# 1.1 Motivation
The actual chapter content starts here...
```

At build time, `src/content/chapters.js` uses Vite's `import.meta.glob()` to load every `.md` file as a raw string, parses the YAML frontmatter, and exports them as a sorted array. The `ChapterPage` component then renders the markdown using `react-markdown`.

### Routing

The app uses **HashRouter** (URLs like `the-memory.info/#/chapters/introduction`). Hash-based routing works out of the box on GitHub Pages because the server always serves the same `index.html` — the `#` part is handled entirely in the browser.

Routes:
- `/` — Home (animated chapter cards)
- `/chapters` — Grid of all chapters
- `/chapters/:slug` — Read a specific chapter
- `/about` — About the project
- `/references` — Bibliography
- `/chat` — Chatbot interface

### Building and deploying

```bash
npm run build          # Vite compiles React → static files in docs/
git push origin main   # GitHub Actions deploys docs/ to GitHub Pages
```

The site is served at `the-memory.info` via GitHub Pages (configured in `CNAME`).

---

## How the Chatbot Works (RAG Pipeline)

The chatbot lets visitors ask questions like *"What is event segmentation?"* and get answers grounded in the actual thesis text. Here's how each piece fits together.

### Step 1: Chunking the thesis

**Script:** `server/prepare_chunks.py`

The thesis chapters are long documents. Language models have limited context windows, and sending the entire thesis for every question would be slow and expensive. Instead, we break it into **chunks** — smaller passages of roughly 500 words each.

```
Markdown chapters → strip frontmatter → split at paragraph breaks → chunks
```

The script:
1. Reads each `.md` file from `src/content/chapters/`
2. Strips the YAML frontmatter
3. Splits the body text at double-newline paragraph boundaries
4. Groups paragraphs together until hitting ~500 words, then starts a new chunk
5. Prefixes each chunk with its chapter title (e.g., `[Chapter 3: CNN Model] (Chapter 3)`)
6. Saves the result as `thesis_chunks.json` — a simple JSON array of strings

**Why 500 words?** Smaller chunks (e.g., 150 words) often cut off mid-thought, which means the model gets incomplete context and is more likely to hallucinate. Larger chunks preserve full ideas and give the model enough surrounding context to answer accurately.

Run the chunking script:

```bash
python server/prepare_chunks.py
# Output: "Wrote 51 chunks to server/thesis_chunks.json"
# Output: "Wrote 51 chunks to lambda/thesis_chunks.json"
```

This writes the chunks to both `server/` (for local dev) and `lambda/` (for production deployment).

### Step 2: Search with BM25

**File:** `lambda/handler.py`

When a user asks a question, we need to find which chunks are most relevant. We use **BM25**, a classic information retrieval algorithm. Think of it as a smarter version of keyword search.

Here's how BM25 works in simple terms:

1. **Tokenisation:** The question is broken into individual words (tokens). Common words like "the", "is", "and" are removed (stop words). For example:
   - *"What is event segmentation theory?"* → `["event", "segmentation", "theory"]`

2. **Term frequency (TF):** For each chunk, count how many times each query word appears. A chunk mentioning "event segmentation" five times is probably more relevant than one mentioning it once.

3. **Inverse document frequency (IDF):** Words that appear in many chunks (like "study") are less useful for distinguishing relevant chunks. Words that appear in few chunks (like "fMRI") are more discriminating. IDF gives rare words more weight.

4. **Length normalisation:** Longer chunks naturally contain more words, so BM25 adjusts scores so that a short, focused chunk isn't penalised against a long, rambling one.

5. **Scoring:** Each chunk gets a BM25 score. The top 12 chunks are selected.

There's also a shortcut: if the user asks about a specific chapter (e.g., *"What does chapter 3 cover?"*), the system directly filters chunks by chapter number instead of running BM25.

### Step 3: Generate an answer with Claude

The top 12 chunks are sent to **Claude Haiku** (Anthropic's fast, lightweight model) along with the user's question and a system prompt.

The system prompt is critical for reducing hallucination:

```
You MUST answer based ONLY on the provided thesis excerpts. Rules:
1. If the excerpts don't contain the answer, say so — do NOT fill gaps
   with your own knowledge.
2. When citing studies, only state what the thesis says about them.
3. Keep answers concise (2-5 sentences) and academic in tone.
4. If the question is unrelated to the thesis, politely decline.
```

The full flow for a single question:

```
User types question
        ↓
Chat.jsx sends POST to https://api.the-memory.info/ask
        ↓
Lambda receives request
        ↓
Validate API key + rate limit (10 req/min per IP)
        ↓
BM25 search → top 12 relevant chunks
        ↓
Send chunks + question + system prompt to Claude Haiku
        ↓
Claude generates a grounded answer
        ↓
Return JSON response → Chat.jsx displays it
```

---

## AWS Lambda Deployment

The chatbot backend runs on **AWS Lambda** — a serverless platform where you upload code and AWS runs it on demand. You pay only when it's called, and it scales automatically.

### What's in the Lambda package

The `function.zip` file contains everything Lambda needs:

```
function.zip
├── handler.py              # The Lambda function code
├── thesis_chunks.json      # Pre-computed thesis chunks
├── anthropic/              # Anthropic Python SDK (for calling Claude)
└── (other dependencies)    # httpcore, h11, certifi, etc.
```

### How to rebuild and deploy

```bash
# 1. Regenerate chunks (if chapter content changed)
python server/prepare_chunks.py

# 2. Copy updated files into the package directory
cp lambda/handler.py lambda/package/
cp lambda/thesis_chunks.json lambda/package/

# 3. Build the zip
cd lambda/package && zip -r ../function.zip . && cd ../..

# 4. Deploy to AWS
aws lambda update-function-code \
  --function-name thesis-chatbot \
  --zip-file fileb://lambda/function.zip
```

### Environment variables on Lambda

These are set in the AWS Lambda console (not committed to git):

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | API key for calling Claude |
| `API_KEY` | Secret key that the frontend sends to authenticate |
| `ALLOWED_ORIGIN` | CORS origin (`https://the-memory.info`) |

---

## End-to-End Pipeline Summary

```
┌──────────────────────────────────────────────────────────┐
│                    CONTENT LAYER                         │
│                                                          │
│  Thesis PDF → hand-converted to Markdown chapter files   │
│              (src/content/chapters/*.md)                 │
└────────────────────────┬─────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
┌──────────────────┐          ┌──────────────────────┐
│   FRONTEND       │          │  CHUNKING PIPELINE   │
│                  │          │                      │
│ Vite builds      │          │ prepare_chunks.py    │
│ React SPA with   │          │ splits chapters into │
│ chapters baked   │          │ ~500-word passages   │
│ in at build time │          │ → thesis_chunks.json │
│                  │          │                      │
│ Deployed via     │          └──────────┬───────────┘
│ GitHub Pages     │                     │
│ (the-memory.info)│                     ▼
│                  │          ┌──────────────────────┐
│ /chat page calls │          │   AWS LAMBDA         │
│ Lambda API  ─────┼────────▶ │                      │
│                  │          │ Loads chunks at start │
│                  │   POST   │ BM25 keyword search  │
│                  │  /ask    │ Sends top 12 chunks  │
│                  │          │ to Claude Haiku      │
│                  │  ◀───────┤ Returns answer       │
│ Displays answer  │  JSON    │                      │
└──────────────────┘          └──────────────────────┘
```

---

## Legacy: GPT-2 Fine-Tuning (Deprecated)

The `model/` directory contains an earlier approach where GPT-2 was fine-tuned on the thesis text. This was replaced by RAG because:

- Fine-tuned small models still hallucinate frequently
- RAG with a strong base model (Claude) produces more accurate, grounded answers
- No GPU needed — the Lambda function is pure CPU
- Updating content only requires regenerating chunks, not retraining a model

The `model/` directory is kept for reference but is not used in the live system.

---

## Quick Reference

| Task | Command |
|---|---|
| Run frontend locally | `npm run dev` |
| Build frontend | `npm run build` |
| Regenerate chunks | `python server/prepare_chunks.py` |
| Rebuild Lambda zip | `cd lambda/package && zip -r ../function.zip .` |
| Deploy Lambda | `aws lambda update-function-code --function-name thesis-chatbot --zip-file fileb://lambda/function.zip` |
| Run local server | `cd server && uvicorn app:app --reload` |

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
│   └── package/                # Installed Python dependencies for Lambda (gitignored)
│
├── model/                      # Legacy GPT-2 fine-tuning (deprecated, replaced by RAG)
│   ├── train.py                # HuggingFace training script
│   └── prepare_data.py         # Data prep for fine-tuning
│
├── docs/                       # Built frontend (output of `npm run build`) — this is what GitHub Pages serves
├── public/                     # Static images and assets (public/CNAME is copied into docs/ on build)
├── index.html                  # HTML shell for the React app
├── vite.config.js              # Vite build configuration (outDir: docs)
├── package.json                # Node.js dependencies
├── CNAME                       # Custom domain for GitHub Pages
└── .env                        # Chat API URL + key baked into the build (gitignored)
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

The site uses GitHub Pages' **classic "deploy from a branch"** mode: Pages is set to serve the `docs/` folder of the `main` branch as-is. There is no custom workflow — GitHub's built-in `pages-build-deployment` run publishes `docs/` automatically after every push to `main`.

That means the built files have to be committed:

```bash
npm run build          # Vite compiles React → static files in docs/ (wipes and rewrites the folder)
git add docs/          # commit the rebuilt site together with the source change
git commit -m "..."
git push origin main   # pages-build-deployment publishes docs/ within a minute or two
```

If you change something in `src/` but don't rebuild and commit `docs/`, the live site won't change.

The build reads two values from `.env` (gitignored) and bakes them into the JavaScript bundle:

| Variable | Purpose |
|---|---|
| `VITE_CHAT_API_URL` | Chat backend URL (`https://api.the-memory.info`) |
| `VITE_CHAT_API_KEY` | Key the chat page sends in the `X-API-Key` header |

Because it ends up in the public bundle, `VITE_CHAT_API_KEY` is **not a secret** — anyone can read it from the browser. It only stops casual drive-by requests; the real protection is the throttling and spend cap described in [Limits and Cost Controls](#limits-and-cost-controls).

The site is served at `the-memory.info` via GitHub Pages (the custom domain comes from `public/CNAME`, which Vite copies into `docs/CNAME`).

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

The top 12 chunks are sent to **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`, Anthropic's fast, lightweight model) along with the user's question and a system prompt. Answers are capped at 600 output tokens. The Lambda calls the Anthropic API directly with its own `ANTHROPIC_API_KEY` (not Amazon Bedrock), so model usage is billed by Anthropic, not AWS.

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
API Gateway (HTTP API, throttled to 1 req/s, burst 3)
        ↓
Lambda receives request (max 2 running at once)
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
  --region eu-west-1 \
  --zip-file fileb://lambda/function.zip
```

Nothing deploys the Lambda automatically — editing `lambda/handler.py` and pushing to GitHub does not change the live chatbot until you run the steps above.

### AWS resources

Everything lives in **eu-west-1 (Ireland)**:

| Resource | Name / ID | Notes |
|---|---|---|
| Lambda function | `thesis-chatbot` | Python 3.12, 256 MB, 30 s timeout |
| API Gateway (HTTP API) | `thesis-chatbot-api` (`aoj63x8pa3`), stage `$default` | Routes requests to the Lambda |
| Custom domain | `api.the-memory.info` | Points at the API Gateway |

### Environment variables on Lambda

These are set in the AWS Lambda console (not committed to git):

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | API key for calling Claude |
| `API_KEY` | Secret key that the frontend sends to authenticate |
| `ALLOWED_ORIGIN` | CORS origin (`https://the-memory.info`) |

---

## Limits and Cost Controls

The chat key in the frontend bundle is public, so anyone could call the API directly. Several layers keep a runaway bill from happening:

| Layer | Limit | What the visitor sees when it's hit |
|---|---|---|
| API Gateway stage throttle | 1 request/second, burst of 3 | `503 Service Unavailable` |
| Lambda reserved concurrency | 2 requests running at once | `503` from API Gateway |
| In-handler rate limit (`handler.py`) | 10 requests/minute per IP | `429 Rate limit exceeded` |
| Anthropic spend limit | $10/month on the Claude Console workspace that holds the Lambda's `ANTHROPIC_API_KEY` | `500` with Anthropic's error until the 1st of next month (UTC) |

The in-handler limit is kept in memory, so it resets whenever Lambda starts a fresh instance — treat it as a courtesy, not a guarantee. The API Gateway and Lambda limits are the reliable throttles, and the **Anthropic spend limit is the hard cap on cost**.

**Typical cost:** each question sends roughly 7,000 input tokens (12 chunks + prompt) and gets up to 600 output tokens back. At Haiku 4.5 pricing ($1 / $5 per million input / output tokens) that's about **$0.01 per question**, so the $10 cap covers around 1,000 questions a month. Normal visitor traffic never comes close to the throttles.

### Where each limit is set

- **API Gateway throttle and Lambda concurrency** — set with the AWS CLI (commands below) or in the AWS Console.
- **Anthropic spend limit** — in the [Claude Console](https://platform.claude.com/settings/workspaces): **Settings → Workspaces →** select the workspace **→ Spend limits**. Email alerts can be added on the same page. To check which workspace the chatbot's key belongs to, look under **Settings → API keys**.

### Check the current settings

```bash
aws apigatewayv2 get-stage --api-id aoj63x8pa3 --stage-name '$default' \
  --region eu-west-1 --query 'DefaultRouteSettings'

aws lambda get-function-concurrency --function-name thesis-chatbot --region eu-west-1
```

### Change or roll back the limits

```bash
# Change the API Gateway throttle (rate = steady requests/second, burst = short spikes)
aws apigatewayv2 update-stage --api-id aoj63x8pa3 --stage-name '$default' \
  --region eu-west-1 \
  --default-route-settings 'ThrottlingBurstLimit=3,ThrottlingRateLimit=1,DetailedMetricsEnabled=false'

# Roll back to AWS's account-level default (10,000 req/s, burst 5,000)
aws apigatewayv2 update-stage --api-id aoj63x8pa3 --stage-name '$default' \
  --region eu-west-1 \
  --default-route-settings 'ThrottlingBurstLimit=5000,ThrottlingRateLimit=10000,DetailedMetricsEnabled=false'

# Change the Lambda concurrency cap
aws lambda put-function-concurrency --function-name thesis-chatbot \
  --region eu-west-1 --reserved-concurrent-executions 2

# Remove the Lambda concurrency cap entirely
aws lambda delete-function-concurrency --function-name thesis-chatbot --region eu-west-1
```

To raise or remove the Anthropic spend limit, use **Change limit** on the workspace's Spend limits page in the Claude Console.

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
| Deploy frontend | `npm run build && git add docs/ && git commit && git push origin main` |
| Deploy Lambda | `aws lambda update-function-code --function-name thesis-chatbot --region eu-west-1 --zip-file fileb://lambda/function.zip` |
| Check API throttle | `aws apigatewayv2 get-stage --api-id aoj63x8pa3 --stage-name '$default' --region eu-west-1 --query DefaultRouteSettings` |
| Check Lambda concurrency | `aws lambda get-function-concurrency --function-name thesis-chatbot --region eu-west-1` |
| Run local server | `cd server && uvicorn app:app --reload` |

"""
Reads chapter .md files, strips YAML frontmatter, and formats
training data for causal-LM fine-tuning of GPT-2.

Produces two files in model/data/:
  - thesis_chunks.jsonl   (raw thesis text split into chunks)
  - qa_pairs.jsonl         (synthetic Q&A pairs derived from headings)
"""

import json
import os
import re
import glob

CHAPTERS_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "content", "chapters")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data")


def strip_frontmatter(text: str) -> str:
    """Remove YAML frontmatter delimited by --- ... ---"""
    return re.sub(r"^---\n.*?\n---\n?", "", text, count=1, flags=re.DOTALL).strip()


def read_chapters() -> list[dict]:
    """Read all chapter markdown files and return (title, body) pairs."""
    chapters = []
    for path in sorted(glob.glob(os.path.join(CHAPTERS_DIR, "*.md"))):
        raw = open(path, encoding="utf-8").read()

        # Extract title from frontmatter
        title_match = re.search(r'^title:\s*"?(.+?)"?\s*$', raw, re.MULTILINE)
        title = title_match.group(1) if title_match else os.path.basename(path)

        body = strip_frontmatter(raw)
        if body and "will be updated soon" not in body.lower():
            chapters.append({"title": title, "body": body})

    return chapters


def chunk_text(text: str, max_tokens: int = 512) -> list[str]:
    """Split text into roughly max_tokens-word chunks at paragraph boundaries."""
    paragraphs = re.split(r"\n{2,}", text)
    chunks, current = [], []
    current_len = 0

    for para in paragraphs:
        words = len(para.split())
        if current_len + words > max_tokens and current:
            chunks.append("\n\n".join(current))
            current = []
            current_len = 0
        current.append(para)
        current_len += words

    if current:
        chunks.append("\n\n".join(current))
    return chunks


def extract_qa_pairs(chapters: list[dict]) -> list[dict]:
    """
    Generate Q&A-style training pairs from chapter headings and their content.
    Each heading becomes a question; the text until the next heading becomes the answer.
    """
    qa_pairs = []
    for ch in chapters:
        # Split on markdown headings (# or ##)
        sections = re.split(r"(?m)^(#{1,2}\s+.+)$", ch["body"])

        heading = None
        for part in sections:
            part = part.strip()
            if not part:
                continue
            if re.match(r"^#{1,2}\s+", part):
                heading = re.sub(r"^#{1,2}\s+", "", part).strip()
            elif heading and len(part.split()) > 20:
                # Convert heading to a question
                question = f"What is {heading.lower()}?" if not heading.endswith("?") else heading
                qa_pairs.append({
                    "text": f"<|question|> {question}\n<|answer|> {part}"
                })

    return qa_pairs


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    chapters = read_chapters()
    if not chapters:
        print("No chapter content found. Make sure chapters have real content.")
        return

    print(f"Found {len(chapters)} chapters with content")

    # 1. Raw thesis chunks for causal LM training
    all_chunks = []
    for ch in chapters:
        chunks = chunk_text(ch["body"])
        for chunk in chunks:
            all_chunks.append({"text": chunk})

    chunks_path = os.path.join(OUTPUT_DIR, "thesis_chunks.jsonl")
    with open(chunks_path, "w", encoding="utf-8") as f:
        for item in all_chunks:
            f.write(json.dumps(item) + "\n")
    print(f"Wrote {len(all_chunks)} chunks to {chunks_path}")

    # 2. Q&A pairs
    qa_pairs = extract_qa_pairs(chapters)
    qa_path = os.path.join(OUTPUT_DIR, "qa_pairs.jsonl")
    with open(qa_path, "w", encoding="utf-8") as f:
        for item in qa_pairs:
            f.write(json.dumps(item) + "\n")
    print(f"Wrote {len(qa_pairs)} Q&A pairs to {qa_path}")


if __name__ == "__main__":
    main()

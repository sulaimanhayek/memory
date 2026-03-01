"""
Reads chapter .md files and exports thesis chunks as a JSON array
for the RAG server to load at startup.
"""

import json
import os
import re
import glob

CHAPTERS_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "content", "chapters")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "thesis_chunks.json")


def strip_frontmatter(text: str) -> str:
    return re.sub(r"^---\n.*?\n---\n?", "", text, count=1, flags=re.DOTALL).strip()


def chunk_text(text: str, max_words: int = 150) -> list[str]:
    """Split text into chunks at paragraph boundaries."""
    paragraphs = re.split(r"\n{2,}", text)
    chunks, current = [], []
    current_len = 0

    for para in paragraphs:
        words = len(para.split())
        if current_len + words > max_words and current:
            chunks.append("\n\n".join(current))
            current = []
            current_len = 0
        current.append(para)
        current_len += words

    if current:
        chunks.append("\n\n".join(current))
    return chunks


def main():
    all_chunks = []

    for path in sorted(glob.glob(os.path.join(CHAPTERS_DIR, "*.md"))):
        raw = open(path, encoding="utf-8").read()
        title_match = re.search(r'^title:\s*"?(.+?)"?\s*$', raw, re.MULTILINE)
        title = title_match.group(1) if title_match else os.path.basename(path)

        body = strip_frontmatter(raw)
        if body and "will be updated soon" not in body.lower():
            # Extract chapter number for better keyword matching
            ch_num = re.search(r"Chapter (\d+)", title)
            ch_label = f"Chapter {ch_num.group(1)}" if ch_num else title
            for chunk in chunk_text(body):
                # Repeat chapter label to boost TF-IDF matching on "chapter N" queries
                all_chunks.append(f"[{title}] ({ch_label})\n{chunk}")

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, indent=2)

    print(f"Wrote {len(all_chunks)} chunks to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

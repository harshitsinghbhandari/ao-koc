import argparse
import requests
import json
from pathlib import Path
from typing import List

OLLAMA_URL = "http://localhost:11434/api/embed"
MODEL = 'nomic-embed-text-v2-moe:latest'

IGNORE_FOLDERS = {".agent", ".agents", "venv", ".git", "__pycache__"}

# ───────────────────────────────────────────────
# Embedding function
# ───────────────────────────────────────────────
def get_embedding(text: str, model: str = MODEL) -> List[float]:
    try:
        r = requests.post(
            OLLAMA_URL,
            json={"model": model, "input": text},
            timeout=90
        )
        r.raise_for_status()
        return r.json()["embeddings"][0]
    except Exception as e:
        print(f"Error embedding text: {e}")
        return []


# ───────────────────────────────────────────────
# Chunking function (20 lines)
# ───────────────────────────────────────────────
def chunk_text_by_lines(text: str, chunk_size: int = 20) -> List[str]:
    lines = text.splitlines()
    chunks = []

    for i in range(0, len(lines), chunk_size):
        chunk = "\n".join(lines[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)

    return chunks


# ───────────────────────────────────────────────
# Cosine similarity
# ───────────────────────────────────────────────
def cosine_sim(a: List[float], b: List[float]) -> float:
    if not a or not b:
        return 0.0

    dot = sum(x * y for x, y in zip(a, b))
    norm_a = (sum(x * x for x in a)) ** 0.5
    norm_b = (sum(x * x for x in b)) ** 0.5

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return dot / (norm_a * norm_b)


# ───────────────────────────────────────────────
# 1. Generate Embeddings
# ───────────────────────────────────────────────
def generate_embeddings(folder: str, output_file: str = "embeddings.jsonl"):
    folder_path = Path(folder)

    if not folder_path.is_dir():
        print(f"Folder not found: {folder}")
        return

    embeddings = []

    print(f"Collecting & embedding files from: {folder}...\n")

    for file_path in folder_path.rglob("*"):
        # Skip ignored folders
        try:
            rel_path_parts = file_path.relative_to(folder_path).parts
            if any(part in IGNORE_FOLDERS for part in rel_path_parts):
                continue
        except ValueError:
            continue

        if not file_path.is_file():
            continue

        ext = file_path.suffix.lower()
        if ext not in {
            ".py", ".js", ".ts", ".jsx", ".tsx",
            ".go", ".java", ".cpp", ".c", ".h",
            ".rs", ".sh", ".md", ".txt"
        }:
            continue

        try:
            content = file_path.read_text(encoding="utf-8", errors="replace").strip()
            chunks = chunk_text_by_lines(content, 50)
            rel_path = str(file_path.relative_to(folder_path))

            for idx, chunk in enumerate(chunks):
                emb = get_embedding(chunk)

                if emb:
                    item = {
                        "file": rel_path,
                        "chunk_id": idx,
                        "text": chunk,
                        "embedding": emb
                    }

                    embeddings.append(item)
                    print(f"✓ {rel_path:50} [chunk {idx}] ({len(emb)} dims)")
                else:
                    print(f"✗ failed {rel_path} chunk {idx}")

        except Exception as e:
            print(f"Error reading {file_path}: {e}")

    if not embeddings:
        print("No embeddings created.")
        return

    with open(output_file, "w", encoding="utf-8") as f:
        for item in embeddings:
            f.write(json.dumps(item) + "\n")

    print(f"\nSaved {len(embeddings)} embeddings to {output_file}\n")


# ───────────────────────────────────────────────
# 2. Test Embeddings
# ───────────────────────────────────────────────
def test_embeddings(embeddings_file: str, test_queries: List[str]):
    if not Path(embeddings_file).exists():
        print(f"Embeddings file not found: {embeddings_file}")
        return

    print(f"Loading embeddings from {embeddings_file}...")
    embeddings = []
    with open(embeddings_file, "r", encoding="utf-8") as f:
        for line in f:
            embeddings.append(json.loads(line))

    if not embeddings:
        print("No embeddings loaded.")
        return

    print(f"Loaded {len(embeddings)} chunks.\n")
    print("Test cosine similarities:\n")

    for query in test_queries:
        q_emb = get_embedding(query)
        if not q_emb:
            continue

        print(f"Query: {query}")

        scores = []
        for item in embeddings:
            sim = cosine_sim(q_emb, item["embedding"])
            if sim > 0.4:
                scores.append((sim, item["file"], item["chunk_id"]))

        scores.sort(reverse=True)

        for sim, path, chunk_id in scores[:3]:
            print(f"  {sim:.4f} → {path} (chunk {chunk_id})")

        print()


# ───────────────────────────────────────────────
# Run
# ───────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Embeddings generator and query tool")
    parser.add_argument("--generate", action="store_true", help="Generate embeddings from the current folder")
    parser.add_argument("--query", action="store_true", help="Query existing embeddings")
    parser.add_argument("--folder", default=".", help="Folder to generate embeddings from")
    parser.add_argument("--file", default="embeddings.jsonl", help="Embeddings file to use")
    
    args = parser.parse_args()

    if args.generate:
        generate_embeddings(args.folder, args.file)
    elif args.query:
        while True:
            query = input("Query: ")
            if query.lower() in {"exit", "quit"}:
                break
            test_embeddings(args.file, [query])
    else:
        parser.print_help()
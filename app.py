import os
import re
import time
import json
from datetime import datetime
from functools import lru_cache
from typing import List, Dict, Any, Tuple, Optional

from flask import Flask, request, jsonify
from flask_cors import CORS

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from sentence_transformers.cross_encoder import CrossEncoder

# -----------------------------
# Config / defaults
# -----------------------------
DEFAULT_EN_TXT = "1_The_Avant-Garde_General_Counsel.txt"
DEFAULT_EN_JSON = "gc_dataset.json"
DEFAULT_TE_TXT = "1_The_Avant-Garde_General_Counsel.en.te.txt"
DEFAULT_TE_JSON = "gc_dataset_telugu.json"

RUNS_DIR = "runs"
os.makedirs(RUNS_DIR, exist_ok=True)

app = Flask(__name__)
CORS(app)

# -----------------------------
# Utility
# -----------------------------
def to_percent(value):
    """Convert float (0–1) to percentage with 2 decimal places."""
    if value is None:
        return 0.0
    return round(value * 100, 2)

def load_runs():
    """Load all run files for leaderboard."""
    runs = []
    for file in os.listdir(RUNS_DIR):
        if file.endswith(".json"):
            try:
                with open(os.path.join(RUNS_DIR, file), "r", encoding="utf-8") as f:
                    data = json.load(f)
                    summary = data.get("summary", {})
                    runs.append({
                        "id": file.replace(".json", ""),
                        "f1": summary.get("overall_avg_f1", 0.0),
                        "precision": summary.get("overall_avg_precision", 0.0),
                        "recall": summary.get("overall_avg_recall", 0.0),
                        "similarity": summary.get("overall_avg_similarity", 0.0),
                        "total_time": summary.get("total_time", 0.0),
                        "created_at": file.split("_")[-1].replace(".json", "")
                    })
            except Exception as e:
                print(f"⚠️ Error reading run {file}: {e}")
    runs.sort(key=lambda x: x["f1"], reverse=True)
    return runs

# -----------------------------
# Cached model loaders (for speed)
# -----------------------------
@lru_cache(maxsize=5)
def get_embedding_model(model_name: str):
    print(f"⚙️ Loading embedding model: {model_name}")
    return SentenceTransformer(model_name)

@lru_cache(maxsize=3)
def get_reranker_model(model_name: Optional[str]):
    if not model_name:
        return None
    print(f"⚙️ Loading reranker model: {model_name}")
    return CrossEncoder(model_name)

# -----------------------------
# Chunking Strategy
# -----------------------------
class ChunkingStrategy:
    def __init__(self, strategy_name: str, chunk_size: int, overlap: int = 50):
        self.strategy_name = strategy_name
        self.chunk_size = chunk_size
        self.overlap = overlap

# -----------------------------
# Retrieval Strategy
# -----------------------------
class RetrievalStrategy:
    def __init__(self, chunking_strategy: ChunkingStrategy,
                 embedding_model_name: str,
                 embedding_topk: int,
                 rerank_model_name: Optional[str],
                 rerank_topk: int):
        self.chunking_strategy = chunking_strategy
        self.embedding_model_name = embedding_model_name
        self.embedding_topk = embedding_topk
        self.rerank_model_name = rerank_model_name
        self.rerank_topk = rerank_topk

# -----------------------------
# Benchmark class
# -----------------------------
class RAGBenchmark:
    def __init__(self, document_path: str, benchmark_path: str,
                 embedding_model_name: str = "all-MiniLM-L6-v2",
                 reranker_model_name: Optional[str] = None):
        self.document_path = document_path
        self.benchmark_path = benchmark_path
        self.embedding_model_name = embedding_model_name
        self.reranker_model_name = reranker_model_name

        # Load models
        self.embedding_model = get_embedding_model(embedding_model_name)
        self.reranker = get_reranker_model(reranker_model_name)

        print(f"📄 Loaded document: {document_path}")
        with open(self.document_path, "r", encoding="utf-8") as f:
            self.document_text = f.read().strip()

        print(f"🧠 Loaded benchmark file: {benchmark_path}")
        with open(self.benchmark_path, "r", encoding="utf-8") as f:
            self.benchmark_data = json.load(f)

    def chunk_document(self, strategy: ChunkingStrategy) -> List[str]:
        text = self.document_text
        chunks = []
        for i in range(0, len(text), strategy.chunk_size - strategy.overlap):
            chunks.append(text[i:i + strategy.chunk_size])
        return [c.strip() for c in chunks if c.strip()]

    def retrieve(self, query: str, chunks: List[str], top_k: int) -> List[Tuple[str, float]]:
        chunk_embs = self.embedding_model.encode(chunks, convert_to_numpy=True, show_progress_bar=False)
        query_emb = self.embedding_model.encode([query], convert_to_numpy=True)
        sims = cosine_similarity(query_emb, chunk_embs)[0]
        top_idx = np.argsort(sims)[-top_k:][::-1]
        return [(chunks[i], float(sims[i])) for i in top_idx]

    def rerank(self, query: str, retrieved: List[Tuple[str, float]], top_k: int) -> List[Tuple[str, float]]:
        if not self.reranker:
            return retrieved[:top_k]
        pairs = [[query, chunk] for chunk, _ in retrieved]
        scores = self.reranker.predict(pairs)
        reranked = sorted(zip([c for c, _ in retrieved], scores), key=lambda x: x[1], reverse=True)
        return reranked[:top_k]

    def evaluate(self, retrieved_chunks: List[str], true_snippet: str) -> Tuple[float, float, float]:
        retrieved_text = " ".join(retrieved_chunks).lower()
        true_text = true_snippet.lower()
        r_tokens = retrieved_text.split()
        t_tokens = true_text.split()
        if not t_tokens or not r_tokens:
            return 0.0, 0.0, 0.0
        overlap = len(set(r_tokens) & set(t_tokens))
        recall = overlap / len(set(t_tokens))
        precision = overlap / len(set(r_tokens))
        f1 = (2 * recall * precision / (recall + precision)) if (recall + precision) else 0.0
        return recall, precision, f1

    def run_strategy(self, strategy: RetrievalStrategy) -> Dict[str, Any]:
        chunks = self.chunk_document(strategy.chunking_strategy)
        recalls, precisions, f1s, sims, latencies = [], [], [], [], []
        per_query = []

        for idx, item in enumerate(self.benchmark_data):
            query = item.get("query", "")
            labels = item.get("labels", [])
            snippet = labels[0].get("snippet", "") if labels else ""
            if not query or not snippet:
                continue

            start = time.time()
            retrieved = self.retrieve(query, chunks, strategy.embedding_topk)
            reranked = self.rerank(query, retrieved, strategy.rerank_topk)
            end = time.time()

            retrieved_chunks = [c for c, _ in reranked]
            similarity_score = float(np.mean([s for _, s in reranked])) if reranked else 0.0
            recall, precision, f1 = self.evaluate(retrieved_chunks, snippet)

            recalls.append(recall)
            precisions.append(precision)
            f1s.append(f1)
            sims.append(similarity_score)
            latencies.append(end - start)

            per_query.append({
                "query": query,
                "recall": recall,
                "precision": precision,
                "f1": f1,
                "similarity": similarity_score,
            })

        return {
            "avg_recall": np.mean(recalls) if recalls else 0.0,
            "avg_precision": np.mean(precisions) if precisions else 0.0,
            "avg_f1": np.mean(f1s) if f1s else 0.0,
            "avg_similarity": np.mean(sims) if sims else 0.0,
            "avg_latency": np.mean(latencies) if latencies else 0.0,
            "per_query": per_query
        }

# -----------------------------
# Routes
# -----------------------------
@app.route("/status", methods=["GET"])
def status():
    return jsonify({"status": "ok"})

@app.route("/leaderboard", methods=["GET"])
def leaderboard():
    runs = load_runs()
    return jsonify({"leaderboard": runs})

@app.route("/run", methods=["POST"])
def run():
    cfg = request.json or {}
    chunk_strategy_name = cfg.get("chunk_strategy", "naive")
    chunk_size = int(cfg.get("chunk_size", 500))
    overlap = int(cfg.get("overlap", 50))
    embedding_model_name = cfg.get("embedding_model", "all-MiniLM-L6-v2")
    reranker_model_name = cfg.get("reranker_model", None)
    top_k = int(cfg.get("top_k", 5))

    cs = ChunkingStrategy(chunk_strategy_name, chunk_size, overlap)
    retrieval_en = RetrievalStrategy(cs, embedding_model_name, top_k, reranker_model_name, top_k)

    print("🏁 Running English benchmark...")
    bench_en = RAGBenchmark(DEFAULT_EN_TXT, DEFAULT_EN_JSON, embedding_model_name, reranker_model_name)
    res_en = bench_en.run_strategy(retrieval_en)

    print("\n🏁 Running Telugu benchmark...")
    retrieval_te = RetrievalStrategy(cs, "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                                     top_k, reranker_model_name, top_k)
    bench_te = RAGBenchmark(DEFAULT_TE_TXT, DEFAULT_TE_JSON,
                            "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                            reranker_model_name)
    res_te = bench_te.run_strategy(retrieval_te)

    result = {
        "summary": {
            "overall_avg_recall": to_percent((res_en["avg_recall"] + res_te["avg_recall"]) / 2),
            "overall_avg_precision": to_percent((res_en["avg_precision"] + res_te["avg_precision"]) / 2),
            "overall_avg_f1": to_percent((res_en["avg_f1"] + res_te["avg_f1"]) / 2),
            "overall_avg_similarity": to_percent((res_en["avg_similarity"] + res_te["avg_similarity"]) / 2),
            "total_time": round(res_en["avg_latency"] + res_te["avg_latency"], 3)
        },
        "english": {
            "summary": {
                "avg_recall": to_percent(res_en["avg_recall"]),
                "avg_precision": to_percent(res_en["avg_precision"]),
                "avg_f1": to_percent(res_en["avg_f1"]),
                "avg_similarity": to_percent(res_en["avg_similarity"]),
                "avg_latency": round(res_en["avg_latency"], 3)
            },
            "per_query": [
                {
                    "query": pq["query"],
                    "recall": to_percent(pq["recall"]),
                    "precision": to_percent(pq["precision"]),
                    "f1": to_percent(pq["f1"]),
                    "similarity": to_percent(pq["similarity"]),
                }
                for pq in res_en["per_query"]
            ]
        },
        "telugu": {
            "summary": {
                "avg_recall": to_percent(res_te["avg_recall"]),
                "avg_precision": to_percent(res_te["avg_precision"]),
                "avg_f1": to_percent(res_te["avg_f1"]),
                "avg_similarity": to_percent(res_te["avg_similarity"]),
                "avg_latency": round(res_te["avg_latency"], 3)
            },
            "per_query": [
                {
                    "query": pq["query"],
                    "recall": to_percent(pq["recall"]),
                    "precision": to_percent(pq["precision"]),
                    "f1": to_percent(pq["f1"]),
                    "similarity": to_percent(pq["similarity"]),
                }
                for pq in res_te["per_query"]
            ]
        }
    }

    run_id = f"run_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(os.path.join(RUNS_DIR, run_id), "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"💾 Saved run → {run_id}")
    return jsonify(result)

# -----------------------------
# Run server
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860, debug=True)

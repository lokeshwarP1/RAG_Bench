import React, { useState } from "react";

export default function ModelSelector({ onRun }) {
  const [config, setConfig] = useState({
    chunk_strategy: "naive",
    chunk_size: 500,
    overlap: 50,
    embedding_model: "all-MiniLM-L6-v2",
    reranker_model: "None",
    top_k: 5,
  });

  const handleChange = (key, value) => setConfig({ ...config, [key]: value });

  const embeddingModels = [
    "all-MiniLM-L6-v2",
    "paraphrase-MiniLM-L3-v2",
    "all-mpnet-base-v2",
    "sentence-transformers/gte-small",
    "intfloat/e5-small-v2",
  ];

  const rerankerModels = [
    "None",
    "cross-encoder/ms-marco-MiniLM-L-6-v2",
    "cross-encoder/ms-marco-MiniLM-L-12-v2",
    "cross-encoder/ms-marco-TinyBERT-L-2-v2",
  ];

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-3 text-gray-800">
        Model & Parameters
      </h2>

      <div className="space-y-3">
        {/* Chunk Strategy */}
        <div>
          <label className="block text-sm font-medium">Chunk Strategy</label>
          <select
            value={config.chunk_strategy}
            onChange={(e) => handleChange("chunk_strategy", e.target.value)}
            className="border rounded-md p-2 w-full"
          >
            <option value="naive">Naive</option>
            <option value="rcts">RCTS</option>
            <option value="semantic">Semantic</option>
          </select>
        </div>

        {/* Chunk Size */}
        <div>
          <label className="block text-sm font-medium">Chunk Size</label>
          <input
            type="number"
            value={config.chunk_size}
            onChange={(e) => handleChange("chunk_size", e.target.value)}
            className="border rounded-md p-2 w-full"
          />
        </div>

        {/* Overlap */}
        <div>
          <label className="block text-sm font-medium">Overlap</label>
          <input
            type="number"
            value={config.overlap}
            onChange={(e) => handleChange("overlap", e.target.value)}
            className="border rounded-md p-2 w-full"
          />
        </div>

        {/* Top-K */}
        <div>
          <label className="block text-sm font-medium">Top-K</label>
          <input
            type="number"
            value={config.top_k}
            onChange={(e) => handleChange("top_k", e.target.value)}
            className="border rounded-md p-2 w-full"
          />
        </div>

        {/* Embedding Model */}
        <div>
          <label className="block text-sm font-medium">Embedding Model</label>
          <select
            value={config.embedding_model}
            onChange={(e) => handleChange("embedding_model", e.target.value)}
            className="border rounded-md p-2 w-full"
          >
            {embeddingModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Reranker Model */}
        <div>
          <label className="block text-sm font-medium">Reranker Model</label>
          <select
            value={config.reranker_model}
            onChange={(e) => handleChange("reranker_model", e.target.value)}
            className="border rounded-md p-2 w-full"
          >
            {rerankerModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Run Button */}
        <button
          onClick={() =>
            onRun({
              ...config,
              reranker_model:
                config.reranker_model === "None" ? null : config.reranker_model,
            })
          }
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 w-full mt-3"
        >
          Run Benchmark
        </button>
      </div>
    </div>
  );
}

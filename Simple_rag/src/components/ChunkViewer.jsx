import React from "react";

export default function ChunkViewer({ chunks }) {
  if (!chunks?.length) return null;
  return (
    <div className="mt-4 bg-white rounded-2xl shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2">Document Chunks</h2>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {chunks.map((c, i) => (
          <div key={i} className="p-2 bg-gray-50 rounded border">
            <strong>Chunk {i + 1}</strong>
            <p className="text-sm">{c}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

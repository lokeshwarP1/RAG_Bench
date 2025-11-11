import React from "react";

export default function PerQueryTable({ english, telugu }) {
  if ((!english?.per_query?.length) && (!telugu?.per_query?.length)) return null;

  return (
    <div className="mt-6 space-y-8">
      <h3 className="text-2xl font-bold text-center mb-4">Per-Query Results</h3>

      {/* English */}
      {english?.per_query?.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-2 text-blue-700">🇬🇧 English Queries</h4>
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Query</th>
                <th className="border px-2 py-1">Recall</th>
                <th className="border px-2 py-1">Precision</th>
                <th className="border px-2 py-1">F1</th>
                <th className="border px-2 py-1">Similarity</th>
              </tr>
            </thead>
            <tbody>
              {english.per_query.map((q, i) => (
                <tr key={`en-${i}`}>
                  <td className="border px-2 py-1">{q.query}</td>
                  <td className="border px-2 py-1">{q.recall.toFixed(3)}</td>
                  <td className="border px-2 py-1">{q.precision.toFixed(3)}</td>
                  <td className="border px-2 py-1">{q.f1.toFixed(3)}</td>
                  <td className="border px-2 py-1">{q.similarity.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Telugu */}
      {telugu?.per_query?.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-2 text-green-700">🇮🇳 Telugu Queries</h4>
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">ప్రశ్న (Query)</th>
                <th className="border px-2 py-1">Recall</th>
                <th className="border px-2 py-1">Precision</th>
                <th className="border px-2 py-1">F1</th>
                <th className="border px-2 py-1">Similarity</th>
              </tr>
            </thead>
            <tbody>
              {telugu.per_query.map((q, i) => (
                <tr key={`te-${i}`}>
                  <td className="border px-2 py-1">{q.query}</td>
                  <td className="border px-2 py-1">{q.recall.toFixed(3)}</td>
                  <td className="border px-2 py-1">{q.precision.toFixed(3)}</td>
                  <td className="border px-2 py-1">{q.f1.toFixed(3)}</td>
                  <td className="border px-2 py-1">{q.similarity.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

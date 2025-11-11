import React from "react";

export default function SummaryCard({ summary, english, telugu }) {
  if (!summary || !english || !telugu) return null;

  const SummaryBox = ({ title, data, color }) => (
    <div className={`p-4 border rounded-xl shadow bg-white`}>
      <h4 className={`font-bold text-lg mb-2 ${color}`}>{title}</h4>
      <p>Recall: {data.avg_recall ?? data.overall_avg_recall}</p>
      <p>Precision: {data.avg_precision ?? data.overall_avg_precision}</p>
      <p>F1: {data.avg_f1 ?? data.overall_avg_f1}</p>
      <p>Similarity: {data.avg_similarity ?? data.overall_avg_similarity}</p>
      {data.avg_latency && <p>Latency: {data.avg_latency}</p>}
      {data.total_time && <p>Total Time: {data.total_time}s</p>}
    </div>
  );

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
      <SummaryBox title="🌍 Overall Summary" data={summary} color="text-gray-800" />
      <SummaryBox title="🇬🇧 English Summary" data={english} color="text-blue-700" />
      <SummaryBox title="🇮🇳 Telugu Summary" data={telugu} color="text-green-700" />
    </div>
  );
}

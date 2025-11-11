import React, { useEffect, useState } from "react";

export default function Leaderboard() {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    fetch("http://localhost:7860/leaderboard")
      .then(res => res.json())
      .then(data => setRuns(data.leaderboard || []))
      .catch(err => console.error("Failed to load leaderboard:", err));
  }, []);

  if (!runs.length) return <p>No leaderboard data yet.</p>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">🏆 Leaderboard</h2>
      <table className="min-w-full border text-sm bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Run ID</th>
            <th className="border px-2 py-1">F1 (%)</th>
            <th className="border px-2 py-1">Precision (%)</th>
            <th className="border px-2 py-1">Recall (%)</th>
            <th className="border px-2 py-1">Similarity (%)</th>
            <th className="border px-2 py-1">Time (s)</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{run.id}</td>
              <td className="border px-2 py-1">{run.f1}</td>
              <td className="border px-2 py-1">{run.precision}</td>
              <td className="border px-2 py-1">{run.recall}</td>
              <td className="border px-2 py-1">{run.similarity}</td>
              <td className="border px-2 py-1">{run.total_time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

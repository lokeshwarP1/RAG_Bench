import React, { useState } from "react";
import SummaryCard from "./SummaryTable";
import PerQueryTable from "./PerQueryTable";
import Leaderboard from "./Leaderboard";

export default function ResultTabs({ summary, english, telugu }) {
  const [activeTab, setActiveTab] = useState("summary");

  const tabs = [
    { id: "summary", label: "🌍 Summary" },
    { id: "english", label: "🇬🇧 English Results" },
    { id: "telugu", label: "🇮🇳 Telugu Results" },
    { id: "leaderboard", label: "🏆 Leaderboard" },
  ];

  return (
    <div className="mt-8">
      {/* Tabs */}
      <div className="flex justify-center space-x-4 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeTab === tab.id ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "summary" && (
          <SummaryCard summary={summary} english={english.summary} telugu={telugu.summary} />
        )}
        {activeTab === "english" && <PerQueryTable english={english} />}
        {activeTab === "telugu" && <PerQueryTable telugu={telugu} />}
        {activeTab === "leaderboard" && <Leaderboard />}
      </div>
    </div>
  );
}

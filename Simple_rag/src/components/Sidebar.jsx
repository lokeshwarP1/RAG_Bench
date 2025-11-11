import React from "react";
import { BeakerIcon, ChartBarIcon } from "@heroicons/react/24/outline";

export default function Sidebar() {
  return (
    <div className="bg-gray-900 text-white w-60 min-h-screen p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">RAG Benchmark</h1>
      <nav className="space-y-2">
        <button className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md w-full">
          <BeakerIcon className="w-5 h-5" />
          <span>Run Tests</span>
        </button>
        <button className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md w-full">
          <ChartBarIcon className="w-5 h-5" />
          <span>View Results</span>
        </button>
      </nav>
    </div>
  );
}

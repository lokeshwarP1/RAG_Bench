import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import ModelSelector from "./components/ModelSelector";
import ResultTabs from "./components/ResultTabs";
import { runBenchmark } from "./api";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async (config) => {
    setLoading(true);
    try {
      const res = await runBenchmark(config);
      console.log("🔥 Benchmark Result:", res);
      setResult(res);
    } catch (err) {
      console.error("❌ Error running benchmark:", err);
      alert("Failed to run benchmark. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Model selector area */}
          <ModelSelector onRun={handleRun} loading={loading} />

          {/* Loading state */}
          {loading && (
            <div className="text-center mt-8">
              <p className="text-blue-600 font-semibold text-lg">
                ⏳ Running English & Telugu Benchmarks...
              </p>
            </div>
          )}

          {/* Results display */}
          {result ? (
            <div className="mt-8">
              <ResultTabs
                summary={result.summary}
                english={result.english}
                telugu={result.telugu}
              />
            </div>
          ) : (
            !loading && (
              <div className="text-center mt-10 text-gray-500">
                <p>No benchmark results available yet.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

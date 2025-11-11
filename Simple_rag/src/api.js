import axios from "axios";

const API_BASE = "http://127.0.0.1:7860";

export const uploadFiles = async (document, benchmark) => {
  const formData = new FormData();
  if (document) formData.append("document", document);
  if (benchmark) formData.append("benchmark", benchmark);

  const res = await axios.post(`${API_BASE}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.uploaded;
};


export async function runBenchmark(config) {
  const res = await fetch("http://127.0.0.1:7860/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  if (!res.ok) throw new Error("API request failed");
  return await res.json();
}


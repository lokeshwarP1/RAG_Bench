import React, { useState } from "react";
import { uploadFiles } from "../api";

export default function FileUploader({ onUploadComplete }) {
  const [document, setDocument] = useState(null);
  const [benchmark, setBenchmark] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    setLoading(true);
    try {
      const uploaded = await uploadFiles(document, benchmark);
      onUploadComplete(uploaded);
    } catch (e) {
      alert("Upload failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-3">Upload Files</h2>
      <div className="space-y-3">
        <input type="file" onChange={(e) => setDocument(e.target.files[0])} />
        <input type="file" onChange={(e) => setBenchmark(e.target.files[0])} />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

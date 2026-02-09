import { useState } from "react";
import { uploadFile } from "../api/files";

export default function FileUpload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setProgress(0);

    if (!file) {
      setError("Select a file first");
      return;
    }

    try {
      await uploadFile(file, 1, setProgress);
      setFile(null);
      onUploaded(); // refresh list
    } catch (err) {
      setError(err.response?.data || "Upload failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button type="submit">Upload</button>

      {progress > 0 && <div>Uploading: {progress}%</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

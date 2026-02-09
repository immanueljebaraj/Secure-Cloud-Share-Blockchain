import { useState } from "react";
import { uploadFile } from "../api/files";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const submit = async () => {
    if (!file) return alert("Pick a file");
    const res = await uploadFile(file, 1); // ownerId = 1
    setResult(res);
  };

  return (
    <div>
      <h2>Upload File</h2>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={submit}>Upload</button>

      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}

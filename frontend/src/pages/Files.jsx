import { useEffect, useState } from "react";
import { getFiles } from "../services/api";

export default function Files() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFiles()
      .then(data => {
        console.log("FILES:", data); // IMPORTANT
        setFiles(data);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Uploaded Files</h2>

      <ul>
        {files.map(file => (
          <li key={file.id}>
            <strong>{file.filename}</strong>
            <br />
            Owner: {file.ownerId}
            <br />
            Size: {file.size} bytes
          </li>
        ))}
      </ul>
    </div>
  );
}

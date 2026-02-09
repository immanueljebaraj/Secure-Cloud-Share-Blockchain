import { useEffect, useState } from "react";
import { fetchFiles } from "./api/files";
import FileUpload from "./components/FileUpload";
import FileList from "./components/FileList";
import OwnerRequests from "./components/OwnerRequests";
import AuditLog from "./components/AuditLog";


function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = async () => {
    setLoading(true);
    const data = await fetchFiles();
    setFiles(data);
    setLoading(false);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>File Upload</h2>
      <FileUpload onUploaded={loadFiles} />

      <h2>Files</h2>
      {loading ? <p>Loading...</p> : <FileList files={files} />}
      <hr />
<OwnerRequests />
<AuditLog />
    </div>
  );
}

export default App;

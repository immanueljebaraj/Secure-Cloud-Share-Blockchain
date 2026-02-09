import { useEffect, useState, useRef } from "react";
import { fetchFiles } from "./api/files";
import FileUpload from "./components/FileUpload";
import FileList from "./components/FileList";
import OwnerRequests from "./components/OwnerRequests";
import AuditLog from "./components/AuditLog";
import UserSwitcher from "./components/UserSwitcher";
import { setUserHeaders } from "./api/axios";


function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ id: 1, role: "OWNER" });
  const ownerRequestsRef = useRef(null);
  const auditLogRef = useRef(null);


  const loadFiles = async () => {
    setLoading(true);
    const data = await fetchFiles();
    setFiles(data);
    setLoading(false);
  };

  const loadRequests = async () => {
    if (ownerRequestsRef.current) {
      await ownerRequestsRef.current.loadRequests();
    }
  };

  const loadAudit = async () => {
    if (auditLogRef.current) {
      await auditLogRef.current.loadAudit();
    }
  };

  useEffect(() => {
    setUserHeaders(user);
  }, [user]);
  
  useEffect(() => {
    loadFiles();
  }, []);


  return (
    <div style={{ padding: "1rem" }}>
      <h2>Cloud Secure File Sharing</h2>
  
      {/* USER CONTEXT */}
      <UserSwitcher user={user} setUser={setUser} />
      <hr />
  
      <h2>File Upload</h2>
      <FileUpload onUploaded={loadFiles} />
  
      <h2>Files</h2>
      {loading ? <p>Loading...</p> : <FileList files={files} onRequestsUpdate={loadRequests} onAuditUpdate={loadAudit} />}
  
      <hr />
      <OwnerRequests ref={ownerRequestsRef} onAuditUpdate={loadAudit} />
      <AuditLog ref={auditLogRef} />
    </div>
  );
  
}

export default App;

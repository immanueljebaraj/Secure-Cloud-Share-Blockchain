import { requestAccess } from "../api/requests";

export default function FileList({ files, onRequestsUpdate, onAuditUpdate }) {
  const requesterId = 2; // demo vendor

  const loadRequests = async () => {
    if (onRequestsUpdate) {
      await onRequestsUpdate();
    }
  };

  const loadAudit = async () => {
    if (onAuditUpdate) {
      await onAuditUpdate();
    }
  };

  const handleRequest = async (fileId) => {
    const reason = prompt("Reason for access?");
    if (!reason) return;

    await requestAccess(fileId, reason);
    await loadRequests();
    await loadAudit();
    alert("Access request sent");
  };

  return (
    <ul>
      {files.map((f) => (
        <li key={f.id} style={{ marginBottom: "1rem" }}>
          <strong>{f.filename}</strong>
          <br />
          Owner: {f.ownerId}
          <br />
          <button onClick={() => handleRequest(f.id)}>
            Request Access
          </button>
        </li>
      ))}
    </ul>
  );
}

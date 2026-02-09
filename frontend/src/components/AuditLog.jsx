import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { fetchAuditLogs } from "../api/audit";

const AuditLog = forwardRef((props, ref) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAudit = async () => {
    const data = await fetchAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  useImperativeHandle(ref, () => ({
    loadAudit
  }));

  useEffect(() => {
    loadAudit();
  }, []);

  if (loading) return <p>Loading audit logs…</p>;

  return (
    <div>
      <h3>Audit Trail</h3>

      {logs.length === 0 && <p>No audit entries.</p>}

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>ID</th>
            <th>Action</th>
            <th>File</th>
            <th>User</th>
            <th>Time</th>
            <th>Tx Hash</th>
            <th>Block</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.action}</td>
              <td>{l.fileId}</td>
              <td>{l.userId}</td>
              <td>{new Date(l.createdAt).toLocaleString()}</td>
              <td style={{ maxWidth: 200, wordBreak: "break-all" }}>
                {l.txHash || "—"}
              </td>
              <td>{l.blockNumber ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

AuditLog.displayName = "AuditLog";

export default AuditLog;

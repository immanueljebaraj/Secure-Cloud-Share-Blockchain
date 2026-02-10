import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import {
  fetchOwnerRequests,
  approveRequest,
  rejectRequest
} from "../api/requests";

const OwnerRequests = forwardRef(({ onAuditUpdate, user }, ref) => {
  const ownerId = 1;
  const [requests, setRequests] = useState([]);

  const loadRequests = async () => {
    const data = await fetchOwnerRequests(ownerId);
    setRequests(data);
  };

  const loadAudit = async () => {
    if (onAuditUpdate) {
      await onAuditUpdate();
    }
  };

  useImperativeHandle(ref, () => ({
    loadRequests
  }));

  useEffect(() => {
    loadRequests();
  }, []);

  const approve = async (id) => {
    await approveRequest(id);
    await loadRequests();
    await loadAudit();
  };

  const reject = async (id) => {
    await rejectRequest(id, ownerId);
    await loadRequests();
    await loadAudit();
  };

  return (
    <div>
      <h3>Access Requests</h3>

      {requests.length === 0 && <p>No pending requests</p>}

      {requests.map((r) => (
        <div key={r.id} style={{ marginBottom: "1rem" }}>
          <div>File ID: {r.fileId}</div>
          <div>Requester: {r.requesterId}</div>
          <div>Status: {r.status}</div>

          {r.status === "PENDING" && (
            <>
              <button onClick={() => approve(r.id)}>Approve</button>
              <button onClick={() => reject(r.id)}>Reject</button>
            </>
          )}

          {r.presignedUrl && (
            <div>
              <button
                type="button"
                onClick={() =>
                  window.open(
                    `http://localhost:8080/api/requests/${r.id}/download?requesterId=${user?.id}`
                  )
                }
              >
                Download
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

OwnerRequests.displayName = "OwnerRequests";

export default OwnerRequests;

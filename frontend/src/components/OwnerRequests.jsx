import { useEffect, useState } from "react";
import {
  fetchOwnerRequests,
  approveRequest,
  rejectRequest
} from "../api/requests";

export default function OwnerRequests() {
  const ownerId = 1;
  const [requests, setRequests] = useState([]);

  const load = async () => {
    const data = await fetchOwnerRequests(ownerId);
    setRequests(data);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    await approveRequest(id, ownerId);
    load();
  };

  const reject = async (id) => {
    await rejectRequest(id, ownerId);
    load();
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
              <a href={r.presignedUrl} target="_blank">
                Download
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

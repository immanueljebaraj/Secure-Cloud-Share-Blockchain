// src/api/requests.js
import api from './axios';

/* ── VENDOR ─────────────────────────────────────────────────────────────────
   POST /api/requests?fileId=&reason=
   requesterId is NOT a param — backend reads it from X-USER-ID header.
*/
export const requestAccess = async ({ fileId, reason }) => {
  const res = await api.post('/requests', null, {
    params: { fileId, reason },
  });
  return res.data;
};

export const fetchVendorRequests = async (requesterId) => {
  const res = await api.get(`/requests/requester/${requesterId}`);
  return res.data;
};

/* ── OWNER ──────────────────────────────────────────────────────────────────
   POST /api/requests/{id}/approve
   POST /api/requests/{id}/reject
   approverId is NOT a param — backend reads it from X-USER-ID header.
*/
export const fetchOwnerRequests = async (ownerId) => {
  const res = await api.get(`/requests/owner/${ownerId}`);
  return res.data;
};

export const approveRequest = async (requestId) => {
  const res = await api.post(`/requests/${requestId}/approve`);
  return res.data;
};

export const rejectRequest = async (requestId) => {
  const res = await api.post(`/requests/${requestId}/reject`);
  return res.data;
};

/* ── DOWNLOAD ───────────────────────────────────────────────────────────────
   GET /api/requests/{id}/download?requesterId=
   Returns 302 redirect to pre-signed MinIO URL.
   Open in new tab rather than using axios (redirect handling).
*/
export const getDownloadUrl = (requestId, requesterId) => {
  // Uses relative path — Vite proxy forwards to backend, no CORS issue
  return `/api/requests/${requestId}/download?requesterId=${requesterId}`;
};
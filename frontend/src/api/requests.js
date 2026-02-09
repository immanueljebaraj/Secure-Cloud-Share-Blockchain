import axios from "axios";

const API_BASE = "http://localhost:8080/api";

export const requestAccess = async (fileId, requesterId, reason) => {
  const res = await axios.post(
    `${API_BASE}/requests`,
    null,
    {
      params: { fileId, requesterId, reason }
    }
  );
  return res.data;
};

export const fetchOwnerRequests = async (ownerId) => {
  const res = await axios.get(`${API_BASE}/requests/owner/${ownerId}`);
  return res.data;
};

export const approveRequest = async (requestId, approverId) => {
  const res = await axios.post(
    `${API_BASE}/requests/${requestId}/approve`,
    null,
    { params: { approverId } }
  );
  return res.data;
};

export const rejectRequest = async (requestId, approverId) => {
  const res = await axios.post(
    `${API_BASE}/requests/${requestId}/reject`,
    null,
    { params: { approverId } }
  );
  return res.data;
};

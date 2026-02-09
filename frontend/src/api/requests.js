import api from "./axios";

export const requestAccess = async (fileId, reason) => {
  const res = await api.post(`/requests?fileId=${fileId}&reason=${encodeURIComponent(reason)}`);
  return res.data;
};

export const fetchOwnerRequests = async (ownerId) => {
  const res = await api.get(`/requests/owner/${ownerId}`);
  return res.data;
};

export const approveRequest = async (id) => {
  const res = await api.post(`/requests/${id}/approve`);
  return res.data;
};

export const rejectRequest = async (requestId, approverId) => {
  const res = await api.post(
    `/requests/${requestId}/reject`,
    null,
    { params: { approverId } }
  );
  return res.data;
};

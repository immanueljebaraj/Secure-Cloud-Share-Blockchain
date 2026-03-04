import api from "./axios";

/* =======================
   VENDOR
======================= */

export const requestAccess = async ({ fileId, requesterId, reason }) => {
  const res = await api.post(
    `/requests`,
    null,
    {
      params: {
        fileId,
        requesterId,
        reason
      }
    }
  );
  return res.data;
};

export const fetchVendorRequests = async (requesterId) => {
  const res = await api.get(`/requests/requester/${requesterId}`);
  return res.data;
};


/* =======================
   OWNER
======================= */

export const fetchOwnerRequests = async (ownerId) => {
  const res = await api.get(`/requests/owner/${ownerId}`);
  return res.data;
};

export const approveRequest = async (requestId, approverId) => {
  const res = await api.post(
    `/requests/${requestId}/approve`,
    null,
    { params: { approverId } }
  );
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

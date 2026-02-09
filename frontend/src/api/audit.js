import axios from "axios";

const API_BASE = "http://localhost:8080/api";

export const fetchAuditLogs = async () => {
  const res = await axios.get(`${API_BASE}/audit`);
  return res.data;
};

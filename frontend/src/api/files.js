import api from "./axios";

export const fetchFiles = async () => {
  const res = await api.get("/files");
  return res.data;
};

export const uploadFile = async (formData) => {
  const res = await api.post("/files", formData);
  return res.data;
};

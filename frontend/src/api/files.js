import axios from "axios";

const API_BASE = "http://localhost:8080/api";

export const fetchFiles = async () => {
  const res = await axios.get(`${API_BASE}/files`);
  return res.data;
};

export const uploadFile = async (file, ownerId = 1, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("ownerId", ownerId);

  const res = await axios.post(`${API_BASE}/files`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });

  return res.data;
};

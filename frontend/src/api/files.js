// src/api/files.js
import api from './axios';

export const fetchFiles = async () => {
  const res = await api.get('/files');
  return res.data;
};

/* uploadFile
   Backend: POST /api/files
   Params:  file (MultipartFile), ownerId (optional Long — defaults to 1 on backend)
   
   @param file      - raw File object from input/drop
   @param ownerId   - numeric owner id (from session)
   @param onProgress - optional callback (0-100)
*/
export const uploadFile = async (file, ownerId, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  if (ownerId != null) {
    formData.append('ownerId', ownerId);
  }

  const res = await api.post('/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });

  return res.data;
};
// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  // Relative base — Vite proxies /api/* → http://localhost:8080/api/*
  // No CORS preflight — browser only ever talks to localhost:5173
  baseURL: '/api',
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Reads the session from localStorage on EVERY request so headers are always
// current — even if setUserHeaders() was never called explicitly.

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('secureShareUser');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.id)   config.headers['X-USER-ID']   = user.id;
      if (user?.role) config.headers['X-USER-ROLE']  = user.role;
    }
  } catch {
    // malformed localStorage — ignore, request goes through without headers
  }
  return config;
});

// ─── Manual setter (kept for backwards compatibility) ─────────────────────────
export const setUserHeaders = (user) => {
  api.defaults.headers.common['X-USER-ID']   = user.id;
  api.defaults.headers.common['X-USER-ROLE'] = user.role;
};

export default api;
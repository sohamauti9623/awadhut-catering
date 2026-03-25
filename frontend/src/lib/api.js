import axios from 'axios';

// Ensure your .env REACT_APP_BACKEND_URL is http://localhost:5000
const API_BASE = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');

const api = axios.create({
  // Only add /api once here
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
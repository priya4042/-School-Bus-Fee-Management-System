import axios from 'axios';

/**
 * BusWay Pro - Production API Bridge
 */

// Use standard Vite env access via typed import.meta defined in vite-env.d.ts
const ENV_API_URL = import.meta.env?.VITE_API_URL;

const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const getBaseUrl = () => {
  if (ENV_API_URL) return ENV_API_URL;
  if (IS_LOCAL) return 'http://localhost:8000/api/v1';
  
  // Default to relative path if no env is found on production
  return '/api/v1'; 
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.warn("Backend connection issue. Check VITE_API_URL.");
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
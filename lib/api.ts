
import axios from 'axios';

/**
 * BusWay Pro - API Configuration
 * Fixed: Ensured baseURL always ends with / to allow relative path calls.
 */

const ENV_API_URL = import.meta.env?.VITE_API_URL;
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const getBaseUrl = () => {
  let base = '';
  
  if (ENV_API_URL) {
    base = ENV_API_URL;
  } else if (IS_LOCAL) {
    base = 'http://localhost:8000/api/v1';
  } else {
    base = '/api/v1';
  }

  // CRITICAL: Must end with / for relative paths (e.g. api.get('routes')) to work correctly
  return base.endsWith('/') ? base : `${base}/`;
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
      console.error("Backend Connection Failed. Ensure your API server is running.");
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

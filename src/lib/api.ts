import axios from 'axios';
import { ENV } from '../config/env';

export const axiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include Supabase token
axiosInstance.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await (await import('./supabase')).supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    console.error('Failed to attach auth header:', err);
  }
  return config;
});

// Add interceptor to handle empty responses
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data === null || response.data === undefined || response.data === '') {
      return { ...response, data: {} };
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const apiPost = async (module: string, action: string, body: any = {}, method: string = 'POST') => {
  try {
    if (!ENV.API_BASE_URL) {
      console.warn('[API] VITE_API_BASE_URL is not configured. Using fallback URL.');
    }
    const url = action 
      ? `${ENV.API_BASE_URL}/api/${module}/${action}`
      : `${ENV.API_BASE_URL}/api/${module}`;
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await (await import('./supabase')).supabase.auth.getSession()).data.session?.access_token || ''}`
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
    });

    console.log(`[API] Response status: ${response.status} for ${url}`);

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error(`[API] Error parsing JSON for ${url}:`, e);
      throw new Error('Server returned an invalid JSON response');
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || data.code || `API request failed with status ${response.status}`;
      console.error(`[API] Error response for ${url}:`, data);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${module}/${action}]:`, error);
    throw error;
  }
};


export const api = {
  get: async (url: string, config?: any) => {
    let targetUrl = url.startsWith('/') ? url : `/${url}`;
    
    if (targetUrl === '/reports/defaulters') targetUrl = '/fees/defaulters';
    if (targetUrl === '/dues') targetUrl = '/fees/dues';
    if (targetUrl === '/stats') targetUrl = '/dashboard/stats';
    
    return axiosInstance.get(`/api${targetUrl}`, config);
  },
  post: async (url: string, data?: any, config?: any) => {
    // Handle both /payments/create-order and payments/create-order
    let targetUrl = url.startsWith('/') ? url : `/${url}`;
    
    return axiosInstance.post(`/api${targetUrl}`, data, config);
  },
  put: async (url: string, data?: any, config?: any) => {
    const targetUrl = url.startsWith('/') ? url : `/${url}`;
    return axiosInstance.put(`/api${targetUrl}`, data, config);
  },
  delete: async (url: string, config?: any) => {
    const targetUrl = url.startsWith('/') ? url : `/${url}`;
    return axiosInstance.delete(`/api${targetUrl}`, config);
  }
};

export default api;

import axios, { AxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';
import { supabase } from './supabase';
import type { InternalAxiosRequestConfig } from 'axios';

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Supabase token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        // Axios 1.x: use set() for headers
        config.headers?.set?.('Authorization', `Bearer ${session.access_token}`);
      }
    } catch (err) {
      console.error('[API] Failed to attach auth token:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle empty or non-JSON responses
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data === null || response.data === undefined || response.data === '') {
      return { ...response, data: {} };
    }
    return response;
  },
  (error) => {
    console.error('[API] Axios response error:', error);
    return Promise.reject(error);
  }
);

// Generic API POST/GET wrapper using fetch
export const apiPost = async (
  module: string,
  action: string,
  body: any = {},
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' = 'POST'
) => {
  try {
    if (!ENV.API_BASE_URL) {
      console.warn('[API] API_BASE_URL is not configured.');
    }

    let baseUrl = ENV.API_BASE_URL.replace(/\/$/, '');
    if (baseUrl.endsWith('/api')) baseUrl = baseUrl.slice(0, -4);
    const url = action ? `${baseUrl}/api/${module}/${action}` : `${baseUrl}/api/${module}`;

    console.log(`[API] Requesting ${method} ${url}`);

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
    }).finally(() => window.clearTimeout(timeoutId));

    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Server returned invalid JSON');
      }
    } else {
      const text = await response.text();
      console.error(`[API] Non-JSON response for ${url}:`, text.substring(0, 200));
      throw new Error(`Server returned non-JSON response: ${response.status}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || data.code || `API failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the server. Check CORS or server status.');
    }
    throw error;
  }
};

// High-level API wrapper using axiosInstance
export const api = {
  get: async (url: string, config?: any) => {
    const targetUrl = url.startsWith('/') ? url : `/${url}`;
    return axiosInstance.get(`/api${targetUrl}`, config);
  },
  post: async (url: string, data?: any, config?: any) => {
    const targetUrl = url.startsWith('/') ? url : `/${url}`;
    return axiosInstance.post(`/api${targetUrl}`, data, config);
  },
  put: async (url: string, data?: any, config?: any) => {
    const targetUrl = url.startsWith('/') ? url : `/${url}`;
    return axiosInstance.put(`/api${targetUrl}`, data, config);
  },
  delete: async (url: string, config?: any) => {
    const targetUrl = url.startsWith('/') ? url : `/${url}`;
    return axiosInstance.delete(`/api${targetUrl}`, config);
  },
};

export default api;
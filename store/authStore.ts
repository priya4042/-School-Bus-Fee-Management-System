import { create } from 'zustand';
import { User, UserRole } from '../types';
import axios from 'axios';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  init: () => Promise<void>;
  loginWithOtp: (phone: string, otp: string) => Promise<void>;
  loginWithCredentials: (identifier: string, password?: string, type?: 'EMAIL' | 'ADMISSION') => Promise<void>;
  registerAdmin: (data: any) => Promise<void>;
  registerParent: (data: any) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Production API Base URL
const API_BASE = '/api/v1';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),

  init: async () => {
    set({ loading: true });
    try {
      const response = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
      if (response.data.user && response.data.accessToken) {
        set({ 
          user: response.data.user, 
          accessToken: response.data.accessToken,
          initialized: true, 
          loading: false 
        });
      } else {
        set({ user: null, initialized: true, loading: false });
      }
    } catch (err) {
      set({ user: null, initialized: true, loading: false });
    }
  },

  loginWithOtp: async (phone: string, otp: string) => {
    set({ loading: true });
    try {
      const response = await axios.post(`${API_BASE}/auth/verify-otp`, { phone, otp }, { withCredentials: true });
      set({ 
        user: response.data.user, 
        accessToken: response.data.accessToken,
        loading: false 
      });
    } catch (err: any) {
      set({ loading: false });
      throw new Error(err.response?.data?.error || 'Login failed');
    }
  },

  loginWithCredentials: async (identifier: string, password?: string, type?: 'EMAIL' | 'ADMISSION') => {
    set({ loading: true });
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { identifier, password, type }, { withCredentials: true });
      set({ 
        user: response.data.user, 
        accessToken: response.data.accessToken,
        loading: false 
      });
    } catch (err: any) {
      set({ loading: false });
      throw new Error(err.response?.data?.error || 'Login failed');
    }
  },

  registerAdmin: async (data: any) => {
    set({ loading: true });
    try {
      await axios.post(`${API_BASE}/auth/register-admin`, data);
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false });
      throw new Error(err.response?.data?.error || 'Admin registration failed');
    }
  },

  registerParent: async (data: any) => {
    set({ loading: true });
    try {
      await axios.post(`${API_BASE}/auth/register-parent`, data);
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false });
      throw new Error(err.response?.data?.error || 'Parent registration failed');
    }
  },

  forgotPassword: async (email: string) => {
    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email });
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to send reset link');
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      set({ user: null, accessToken: null, loading: false, initialized: true });
    }
  }
}));

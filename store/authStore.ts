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
  getPhoneForOtp: (identifier: string, type: 'PHONE' | 'ADMISSION') => Promise<string>;
  loginWithOtp: (identifier: string, type: 'PHONE' | 'ADMISSION') => Promise<any>;
  loginWithCredentials: (identifier: string, password?: string, type?: 'EMAIL' | 'ADMISSION' | 'PHONE' | 'ADMIN') => Promise<void>;
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
  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem('schoolBusToken', token);
    } else {
      localStorage.removeItem('schoolBusToken');
    }
    set({ accessToken: token });
  },

  init: async () => {
    // Only show loading if we don't already have a user
    const currentState = useAuthStore.getState();
    if (!currentState.user) {
      set({ loading: true });
    }
    
    try {
      const response = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
      if (response.data.user && response.data.accessToken) {
        localStorage.setItem('schoolBusToken', response.data.accessToken);
        set({ 
          user: response.data.user, 
          accessToken: response.data.accessToken,
          initialized: true, 
          loading: false 
        });
      } else {
        localStorage.removeItem('schoolBusToken');
        set({ user: null, initialized: true, loading: false });
      }
    } catch (err) {
      // If refresh fails, only clear user if we weren't already logged in
      localStorage.removeItem('schoolBusToken');
      set({ initialized: true, loading: false });
      if (!currentState.user) {
        set({ user: null });
      }
    }
  },


  getPhoneForOtp: async (identifier: string, type: 'PHONE' | 'ADMISSION') => {
    try {
      const response = await axios.post(`${API_BASE}/auth/get-phone`, { identifier, type });
      return response.data.phone;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to fetch phone number');
    }
  },

  loginWithOtp: async (identifier: string, type: 'PHONE' | 'ADMISSION') => {
    set({ loading: true });
    try {
      const response = await axios.post(`${API_BASE}/auth/login-otp`, { identifier, type }, { withCredentials: true });
      set({ 
        user: response.data.user, 
        accessToken: response.data.accessToken,
        loading: false,
        initialized: true
      });
      return response.data.user;
    } catch (err: any) {
      set({ loading: false });
      throw new Error(err.response?.data?.error || 'Login failed');
    }
  },

  loginWithCredentials: async (identifier: string, password?: string, type?: 'EMAIL' | 'ADMISSION' | 'PHONE' | 'ADMIN') => {
    set({ loading: true });
    console.log(`Attempting login for ${identifier} via ${type}...`);
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { identifier, password, type }, { withCredentials: true });
      console.log('Login response received:', response.data);
      const { user, accessToken } = response.data;
      const authStore = useAuthStore.getState();
      authStore.setAccessToken(accessToken);
      set({ 
        user, 
        loading: false,
        initialized: true
      });
      return user;
    } catch (err: any) {
      console.error('Login error details:', err.response || err);
      set({ loading: false });
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      throw new Error(errorMessage);
    }
  },

  registerAdmin: async (data: any) => {
    set({ loading: true });
    try {
      const response = await axios.post(`${API_BASE}/auth/register-admin`, data);
      if (response.data.user && response.data.accessToken) {
        const authStore = useAuthStore.getState();
        authStore.setAccessToken(response.data.accessToken);
        set({ 
          user: response.data.user, 
          loading: false,
          initialized: true
        });
        return response.data.user;
      } else {
        set({ loading: false });
      }
    } catch (err: any) {
      set({ loading: false });
      throw new Error(err.response?.data?.error || 'Admin registration failed');
    }
  },

  registerParent: async (data: any) => {
    set({ loading: true });
    try {
      const response = await axios.post(`${API_BASE}/auth/register-parent`, data);
      if (response.data.user && response.data.accessToken) {
        const authStore = useAuthStore.getState();
        authStore.setAccessToken(response.data.accessToken);
        set({ 
          user: response.data.user, 
          loading: false,
          initialized: true
        });
        return response.data.user;
      } else {
        set({ loading: false });
      }
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

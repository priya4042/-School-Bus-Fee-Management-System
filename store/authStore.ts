import { create } from 'zustand';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { apiPost } from '../lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  init: () => Promise<void>;
  loginWithCredentials: (identifier: string, password?: string, type?: 'EMAIL' | 'ADMISSION' | 'PHONE' | 'ADMIN') => Promise<void>;
  registerAdmin: (data: any) => Promise<void>;
  registerParent: (data: any) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

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
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        set({ 
          user: profile, 
          accessToken: session.access_token,
          initialized: true, 
          loading: false 
        });
      } else {
        set({ user: null, initialized: true, loading: false });
      }
    } catch (err) {
      console.error('Init error:', err);
      set({ initialized: true, loading: false, user: null });
    }
  },

  loginWithCredentials: async (identifier: string, password?: string, type?: 'EMAIL' | 'ADMISSION' | 'PHONE' | 'ADMIN') => {
    set({ loading: true });
    try {
      // Updated to use apiPost
      const data = await apiPost('auth', 'login', { identifier, password, type });

      // The Edge Function returns the Supabase auth data (session and user)
      // We need to set the session in the local Supabase client
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      set({ 
        user: profile, 
        accessToken: data.session.access_token,
        loading: false,
        initialized: true
      });
    } catch (err: any) {
      set({ loading: false });
      throw new Error(err.message || 'Login failed');
    }
  },

  registerAdmin: async (data: any) => {
    set({ loading: true });
    try {
      // Updated to use apiPost
      await apiPost('auth', 'register', {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: UserRole.ADMIN
      });
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false });
      throw new Error(err.message || 'Admin registration failed');
    }
  },

  registerParent: async (data: any) => {
    set({ loading: true });
    try {
      // Updated to use apiPost
      await apiPost('auth', 'register', {
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        role: UserRole.PARENT,
        admission_number: data.admissionNumber
      });
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false });
      throw new Error(err.message || 'Parent registration failed');
    }
  },

  forgotPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, accessToken: null, loading: false, initialized: true });
  }
}));

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
  loginWithCredentials: (
    identifier: string,
    password?: string,
    type?: 'EMAIL' | 'ADMISSION' | 'PHONE' | 'ADMIN'
  ) => Promise<User>;
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
          user: profile || null, 
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
    if (!identifier || !password) throw new Error('Identifier and password are required');

    const payload = { identifier, password, type };

    const data = await apiPost('auth', 'login', payload);

    if (!data || !data.user || !data.session) {
      throw new Error('Login failed: Invalid server response');
    }

    // Set Supabase session
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    set({ user: data.user, accessToken: data.session.access_token, loading: false, initialized: true });

    return data.user;
  } catch (err: any) {
    console.error('Login error:', err);
    set({ loading: false });
    throw new Error(err.message || 'Login failed');
  }
},

  registerAdmin: async (data: any) => {
    set({ loading: true });
    try {
      await apiPost('auth', 'register', {
        identifier: data.email, // Backend expects `identifier`
        password: data.password,
        full_name: data.fullName,
        role: UserRole.ADMIN,
        secret: data.secret,
        phone: data.phoneNumber
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
      await apiPost('auth', 'register', {
        identifier: data.email,
        password: data.password,
        full_name: data.fullName,
        role: UserRole.PARENT,
        admission_number: data.admissionNumber,
        phone: data.phone
      });
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false });
      throw new Error(err.message || 'Parent registration failed');
    }
  },

  forgotPassword: async (email: string) => {
    if (!email) throw new Error('Email is required');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, accessToken: null, loading: false, initialized: true });
  }
}));
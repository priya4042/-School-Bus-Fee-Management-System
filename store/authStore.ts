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

    let email = identifier;

    if (type === 'ADMISSION') {
      // Parent login: find email by admission number → parent_id → profile email
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('parent_id')
        .eq('admission_number', identifier.trim())
        .maybeSingle();

      if (studentError) throw new Error('Error looking up student. Please try again.');
      if (!student) throw new Error('Admission number not found. Please verify with school administration.');
      if (!student.parent_id) throw new Error('No parent account linked to this admission number. Please register first.');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', student.parent_id)
        .maybeSingle();

      if (profileError || !profile?.email) throw new Error('Parent account not found. Please register first.');
      email = profile.email;
    } else if (type === 'ADMIN' || type === 'PHONE') {
      // Admin login: identifier could be email or phone number
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      if (!isEmail) {
        // Look up email by phone number
        const digits = identifier.replace(/\D/g, '').slice(-10);
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .or(`phone_number.eq.${digits},phone_number.eq.+91${digits}`)
          .in('role', ['ADMIN', 'SUPER_ADMIN'])
          .maybeSingle();

        if (!profile?.email) throw new Error('Admin account not found with this phone number.');
        email = profile.email;
      }
    }

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) throw signInError;
    if (!authData.user) throw new Error('Login failed');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    const userProfile = profile || authData.user;
    set({ user: userProfile, accessToken: authData.session?.access_token || null, loading: false, initialized: true });

    return userProfile;
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
        email: data.email,
        username: data.email,
        identifier: data.email,
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
      let userId: string;

      // 1. Try to create Supabase Auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: 'PARENT',
            phone_number: data.phone,
          }
        }
      });

      if (signUpError) {
        // If already registered in Auth (partial previous attempt), sign in to recover
        const msg = signUpError.message?.toLowerCase() || '';
        if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('user already')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });
          if (signInError) throw new Error('Account already exists. Please log in with your existing password.');
          if (!signInData.user) throw new Error('Registration recovery failed.');
          userId = signInData.user.id;
        } else {
          throw signUpError;
        }
      } else {
        if (!authData.user) throw new Error('Registration failed — no user returned');
        userId = authData.user.id;
      }

      // 2. Upsert profile row
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: data.email.toLowerCase(),
        full_name: data.fullName,
        phone_number: data.phone,
        role: 'PARENT',
      });
      if (profileError) throw profileError;

      // 3. Link student to parent profile
      await supabase
        .from('students')
        .update({ parent_id: userId })
        .eq('admission_number', data.admissionNumber)
        .is('parent_id', null);

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
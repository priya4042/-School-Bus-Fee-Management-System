import { create } from 'zustand';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { ENV } from '../config/env';

const normalizeRole = (role?: string | null): UserRole => {
  const value = (role || '').toUpperCase();
  if (value === UserRole.SUPER_ADMIN) return UserRole.SUPER_ADMIN;
  if (value === UserRole.ADMIN) return UserRole.ADMIN;
  return UserRole.PARENT;
};

const normalizeProfile = (profile: any) => ({
  ...profile,
  role: normalizeRole(profile.role),
  fullName: profile.full_name,
  phoneNumber: profile.phone_number,
  admissionNumber: profile.admission_number,
  avatar_url: profile.avatar_url || profile.preferences?.avatar_url,
});

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

        const normalizedProfile = profile ? normalizeProfile(profile) : null;

        set({ 
          user: normalizedProfile || null,
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
      if (!student) throw new Error('Admission number not found. Please verify with Bus Administration.');
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

        if (!profile?.email) throw new Error('Admin account not found with this phone number. Please register as an admin.');
        email = profile.email;
      }
    }

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // Provide specific error messages
      if (signInError.message?.includes('Invalid login credentials') || signInError.message?.includes('401')) {
        throw new Error(`Incorrect password for ${email}. If you have forgotten your password, please reset it.`);
      }
      if (signInError.message?.includes('User not found')) {
        throw new Error(`No account found for ${email}. Please register first.`);
      }
      throw signInError;
    }
    if (!authData.user) throw new Error('Login failed');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    const userProfile = profile
      ? normalizeProfile(profile)
      : {
          ...(authData.user as any),
          role: normalizeRole((authData.user as any)?.user_metadata?.role),
        };

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
      let userId: string;

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) {
        const msg = signUpError.message?.toLowerCase() || '';
        if (
          msg.includes('already registered') ||
          msg.includes('already been registered') ||
          msg.includes('user already') ||
          msg.includes('database error saving new user')
        ) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

          if (signInError || !signInData.user) {
            throw new Error('Admin account already exists. Please log in with existing credentials or reset password.');
          }

          userId = signInData.user.id;
        } else {
          throw signUpError;
        }
      } else {
        if (!authData.user) throw new Error('Admin registration failed — no user returned');
        userId = authData.user.id;
      }

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: data.email.toLowerCase(),
        full_name: data.fullName,
        phone_number: data.phoneNumber || null,
        role: 'ADMIN',
      });

      if (profileError) throw profileError;

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
      // Keep signUp payload minimal to avoid DB trigger/metadata conflicts.
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      });

      if (signUpError) {
        // If already registered in Auth (partial previous attempt), sign in to recover
        const msg = signUpError.message?.toLowerCase() || '';
        if (
          msg.includes('already registered') ||
          msg.includes('already been registered') ||
          msg.includes('user already') ||
          msg.includes('database error saving new user')
        ) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });
          if (signInError) {
            if (msg.includes('database error saving new user')) {
              throw new Error('Registration is blocked by a database/auth trigger issue. Please contact admin to check Supabase Auth trigger/policies.');
            }
            throw new Error('Account already exists. Please log in with your existing password.');
          }
          if (!signInData.user) throw new Error('Registration recovery failed.');
          userId = signInData.user.id;
        } else {
          throw signUpError;
        }
      } else {
        if (!authData.user) throw new Error('Registration failed — no user returned');
        userId = authData.user.id;
      }

      const normalizedAdmissionNumber = data.admissionNumber?.trim();

      if (normalizedAdmissionNumber) {
        const { error: clearStaleAdmissionError } = await supabase
          .from('profiles')
          .update({ admission_number: null })
          .eq('admission_number', normalizedAdmissionNumber)
          .neq('id', userId);

        if (clearStaleAdmissionError) throw clearStaleAdmissionError;
      }

      // 2. Upsert profile row
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: data.email.toLowerCase(),
        full_name: data.fullName,
        phone_number: data.phone,
        admission_number: normalizedAdmissionNumber,
        role: 'PARENT',
      });
      if (profileError) throw profileError;

      // 3. Link student to parent profile
      const { data: linkedStudents, error: linkError } = await supabase
        .from('students')
        .update({ parent_id: userId })
        .eq('admission_number', normalizedAdmissionNumber)
        .select('id, parent_id');

      if (linkError) throw linkError;
      if (!linkedStudents || linkedStudents.length === 0) {
        throw new Error('Admission number not found for linking. Please contact Bus Administration.');
      }

      const currentProfile = {
        id: userId,
        email: data.email.toLowerCase(),
        full_name: data.fullName,
        fullName: data.fullName,
        phone_number: data.phone,
        phoneNumber: data.phone,
        admission_number: normalizedAdmissionNumber,
        admissionNumber: normalizedAdmissionNumber,
        role: UserRole.PARENT,
      } as unknown as User;

      set({ user: currentProfile, loading: false, initialized: true });

    } catch (err: any) {
      set({ loading: false });
      throw new Error(err.message || 'Parent registration failed');
    }
  },

  forgotPassword: async (email: string) => {
    if (!email) throw new Error('Email is required');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: ENV.AUTH_REDIRECT_URL,
      });
      
      if (error) {
        // If email service not configured (404), provide helpful error
        if (error.message?.includes('404') || error.message?.includes('NOT_FOUND')) {
          throw new Error('Email service not configured. Please use the Phone-based OTP method instead.');
        }
        throw error;
      }
    } catch (err: any) {
      if (err.message?.includes('404') || err.message?.includes('NOT_FOUND')) {
        throw new Error('Email service not configured. Please use Phone-based OTP method to reset your password.');
      }
      throw err;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, accessToken: null, loading: false, initialized: true });
  }
}));
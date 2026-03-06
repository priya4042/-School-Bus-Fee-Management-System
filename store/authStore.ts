import { create } from 'zustand';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

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
      let email = identifier;
      if (type === 'ADMISSION') {
        const admission = identifier.trim();
        console.log("Searching admission:", admission);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, admission_number')
          .eq('admission_number', admission)
          .maybeSingle();
        
        console.log("Supabase response:", profile);
        
        if (profileError) {
          console.error("Supabase query error:", profileError);
          throw new Error('Database error during login');
        }
        
        if (!profile) {
          throw new Error('Admission number not found');
        }
        
        if (!profile.email) {
          throw new Error('Please register first');
        }
        
        email = profile.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || '',
      });

      if (error) throw error;

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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          email: data.email,
          role: UserRole.ADMIN,
          full_name: data.full_name,
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
      const admission = data.admissionNumber.trim();

      // 1. Check if admission_number exists in profiles table with role='PARENT'
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('admission_number', admission)
        .eq('role', UserRole.PARENT)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error("Invalid admission number. Please contact school admin.");

      // 2. Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create authentication account.");

      // 3. Link the auth user to the existing profile
      // We'll update the existing profile record with the new auth ID
      // If the ID is the primary key, we might need to delete and re-insert or just update if allowed
      // Most Supabase setups use UUID as PK. We'll try to update the ID first.
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName || profile.full_name,
          phone_number: data.phone,
          updated_at: new Date().toISOString()
        })
        .eq('admission_number', admission);
      
      if (updateError) {
        console.error("Profile link error:", updateError);
        // Fallback: If update ID fails, try to insert a new profile and delete old one
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName || profile.full_name,
            phone_number: data.phone,
            role: UserRole.PARENT,
            admission_number: admission
          });
        
        if (insertError) throw insertError;
        
        // Delete the old placeholder profile
        await supabase.from('profiles').delete().eq('admission_number', admission).neq('id', authData.user.id);
      }

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


import { create } from 'zustand';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  loginLocal: (user: User) => void;
  init: () => Promise<void>;
  logout: () => Promise<void>;
  updateActivity: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),

  loginLocal: (user: User) => {
    // Persist session across refreshes
    localStorage.setItem('active_session', JSON.stringify(user));
    set({ user, initialized: true, loading: false });
  },

  init: async () => {
    set({ loading: true });
    
    // Simulate initial platform check
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const session = localStorage.getItem('active_session');
    if (session) {
      try {
        const user = JSON.parse(session);
        set({ user, initialized: true, loading: false });
      } catch (e) {
        localStorage.removeItem('active_session');
        set({ user: null, initialized: true, loading: false });
      }
    } else {
      set({ user: null, initialized: true, loading: false });
    }
  },

  logout: async () => {
    localStorage.removeItem('active_session');
    set({ 
      user: null, 
      loading: false, 
      initialized: true 
    });
  },

  updateActivity: () => {
    // Optional: Update last seen timestamp in virtual DB
  }
}));

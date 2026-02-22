
import { create } from 'zustand';

interface LoadingState {
  globalLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  globalLoading: false,
  loadingMessage: 'Initializing System...',
  setLoading: (loading, message = 'Initializing System...') => 
    set({ globalLoading: loading, loadingMessage: message }),
}));

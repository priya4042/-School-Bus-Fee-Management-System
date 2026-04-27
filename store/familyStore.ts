import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface FamilyChild {
  id: string;
  full_name: string;
  admission_number?: string;
  grade?: string;
  section?: string;
  bus_id?: string;
  route_id?: string;
}

interface FamilyState {
  children: FamilyChild[];
  selectedChildId: string | null;
  loading: boolean;
  loadFamily: (parentId: string) => Promise<void>;
  selectChild: (id: string) => void;
  clear: () => void;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      children: [],
      selectedChildId: null,
      loading: false,

      loadFamily: async (parentId: string) => {
        if (!parentId) return;
        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from('students')
            .select('id, full_name, admission_number, grade, section, bus_id, route_id')
            .eq('parent_id', parentId)
            .order('full_name', { ascending: true });
          if (error) throw error;
          const children = (data || []) as FamilyChild[];
          const current = get().selectedChildId;
          const stillValid = current && children.some((c) => c.id === current);
          set({
            children,
            selectedChildId: stillValid ? current : children[0]?.id || null,
          });
        } catch (err) {
          console.warn('Failed to load family children:', err);
        } finally {
          set({ loading: false });
        }
      },

      selectChild: (id: string) => set({ selectedChildId: id }),

      clear: () => set({ children: [], selectedChildId: null, loading: false }),
    }),
    {
      name: 'busway_family_v1',
      partialize: (state) => ({ selectedChildId: state.selectedChildId }),
    }
  )
);

export const useSelectedChild = (): FamilyChild | null => {
  const { children, selectedChildId } = useFamilyStore();
  return children.find((c) => c.id === selectedChildId) || null;
};

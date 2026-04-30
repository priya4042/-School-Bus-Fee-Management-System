import { supabase } from '../lib/supabase';

export type ExpenseType = 'fuel' | 'service' | 'repair' | 'insurance' | 'permit' | 'other';

export const EXPENSE_TYPE_OPTIONS: Array<{ key: ExpenseType; label: string; icon: string; color: string }> = [
  { key: 'fuel',      label: 'Fuel',      icon: 'fa-gas-pump',      color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'service',   label: 'Service',   icon: 'fa-wrench',        color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'repair',    label: 'Repair',    icon: 'fa-screwdriver',   color: 'bg-red-50 text-red-700 border-red-200' },
  { key: 'insurance', label: 'Insurance', icon: 'fa-shield-alt',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'permit',    label: 'Permit',    icon: 'fa-file-contract', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'other',     label: 'Other',     icon: 'fa-receipt',       color: 'bg-slate-50 text-slate-700 border-slate-200' },
];

export interface BusExpenseRow {
  id: string;
  bus_id: string | null;
  expense_type: ExpenseType;
  amount: number;
  fuel_litres?: number | null;
  notes?: string | null;
  date: string;
  recorded_by?: string | null;
  created_at: string;
  // joined
  buses?: { bus_number?: string; plate?: string } | null;
}

export interface AddExpenseInput {
  busId: string | null;
  expenseType: ExpenseType;
  amount: number;
  fuelLitres?: number | null;
  notes?: string;
  date: string; // YYYY-MM-DD
  recordedBy: string;
}

export const addBusExpense = async (input: AddExpenseInput) => {
  if (!input.amount || input.amount <= 0) return { ok: false, error: 'Amount must be greater than zero' };
  if (!input.date) return { ok: false, error: 'Date required' };

  const { data, error } = await supabase
    .from('bus_expenses')
    .insert({
      bus_id: input.busId || null,
      expense_type: input.expenseType,
      amount: input.amount,
      fuel_litres: input.expenseType === 'fuel' ? (input.fuelLitres || null) : null,
      notes: input.notes?.trim() || null,
      date: input.date,
      recorded_by: input.recordedBy,
    })
    .select('id')
    .single();

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, id: data?.id };
};

export const fetchBusExpenses = async (params?: { busId?: string; from?: string; to?: string; limit?: number }) => {
  let query = supabase
    .from('bus_expenses')
    .select('*, buses(bus_number, plate)')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (params?.busId) query = query.eq('bus_id', params.busId);
  if (params?.from) query = query.gte('date', params.from);
  if (params?.to) query = query.lte('date', params.to);
  if (params?.limit) query = query.limit(params.limit);

  const { data, error } = await query;
  return { rows: (data || []) as BusExpenseRow[], error };
};

export const deleteBusExpense = async (id: string) => {
  const { error } = await supabase.from('bus_expenses').delete().eq('id', id);
  return { ok: !error, error: error?.message };
};

export interface MonthExpenseSummary {
  year: number;
  month: number; // 1-12
  totalAmount: number;
  byType: Record<ExpenseType, number>;
  totalFuelLitres: number;
}

export const summarizeExpensesByMonth = (rows: BusExpenseRow[]): MonthExpenseSummary[] => {
  const map = new Map<string, MonthExpenseSummary>();
  for (const r of rows) {
    const d = new Date(r.date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${month}`;
    let entry = map.get(key);
    if (!entry) {
      entry = {
        year, month, totalAmount: 0, totalFuelLitres: 0,
        byType: { fuel: 0, service: 0, repair: 0, insurance: 0, permit: 0, other: 0 },
      };
      map.set(key, entry);
    }
    entry.totalAmount += Number(r.amount || 0);
    entry.byType[r.expense_type] = (entry.byType[r.expense_type] || 0) + Number(r.amount || 0);
    if (r.expense_type === 'fuel') entry.totalFuelLitres += Number(r.fuel_litres || 0);
  }
  return Array.from(map.values()).sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month));
};

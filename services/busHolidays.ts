import { supabase } from '../lib/supabase';

export interface BusHolidayRow {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string | null;
  created_by: string | null;
  created_at: string;
}

/** Fetch holidays in a date range (inclusive). */
export const fetchHolidays = async (from: string, to: string): Promise<BusHolidayRow[]> => {
  const { data, error } = await supabase
    .from('bus_holidays')
    .select('*')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true });
  if (error) {
    console.warn('fetchHolidays failed:', error);
    return [];
  }
  return data || [];
};

/** Build a fast lookup set of YYYY-MM-DD strings for a list of holidays. */
export const buildHolidaySet = (rows: BusHolidayRow[]): Set<string> => {
  return new Set(rows.map((r) => r.date));
};

export const addHoliday = async (date: string, reason: string, adminId: string) => {
  if (!date) return { ok: false as const, error: 'Date required' };
  const { error } = await supabase.from('bus_holidays').insert({
    date,
    reason: reason.trim() || null,
    created_by: adminId,
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
};

export const removeHoliday = async (id: string) => {
  const { error } = await supabase.from('bus_holidays').delete().eq('id', id);
  return { ok: !error, error: error?.message };
};

/**
 * Bulk-add holidays from a list (e.g., school's published holiday list).
 * Skips dates that already exist.
 */
export const addHolidaysBulk = async (
  entries: Array<{ date: string; reason?: string }>,
  adminId: string,
): Promise<{ added: number; skipped: number }> => {
  if (entries.length === 0) return { added: 0, skipped: 0 };

  // Find which dates already exist
  const dates = entries.map((e) => e.date);
  const { data: existing } = await supabase
    .from('bus_holidays')
    .select('date')
    .in('date', dates);
  const existingSet = new Set((existing || []).map((r: any) => r.date));

  const toInsert = entries
    .filter((e) => !existingSet.has(e.date))
    .map((e) => ({ date: e.date, reason: e.reason?.trim() || null, created_by: adminId }));

  if (toInsert.length > 0) {
    const { error } = await supabase.from('bus_holidays').insert(toInsert);
    if (error) return { added: 0, skipped: entries.length };
  }
  return { added: toInsert.length, skipped: entries.length - toInsert.length };
};

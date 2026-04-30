import { supabase } from '../lib/supabase';

const REMINDER_WINDOW_DAYS = 3;
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

interface UpcomingDue {
  id: string;
  student_id: string;
  month: number;
  year: number;
  total_due: number;
  amount: number;
  due_date: string;
  status: string;
  students?: {
    full_name?: string;
    parent_id?: string;
  };
}

/**
 * On parent app open: scan their unpaid dues for any falling within REMINDER_WINDOW_DAYS,
 * and create one in-app notification per due-soon row (idempotently — won't spam).
 *
 * The notification carries a structured tag inside `message`:
 *   [FEE_DUE_REMINDER][DUE_ID:xxx][MONTH:May 2026][AMOUNT:1500]
 * The parent's Notifications page parses that tag and shows a "Pay Now" button
 * that opens the Fees tab with the right due preselected.
 */
export const checkAndCreateUpcomingDueReminders = async (parentId: string): Promise<number> => {
  if (!parentId) return 0;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const windowEnd = new Date(today.getTime() + REMINDER_WINDOW_DAYS * 86400000);

    // Find this parent's unpaid dues where due_date is in the next N days
    const { data, error } = await supabase
      .from('monthly_dues')
      .select('id, student_id, month, year, total_due, amount, due_date, status, students!inner(full_name, parent_id)')
      .eq('students.parent_id', parentId)
      .neq('status', 'PAID')
      .gte('due_date', today.toISOString().split('T')[0])
      .lte('due_date', windowEnd.toISOString().split('T')[0]);

    if (error || !data || data.length === 0) return 0;

    const dues = data as unknown as UpcomingDue[];

    // For each due, only insert a notification if one doesn't already exist for this dueId
    let createdCount = 0;
    for (const due of dues) {
      const tag = `[DUE_ID:${due.id}]`;
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', parentId)
        .like('message', `%${tag}%`)
        .like('message', `%[FEE_DUE_REMINDER]%`)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const studentName = String(due.students?.full_name || 'Your child');
      const monthLabel = `${MONTHS[(due.month || 1) - 1]} ${due.year}`;
      const amount = Number(due.total_due || due.amount || 0);
      const dueDate = new Date(due.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

      await supabase.from('notifications').insert({
        user_id: parentId,
        title: `Bus fee due ${dueDate}`,
        message: `[FEE_DUE_REMINDER][DUE_ID:${due.id}][MONTH:${monthLabel}][AMOUNT:${amount}] ${studentName}'s ${monthLabel} bus fee of Rs.${amount.toLocaleString('en-IN')} is due on ${dueDate}. Tap Pay Now to settle it.`,
        type: 'WARNING',
        is_read: false,
      });
      createdCount += 1;
    }

    return createdCount;
  } catch (err) {
    console.warn('checkAndCreateUpcomingDueReminders failed:', err);
    return 0;
  }
};

/** Parse the fee reminder tag back out of a notification's message. */
export interface ParsedFeeReminder {
  isFeeReminder: boolean;
  dueId?: string;
  monthLabel?: string;
  amount?: number;
}
export const parseFeeReminderTag = (message: string | null | undefined): ParsedFeeReminder => {
  const text = String(message || '');
  if (!text.includes('[FEE_DUE_REMINDER]')) return { isFeeReminder: false };
  const dueId = text.match(/\[DUE_ID:([^\]]+)\]/)?.[1];
  const monthLabel = text.match(/\[MONTH:([^\]]+)\]/)?.[1];
  const amountRaw = text.match(/\[AMOUNT:([0-9]+)\]/)?.[1];
  return {
    isFeeReminder: true,
    dueId,
    monthLabel,
    amount: amountRaw ? Number(amountRaw) : undefined,
  };
};

/** Strip the [TAGS] from the displayed message body. */
export const stripFeeReminderTags = (message: string | null | undefined): string => {
  return String(message || '').replace(/\[FEE_DUE_REMINDER\]\s*/g, '').replace(/\[(DUE_ID|MONTH|AMOUNT):[^\]]+\]\s*/g, '').trim();
};

import { supabase } from '../lib/supabase';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export interface BulkReminderResult {
  sentCount: number;
  skippedCount: number;
  totalUnpaid: number;
}

/**
 * Fan out FEE_DUE_REMINDER notifications to every parent with at least one
 * unpaid (PENDING / OVERDUE) due. Idempotent per (parent, due) — won't
 * re-create if a reminder already exists for that due.
 */
export const sendBulkUnpaidReminders = async (): Promise<BulkReminderResult> => {
  // 1. Pull all unpaid dues with parent id
  const { data: dues, error } = await supabase
    .from('monthly_dues')
    .select('id, month, year, total_due, amount, due_date, status, students!inner(full_name, parent_id)')
    .neq('status', 'PAID');

  if (error || !dues) {
    return { sentCount: 0, skippedCount: 0, totalUnpaid: 0 };
  }

  const totalUnpaid = dues.length;
  let sentCount = 0;
  let skippedCount = 0;

  for (const due of dues as any[]) {
    const parentId = due.students?.parent_id;
    if (!parentId) { skippedCount += 1; continue; }

    // Skip if a fee reminder for this due already exists
    const tag = `[DUE_ID:${due.id}]`;
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', parentId)
      .like('message', `%${tag}%`)
      .like('message', '%[FEE_DUE_REMINDER]%')
      .limit(1);

    if (existing && existing.length > 0) {
      skippedCount += 1;
      continue;
    }

    const studentName = String(due.students?.full_name || 'Your child');
    const monthLabel = `${MONTHS[(due.month || 1) - 1]} ${due.year}`;
    const amount = Number(due.total_due || due.amount || 0);
    const dueDate = due.due_date ? new Date(due.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : monthLabel;

    const { error: insertErr } = await supabase.from('notifications').insert({
      user_id: parentId,
      title: `Bus fee due ${dueDate}`,
      message: `[FEE_DUE_REMINDER][DUE_ID:${due.id}][MONTH:${monthLabel}][AMOUNT:${amount}] ${studentName}'s ${monthLabel} bus fee of Rs.${amount.toLocaleString('en-IN')} is due. Tap Pay Now to settle it.`,
      type: 'WARNING',
      is_read: false,
    });

    if (insertErr) {
      skippedCount += 1;
    } else {
      sentCount += 1;
    }
  }

  return { sentCount, skippedCount, totalUnpaid };
};

export interface CashReceiptInput {
  dueId: string;
  amount: number;
  notes?: string;
  collectedAt?: string; // ISO
}

export interface CashReceiptResult {
  ok: boolean;
  error?: string;
  txnId?: string;
}

/**
 * Admin records an offline cash payment. Marks the due as PAID, inserts a
 * captured payment row with method='cash', and notifies the parent so they
 * see the receipt instantly.
 */
export const recordCashReceipt = async (
  input: CashReceiptInput,
  adminUserId: string,
): Promise<CashReceiptResult> => {
  try {
    if (!input.dueId) return { ok: false, error: 'Missing due reference' };
    if (!input.amount || input.amount <= 0) return { ok: false, error: 'Amount must be greater than zero' };

    const { data: due, error: dueErr } = await supabase
      .from('monthly_dues')
      .select('id, student_id, month, year, students(full_name, parent_id)')
      .eq('id', input.dueId)
      .single();

    if (dueErr || !due) return { ok: false, error: 'Due not found' };

    const txnId = `CASH-${Date.now().toString(36).toUpperCase()}`;
    const paidAt = input.collectedAt || new Date().toISOString();
    const studentRef: any = Array.isArray((due as any).students) ? (due as any).students[0] : (due as any).students;
    const parentId = studentRef?.parent_id;
    const studentName = studentRef?.full_name || 'Student';
    const monthLabel = `${MONTHS[((due as any).month || 1) - 1]} ${(due as any).year}`;

    // 1. Mark the due as PAID
    const { error: updateErr } = await supabase
      .from('monthly_dues')
      .update({
        status: 'PAID',
        paid_at: paidAt,
        transaction_id: txnId,
        payment_method: 'cash',
        total_due: input.amount,
      })
      .eq('id', input.dueId);

    if (updateErr) return { ok: false, error: updateErr.message };

    // 2. Insert a captured payment record so it shows in receipts/audit
    if (parentId) {
      await supabase.from('payments').insert({
        user_id: parentId,
        parent_id: parentId,
        student_id: (due as any).student_id,
        due_id: input.dueId,
        amount: input.amount,
        total_amount: input.amount,
        billing_month: input.dueId,
        utr: null,
        transaction_id: txnId,
        screenshot_url: null,
        status: 'captured',
        payment_method: 'cash',
        created_at: paidAt,
      });
    }

    // 3. Notify the parent so the receipt is visible instantly
    if (parentId) {
      await supabase.from('notifications').insert({
        user_id: parentId,
        title: 'Cash payment received',
        message: `Admin recorded a cash payment of Rs.${input.amount.toLocaleString('en-IN')} for ${studentName} (${monthLabel}). Transaction Ref: ${txnId}.${input.notes ? ` Note: ${input.notes}` : ''}`,
        type: 'SUCCESS',
        is_read: false,
      });
    }

    // 4. Audit trail (best-effort)
    try {
      await supabase.from('audit_logs').insert({
        action: 'CASH_PAYMENT_RECORDED',
        entity_type: 'monthly_dues',
        entity_id: input.dueId,
        user_id: adminUserId,
        new_data: { amount: input.amount, txn_id: txnId, method: 'cash', notes: input.notes || null },
      });
    } catch { /* table may not allow this admin role; ignore */ }

    return { ok: true, txnId };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to record cash receipt' };
  }
};

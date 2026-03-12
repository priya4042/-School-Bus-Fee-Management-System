import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sendPaymentEmails } from './emailService';

type RecordPaymentInput = {
  dueId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  source: 'verify' | 'webhook';
  eventId?: string;
};

type RecordPaymentResult = {
  ok: boolean;
  alreadyProcessed: boolean;
  dueId: string;
  transactionId: string;
};

type DueWithStudent = {
  id: string;
  student_id: string;
  month: number;
  year: number;
  amount: number | null;
  total_due: number | null;
  status: string | null;
  transaction_id: string | null;
  students?: {
    id: string;
    full_name: string | null;
    parent_id: string | null;
  } | null;
};

type ProfileEmail = {
  id: string;
  email: string | null;
};

const createAdminClient = (): SupabaseClient => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !serviceRole) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY on server');
  }

  return createClient(url, serviceRole);
};

export const verifyCheckoutSignature = (input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || '';
  if (!secret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured on server');
  }

  const generated = crypto
    .createHmac('sha256', secret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest('hex');

  return generated === input.razorpaySignature;
};

export const verifyWebhookSignature = (payload: string, signature: string) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!webhookSecret) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured on server');
  }

  const digest = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');
  return digest === signature;
};

const ensureParentNotification = async (
  supabase: SupabaseClient,
  userId: string,
  transactionId: string,
  title: string,
  message: string
) => {
  const { data: existing } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .ilike('message', `%[TXN:${transactionId}]%`)
    .limit(1)
    .maybeSingle();

  if (existing?.id) return;

  await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message,
    type: 'PAYMENT_SUCCESS',
    is_read: false,
  } as any);
};

const ensureAdminNotifications = async (
  supabase: SupabaseClient,
  message: string,
  title: string,
  transactionId: string
) => {
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['ADMIN', 'SUPER_ADMIN']);

  const adminIds = (admins || []).map((admin: any) => String(admin.id)).filter(Boolean);
  if (adminIds.length === 0) return;

  for (const adminId of adminIds) {
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', adminId)
      .ilike('message', `%[TXN:${transactionId}]%`)
      .limit(1)
      .maybeSingle();

    if (existing?.id) continue;

    await supabase.from('notifications').insert({
      user_id: adminId,
      title,
      message,
      type: 'PAYMENT_SUCCESS',
      is_read: false,
    } as any);
  }
};

const fetchProfileEmails = async (supabase: SupabaseClient, userIds: string[]) => {
  const uniqueIds = [...new Set(userIds.map((id) => String(id || '').trim()).filter(Boolean))];
  if (uniqueIds.length === 0) return [] as ProfileEmail[];

  const { data } = await supabase
    .from('profiles')
    .select('id, email')
    .in('id', uniqueIds);

  return (data || []) as ProfileEmail[];
};

const fetchAdminContacts = async (supabase: SupabaseClient) => {
  const { data } = await supabase
    .from('profiles')
    .select('id, email')
    .in('role', ['ADMIN', 'SUPER_ADMIN']);

  const rows = (data || []) as ProfileEmail[];
  const ids = rows.map((row) => String(row.id));
  const emails = rows.map((row) => String(row.email || '').trim()).filter(Boolean);
  return { ids, emails };
};

const insertEmailLogs = async (supabase: SupabaseClient, rows: any[]) => {
  if (!rows.length) return;
  try {
    await supabase.from('payment_email_logs').insert(rows as any);
  } catch (logErr) {
    console.warn('[Payment Email Log] Failed to insert audit rows:', logErr);
  }
};

const ensureReceipt = async (
  supabase: SupabaseClient,
  dueId: string,
  paymentId: string,
  amount: number
) => {
  const { data: existingByTxn } = await supabase
    .from('receipts')
    .select('id')
    .eq('transaction_id', paymentId)
    .limit(1)
    .maybeSingle();

  if (existingByTxn?.id) return;

  const { data: existingByDue } = await supabase
    .from('receipts')
    .select('id')
    .eq('due_id', dueId)
    .limit(1)
    .maybeSingle();

  if (existingByDue?.id) {
    await supabase
      .from('receipts')
      .update({ transaction_id: paymentId, amount_paid: amount, payment_method: 'ONLINE' } as any)
      .eq('id', String(existingByDue.id));
    return;
  }

  const receiptNo = `RCPT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
  await supabase.from('receipts').insert({
    due_id: dueId,
    receipt_no: receiptNo,
    amount_paid: amount,
    payment_method: 'ONLINE',
    transaction_id: paymentId,
    created_at: new Date().toISOString(),
  } as any);
};

export const recordSuccessfulPayment = async (input: RecordPaymentInput): Promise<RecordPaymentResult> => {
  const supabase = createAdminClient();

  const { data: dueData, error: dueError } = await supabase
    .from('monthly_dues')
    .select('id, student_id, month, year, amount, total_due, status, transaction_id, students(id, full_name, parent_id)')
    .eq('id', input.dueId)
    .maybeSingle();

  if (dueError || !dueData) {
    throw new Error(`Unable to load due record for ${input.dueId}`);
  }

  const due = dueData as unknown as DueWithStudent;

  if (due.status === 'PAID' && due.transaction_id && due.transaction_id === input.razorpayPaymentId) {
    return {
      ok: true,
      alreadyProcessed: true,
      dueId: input.dueId,
      transactionId: input.razorpayPaymentId,
    };
  }

  const amountPaid = Number(due.total_due || due.amount || 0);

  const { error: updateError } = await supabase
    .from('monthly_dues')
    .update({
      status: 'PAID',
      paid_at: new Date().toISOString(),
      payment_method: 'ONLINE',
      transaction_id: input.razorpayPaymentId,
    } as any)
    .eq('id', input.dueId);

  if (updateError) {
    throw new Error(`Failed to update monthly due: ${updateError.message}`);
  }

  await ensureReceipt(supabase, input.dueId, input.razorpayPaymentId, amountPaid);

  const studentName = due.students?.full_name || 'Student';
  const monthLabel = `${due.month}/${due.year}`;
  const parentId = due.students?.parent_id || '';

  const parentMessage = `Payment of ₹${amountPaid.toLocaleString('en-IN')} successful for ${studentName} (${monthLabel}). [DUE_ID:${input.dueId}] [TXN:${input.razorpayPaymentId}]`;
  const adminMessage = `Parent payment received: ${studentName}, ₹${amountPaid.toLocaleString('en-IN')}, ${monthLabel}. [DUE_ID:${input.dueId}] [TXN:${input.razorpayPaymentId}]`;

  if (parentId) {
    await ensureParentNotification(
      supabase,
      parentId,
      input.razorpayPaymentId,
      'Fee Payment Successful',
      parentMessage
    );
  }

  const adminContacts = await fetchAdminContacts(supabase);

  if (adminContacts.ids.length > 0) {
    await ensureAdminNotifications(
      supabase,
      adminMessage,
      'Parent Fee Payment Confirmed',
      input.razorpayPaymentId
    );
  }

  try {
    const parentProfiles = await fetchProfileEmails(supabase, parentId ? [parentId] : []);
    const parentEmail = parentProfiles[0]?.email || null;

    const emailResult = await sendPaymentEmails({
      parentEmail,
      adminEmails: adminContacts.emails,
      context: {
        transactionId: input.razorpayPaymentId,
        dueId: input.dueId,
        studentName,
        monthLabel,
        amountPaid,
      },
    });

    const emailLogs: any[] = [];
    const provider = String((emailResult as any)?.provider || 'resend').toUpperCase();

    const parentRecipients = Array.isArray((emailResult as any)?.parentRecipients)
      ? ((emailResult as any).parentRecipients as string[])
      : [];
    const adminRecipients = Array.isArray((emailResult as any)?.adminRecipients)
      ? ((emailResult as any).adminRecipients as string[])
      : [];

    const reason = String((emailResult as any)?.reason || '');

    if (parentRecipients.length === 0) {
      if (parentEmail) {
        emailLogs.push({
          due_id: input.dueId,
          transaction_id: input.razorpayPaymentId,
          recipient_email: String(parentEmail),
          recipient_role: 'PARENT',
          channel: 'EMAIL',
          provider,
          status: reason === 'disabled' ? 'SKIPPED' : 'FAILED',
          error_message: reason === 'disabled' ? 'Email delivery disabled by PAYMENT_EMAIL_ENABLED' : 'Parent recipient missing',
          metadata: { source: input.source },
        });
      }
    } else {
      for (const email of parentRecipients) {
        emailLogs.push({
          due_id: input.dueId,
          transaction_id: input.razorpayPaymentId,
          recipient_email: email,
          recipient_role: 'PARENT',
          channel: 'EMAIL',
          provider,
          status: (emailResult as any)?.parentSent ? 'SENT' : 'FAILED',
          error_message: (emailResult as any)?.parentSent ? null : 'Provider rejected or unavailable',
          metadata: { source: input.source },
        });
      }
    }

    if (adminRecipients.length === 0) {
      for (const email of adminContacts.emails) {
        emailLogs.push({
          due_id: input.dueId,
          transaction_id: input.razorpayPaymentId,
          recipient_email: email,
          recipient_role: 'ADMIN',
          channel: 'EMAIL',
          provider,
          status: reason === 'disabled' ? 'SKIPPED' : 'FAILED',
          error_message: reason === 'disabled' ? 'Email delivery disabled by PAYMENT_EMAIL_ENABLED' : 'Admin recipient missing',
          metadata: { source: input.source },
        });
      }
    } else {
      for (const email of adminRecipients) {
        emailLogs.push({
          due_id: input.dueId,
          transaction_id: input.razorpayPaymentId,
          recipient_email: email,
          recipient_role: 'ADMIN',
          channel: 'EMAIL',
          provider,
          status: (emailResult as any)?.adminSent ? 'SENT' : 'FAILED',
          error_message: (emailResult as any)?.adminSent ? null : 'Provider rejected or unavailable',
          metadata: { source: input.source },
        });
      }
    }

    await insertEmailLogs(supabase, emailLogs);
  } catch (emailErr) {
    console.warn('[Payment Email] Non-blocking email dispatch failure:', emailErr);

    await insertEmailLogs(supabase, [{
      due_id: input.dueId,
      transaction_id: input.razorpayPaymentId,
      recipient_email: 'system',
      recipient_role: 'SYSTEM',
      channel: 'EMAIL',
      provider: 'RESEND',
      status: 'FAILED',
      error_message: String((emailErr as any)?.message || emailErr || 'Unknown email dispatch error'),
      metadata: { source: input.source },
    }]);
  }

  return {
    ok: true,
    alreadyProcessed: false,
    dueId: input.dueId,
    transactionId: input.razorpayPaymentId,
  };
};

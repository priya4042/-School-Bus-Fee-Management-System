import { createClient } from '@supabase/supabase-js';

const createAdminClient = () => {
  const url = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !serviceRole) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY on server');
  }

  return createClient(url, serviceRole);
};

const buildReceiptNo = (dueId: string, index: number) => {
  const suffix = String(dueId || '').slice(-6) || '000000';
  return `RCPT-${Date.now().toString().slice(-7)}-${index}-${suffix}-${Math.floor(Math.random() * 1000)}`;
};

export async function recordSuccessfulPayment({ dueId, dueIds = [], payuTxnId, payuMihpayId, source }: {
  dueId: string;
  dueIds?: string[];
  payuTxnId: string;
  payuMihpayId: string;
  source: string;
}) {
  const supabase = createAdminClient();
  const paymentId = payuMihpayId || payuTxnId;
  const finalDueIds = [...new Set([String(dueId), ...(Array.isArray(dueIds) ? dueIds.map((id: any) => String(id)) : [])].filter(Boolean))];

  const { data: dues, error: dueError } = await supabase
    .from('monthly_dues')
    .select('id, student_id, month, year, amount, total_due, status, transaction_id, students(id, full_name, parent_id)')
    .in('id', finalDueIds as any);

  if (dueError || !dues || dues.length === 0) {
    throw new Error(`Due not found: ${dueError?.message || 'no matching dues'}`);
  }

  const sortedDues = [...dues].sort((a: any, b: any) => Number(a.id) - Number(b.id));
  const primaryDue = sortedDues[0] as any;
  const studentRelation = Array.isArray(primaryDue?.students) ? primaryDue.students[0] : primaryDue?.students;
  const paidAt = new Date().toISOString();
  const totalPaidAmount = sortedDues.reduce((sum: number, d: any) => sum + Number(d.total_due || d.amount || 0), 0);
  const dueIdsToUpdate = sortedDues
    .filter((d: any) => !(String(d.status || '').toUpperCase() === 'PAID' && String(d.transaction_id || '') === String(paymentId || '')))
    .map((d: any) => String(d.id));

  if (dueIdsToUpdate.length > 0) {
    const { error: updateError } = await supabase
      .from('monthly_dues')
      .update({
        status: 'PAID',
        paid_at: paidAt,
        transaction_id: paymentId,
        payment_method: 'ONLINE',
      } as any)
      .in('id', dueIdsToUpdate as any);

    if (updateError) {
      throw new Error(`Failed to mark dues paid: ${updateError.message}`);
    }
  }

  let createdOrUpdatedReceipts = 0;
  for (let index = 0; index < sortedDues.length; index += 1) {
    const due = sortedDues[index] as any;

    const { data: existingReceipt, error: receiptLookupError } = await supabase
      .from('receipts')
      .select('id, transaction_id')
      .eq('due_id', String(due.id))
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (receiptLookupError) {
      console.warn('[Payment Verify] Receipt lookup failed (non-blocking):', receiptLookupError.message);
      continue;
    }

    if (existingReceipt?.id) {
      if (String(existingReceipt.transaction_id || '') !== String(paymentId || '')) {
        const { error: receiptUpdateError } = await supabase
          .from('receipts')
          .update({
            transaction_id: paymentId,
            amount_paid: due.total_due || due.amount,
            payment_method: 'ONLINE',
          } as any)
          .eq('id', String(existingReceipt.id));

        if (receiptUpdateError) {
          console.warn('[Payment Verify] Receipt update failed (non-blocking):', receiptUpdateError.message);
        } else {
          createdOrUpdatedReceipts += 1;
        }
      }
      continue;
    }

    let inserted = false;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { error: receiptInsertError } = await supabase
        .from('receipts')
        .insert({
          due_id: String(due.id),
          receipt_no: buildReceiptNo(String(due.id), index + attempt),
          amount_paid: due.total_due || due.amount,
          payment_method: 'ONLINE',
          transaction_id: paymentId,
          created_at: paidAt,
        } as any);

      if (!receiptInsertError) {
        inserted = true;
        createdOrUpdatedReceipts += 1;
        break;
      }

      const msg = String(receiptInsertError.message || '').toLowerCase();
      if (!msg.includes('receipt_no') && !msg.includes('duplicate key')) {
        console.warn('[Payment Verify] Receipt insert failed (non-blocking):', receiptInsertError.message);
        break;
      }
    }

    if (!inserted) {
      console.warn(`[Payment Verify] Could not create receipt for due ${String(due.id)}`);
    }
  }

  try {
    const parentId = String(studentRelation?.parent_id || '').trim();
    if (parentId) {
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', parentId)
        .ilike('message', `%[TXN:${String(paymentId)}]%`)
        .limit(1)
        .maybeSingle();

      if (!existingNotification?.id) {
        const monthText = `${String(primaryDue?.month || '')}/${String(primaryDue?.year || '')}`;
        const message = `Fee payment received for ${String(studentRelation?.full_name || 'Student')}: Rs ${totalPaidAmount.toLocaleString('en-IN')} (${monthText}) [TXN:${String(paymentId)}] [DUE_ID:${String(primaryDue?.id || dueId)}]`;

        await supabase.from('notifications').insert({
          user_id: parentId,
          title: 'Fee Payment Successful',
          message,
          created_at: paidAt,
          type: 'PAYMENT_SUCCESS',
          is_read: false,
        } as any);
      }
    }
  } catch (notificationError: any) {
    console.warn('[Payment Verify] Parent notification failed (non-blocking):', notificationError?.message || notificationError);
  }

  return {
    alreadyProcessed: dueIdsToUpdate.length === 0 && createdOrUpdatedReceipts === 0,
    transactionId: paymentId,
    dueId: String(primaryDue?.id || dueId),
    dueIds: finalDueIds,
  };
}

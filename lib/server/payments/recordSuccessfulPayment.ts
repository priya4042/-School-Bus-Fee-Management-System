import { supabase } from '../../../lib/supabase';
import { ensureParentNotification } from '../../../lib/server/payments/ensureParentNotification';

export async function recordSuccessfulPayment({ dueId, dueIds = [], razorpayOrderId, razorpayPaymentId, source }) {
  const finalDueIds = [...new Set([String(dueId), ...(Array.isArray(dueIds) ? dueIds.map((id: any) => String(id)) : [])].filter(Boolean))];

  const { data: dues, error: dueError } = await supabase
    .from('monthly_dues')
    .select('id, student_id, amount, total_due, students(id, full_name, parent_id)')
    .in('id', finalDueIds as any);
  if (dueError || !dues || dues.length === 0) throw new Error('Due not found');

  const sortedDues = [...dues].sort((a: any, b: any) => Number(a.id) - Number(b.id));
  const primaryDue = sortedDues[0] as any;
  const studentRelation = Array.isArray(primaryDue?.students)
    ? primaryDue?.students[0]
    : primaryDue?.students;
  const totalPaidAmount = sortedDues.reduce((sum: number, d: any) => sum + Number(d.total_due || d.amount || 0), 0);

  // Mark as paid
  const paidAt = new Date().toISOString();
  await supabase
    .from('monthly_dues')
    .update({ status: 'PAID', paid_at: paidAt, transaction_id: razorpayPaymentId, payment_method: 'ONLINE' })
    .in('id', finalDueIds as any);

  let createdReceipts = 0;
  for (const due of sortedDues as any[]) {
    const { data: existingReceipt } = await supabase
      .from('receipts')
      .select('id')
      .eq('due_id', String(due.id))
      .maybeSingle();

    if (!existingReceipt) {
      await supabase.from('receipts').insert({
        due_id: String(due.id),
        receipt_no: `RCPT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
        amount_paid: due.total_due || due.amount,
        payment_method: 'ONLINE',
        transaction_id: razorpayPaymentId,
        created_at: paidAt,
      });
      createdReceipts += 1;
    }
  }

  // Notify parent
  await ensureParentNotification({
    parentId: studentRelation?.parent_id,
    studentName: studentRelation?.full_name,
    amount: totalPaidAmount,
    txnId: razorpayPaymentId,
    dueId: String(primaryDue?.id || dueId),
    paidAt,
  });

  return {
    alreadyProcessed: createdReceipts === 0,
    transactionId: razorpayPaymentId,
    dueId: String(primaryDue?.id || dueId),
    dueIds: finalDueIds,
  };
}

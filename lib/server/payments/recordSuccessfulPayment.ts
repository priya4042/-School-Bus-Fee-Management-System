import { supabase } from '../../../lib/supabase';
import { ensureParentNotification } from '../../../lib/server/payments/ensureParentNotification';

export async function recordSuccessfulPayment({ dueId, razorpayOrderId, razorpayPaymentId, source }) {
  // Fetch due and student context
  const { data: due, error: dueError } = await supabase
    .from('monthly_dues')
    .select('id, student_id, amount, total_due, students(id, full_name, parent_id)')
    .eq('id', String(dueId))
    .maybeSingle();
  if (dueError || !due) throw new Error('Due not found');

  const studentRelation = Array.isArray((due as any).students)
    ? (due as any).students[0]
    : (due as any).students;

  // Mark as paid
  const paidAt = new Date().toISOString();
  await supabase
    .from('monthly_dues')
    .update({ status: 'PAID', paid_at: paidAt, transaction_id: razorpayPaymentId, payment_method: 'ONLINE' })
    .eq('id', String(dueId));

  // Insert receipt if not exists
  const { data: existingReceipt } = await supabase
    .from('receipts')
    .select('id')
    .eq('due_id', String(dueId))
    .maybeSingle();
  if (!existingReceipt) {
    await supabase.from('receipts').insert({
      due_id: String(dueId),
      receipt_no: `RCPT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
      amount_paid: due.total_due || due.amount,
      payment_method: 'ONLINE',
      transaction_id: razorpayPaymentId,
      created_at: paidAt,
    });
  }

  // Notify parent
  await ensureParentNotification({
    parentId: studentRelation?.parent_id,
    studentName: studentRelation?.full_name,
    amount: due.total_due || due.amount,
    txnId: razorpayPaymentId,
    dueId,
    paidAt,
  });

  return {
    alreadyProcessed: !!existingReceipt,
    transactionId: razorpayPaymentId,
    dueId,
  };
}

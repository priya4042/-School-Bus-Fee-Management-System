import { supabase } from '../../supabase';

/**
 * Inserts a notification for the parent after successful payment.
 * Prevents duplicate notifications for the same transaction.
 */
export async function ensureParentNotification({ parentId, studentName, amount, txnId, dueId, paidAt }) {
  if (!parentId || !txnId) return;
  // Check for duplicate notification
  const { data: existing } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', parentId)
    .ilike('message', `%[TXN:${txnId}]%`)
    .maybeSingle();
  if (existing) return;

  const message = `Fee payment received for ${studentName}: ₹${amount} [TXN:${txnId}] [DUE_ID:${dueId}]`;
  await supabase.from('notifications').insert({
    user_id: parentId,
    title: 'Fee Payment Successful',
    message,
    created_at: paidAt || new Date().toISOString(),
    type: 'payment',
  });
}

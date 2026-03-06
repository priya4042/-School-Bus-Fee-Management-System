import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    dueId
  } = req.body;

  console.log(`[Razorpay Verify] Verifying payment for dueId: ${dueId}, payment: ${razorpay_payment_id}`);

  if (!dueId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    console.log(`[Razorpay Verify] Signature valid for payment: ${razorpay_payment_id}`);
    try {
      // 1. Fetch the due record to get the amount
      const { data: dueData, error: dueError } = await supabase
        .from('monthly_dues')
        .select('amount')
        .eq('id', dueId)
        .single();

      if (dueError || !dueData) {
        throw new Error(`Failed to fetch due record: ${dueError?.message || 'Not found'}`);
      }

      // 2. Update monthly_dues status to PAID
      const { error: updateError } = await supabase
        .from('monthly_dues')
        .update({
          status: 'PAID',
          paid_at: new Date().toISOString()
        })
        .eq('id', dueId);

      if (updateError) throw updateError;

      // 3. Insert receipt
      const receiptNo = `RCPT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      const { error: receiptError } = await supabase
        .from('receipts')
        .insert({
          due_id: dueId,
          receipt_no: receiptNo,
          amount_paid: dueData.amount,
          payment_method: 'ONLINE',
          transaction_id: razorpay_payment_id,
          created_at: new Date().toISOString()
        });

      if (receiptError) throw receiptError;

      console.log(`[Razorpay Verify] Payment recorded successfully for dueId: ${dueId}`);
      return res.status(200).json({ success: true, status: 'ok' });
    } catch (error: any) {
      console.error('[Razorpay Verify] Database error:', error);
      return res.status(500).json({ success: false, error: 'Payment verified but failed to record in database' });
    }
  } else {
    console.warn(`[Razorpay Verify] Invalid signature for payment: ${razorpay_payment_id}`);
    return res.status(400).json({ success: false, error: 'Invalid signature' });
  }
}

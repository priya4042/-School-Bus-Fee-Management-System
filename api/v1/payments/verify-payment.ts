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
    studentId,
    month,
    amount
  } = req.body;

  console.log(`[Razorpay Verify] Verifying payment for student: ${studentId}, payment: ${razorpay_payment_id}`);

  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    console.log(`[Razorpay Verify] Signature valid for payment: ${razorpay_payment_id}`);
    try {
      const { error } = await supabase.from('payments').insert({
        student_id: studentId,
        amount: amount,
        month: month,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        status: 'SUCCESS',
        method: 'ONLINE',
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      console.log(`[Razorpay Verify] Payment recorded successfully for student: ${studentId}`);
      return res.status(200).json({ status: 'ok' });
    } catch (error: any) {
      console.error('[Razorpay Verify] Database error:', error);
      return res.status(500).json({ error: 'Payment verified but failed to record in database' });
    }
  } else {
    console.warn(`[Razorpay Verify] Invalid signature for payment: ${razorpay_payment_id}`);
    return res.status(400).json({ error: 'Invalid signature' });
  }
}

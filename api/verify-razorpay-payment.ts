import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    // Payment is verified
    try {
      // Record payment in Supabase
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

      return res.status(200).json({ status: 'ok' });
    } catch (error: any) {
      console.error('Failed to record payment:', error);
      return res.status(500).json({ error: 'Payment verified but failed to record in database' });
    }
  } else {
    return res.status(400).json({ error: 'Invalid signature' });
  }
}

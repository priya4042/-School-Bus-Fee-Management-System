import { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';

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

  const { amount, studentId, month, dueId, due_id } = req.body;
  const finalDueId = String(dueId || due_id || '').trim();
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

  console.log(`[Razorpay Order] Creating order for student: ${studentId}, amount: ${amount}, due: ${finalDueId}`);

  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  if (!keyId || !keySecret) {
    return res.status(500).json({
      error: 'Server payment configuration missing (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).',
    });
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${studentId}_${month}_${Date.now()}`,
      notes: {
        due_id: finalDueId,
        student_id: String(studentId || ''),
      },
    };

    const order = await razorpay.orders.create(options);
    console.log(`[Razorpay Order] Created order: ${order.id}`);

    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('[Razorpay Order] Error:', error);
    const providerMessage =
      error?.error?.description ||
      error?.description ||
      error?.message ||
      'Failed to create order';

    return res.status(500).json({
      error: providerMessage,
      code: error?.error?.code || error?.code || 'RAZORPAY_ORDER_CREATE_FAILED',
    });
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyCheckoutSignature } from '../../../lib/server/payments/paymentCore.js';
import { recordSuccessfulPayment } from '../../../lib/server/payments/recordSuccessfulPayment';

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
    dueId,
    due_id,
  } = req.body;

  const finalDueId = String(dueId || due_id || '').trim();

  console.log(`[Razorpay Verify] Verifying payment for dueId: ${finalDueId}, payment: ${razorpay_payment_id}`);

  if (!finalDueId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const valid = verifyCheckoutSignature({
      razorpayOrderId: String(razorpay_order_id),
      razorpayPaymentId: String(razorpay_payment_id),
      razorpaySignature: String(razorpay_signature),
    });

    if (!valid) {
      console.warn(`[Razorpay Verify] Invalid signature for payment: ${razorpay_payment_id}`);
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    console.log(`[Razorpay Verify] Signature valid for payment: ${razorpay_payment_id}`);
    const result = await recordSuccessfulPayment({
      dueId: finalDueId,
      razorpayOrderId: String(razorpay_order_id),
      razorpayPaymentId: String(razorpay_payment_id),
      source: 'verify',
    });

    return res.status(200).json({
      success: true,
      status: 'ok',
      alreadyProcessed: result.alreadyProcessed,
      transactionId: result.transactionId,
      dueId: result.dueId,
    });
  } catch (error: any) {
    console.error('[Razorpay Verify] Error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Payment verification failed',
    });
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyCheckoutSignature } from '../../../lib/server/payments/paymentCore.js';
import { recordSuccessfulPayment } from '../../../lib/server/payments/recordSuccessfulPayment';

const classifyVerifyFailure = (error: any): 'CONFIG' | 'DATA' | 'RUNTIME' => {
  const raw = String(error?.message || error || '').toLowerCase();

  if (
    raw.includes('supabase_url') ||
    raw.includes('supabase_service_role_key') ||
    raw.includes('razorpay_key_secret') ||
    raw.includes('not configured') ||
    raw.includes('missing')
  ) {
    return 'CONFIG';
  }

  if (
    raw.includes('due not found') ||
    raw.includes('failed to mark dues paid') ||
    raw.includes('failed to update monthly due') ||
    raw.includes('duplicate key') ||
    raw.includes('violates')
  ) {
    return 'DATA';
  }

  return 'RUNTIME';
};

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
    due_ids,
  } = req.body;
  const traceId = `verify-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const finalDueId = String(dueId || due_id || '').trim();

  console.log(`[Razorpay Verify][${traceId}] Verifying payment for dueId: ${finalDueId}, payment: ${razorpay_payment_id}`);

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
      console.warn(`[Razorpay Verify][${traceId}] Invalid signature for payment: ${razorpay_payment_id}`);
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    console.log(`[Razorpay Verify][${traceId}] Signature valid for payment: ${razorpay_payment_id}`);
    const result = await recordSuccessfulPayment({
      dueId: finalDueId,
      dueIds: Array.isArray(due_ids) ? due_ids.map((id: any) => String(id)) : [],
      razorpayOrderId: String(razorpay_order_id),
      razorpayPaymentId: String(razorpay_payment_id),
      source: 'verify',
    });

    return res.status(200).json({
      success: true,
      status: 'ok',
      traceId,
      alreadyProcessed: result.alreadyProcessed,
      transactionId: result.transactionId,
      dueId: result.dueId,
    });
  } catch (error: any) {
    const failureType = classifyVerifyFailure(error);
    console.error(`[Razorpay Verify][${traceId}] ${failureType} failure:`, {
      message: String(error?.message || error || 'Unknown payment verification failure'),
      dueId: finalDueId,
      paymentId: String(razorpay_payment_id || ''),
      orderId: String(razorpay_order_id || ''),
      hasBundledDues: Array.isArray(due_ids) && due_ids.length > 0,
    });

    return res.status(500).json({
      success: false,
      traceId,
      failureType,
      error: error?.message || 'Payment verification failed',
    });
  }
}

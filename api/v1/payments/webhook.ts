import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyWebhookSignature } from '../../../lib/server/payments/paymentCore.js';
import { recordSuccessfulPayment } from '../../../lib/server/payments/recordSuccessfulPayment.js';

const classifyWebhookFailure = (error: any): 'CONFIG' | 'DATA' | 'RUNTIME' => {
  const raw = String(error?.message || error || '').toLowerCase();

  if (
    raw.includes('supabase_url') ||
    raw.includes('supabase_service_role_key') ||
    raw.includes('razorpay_webhook_secret') ||
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
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-razorpay-signature'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = String(req.headers['x-razorpay-signature'] || '');
  const payloadString = JSON.stringify(req.body || {});
  const traceId = `webhook-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  console.log(`[Razorpay Webhook][${traceId}] Received webhook event`);

  if (!signature) {
    console.warn(`[Razorpay Webhook][${traceId}] Missing secret or signature`);
    return res.status(400).json({ error: 'Missing secret or signature', traceId });
  }

  try {
    const valid = verifyWebhookSignature(payloadString, signature);
    if (!valid) {
      console.warn(`[Razorpay Webhook][${traceId}] Invalid signature`);
      return res.status(400).json({ error: 'Invalid signature', traceId });
    }

    const event = String(req.body?.event || '');
    console.log(`[Razorpay Webhook][${traceId}] Signature valid. Event: ${event}`);

    const paymentEntity = req.body?.payload?.payment?.entity || null;
    const orderEntity = req.body?.payload?.order?.entity || null;
    const dueId = String(
      paymentEntity?.notes?.due_id ||
      paymentEntity?.notes?.dueId ||
      orderEntity?.notes?.due_id ||
      orderEntity?.notes?.dueId ||
      ''
    ).trim();

    const razorpayOrderId = String(paymentEntity?.order_id || orderEntity?.id || '').trim();
    const razorpayPaymentId = String(paymentEntity?.id || '').trim();

    const isPaymentSuccessEvent = event === 'payment.captured' || event === 'order.paid';
    if (!isPaymentSuccessEvent) {
      return res.status(200).json({ status: 'ignored', event, traceId });
    }

    if (!dueId || !razorpayOrderId || !razorpayPaymentId) {
      console.warn(`[Razorpay Webhook][${traceId}] Missing due/order/payment identifiers in payload`);
      return res.status(202).json({
        status: 'accepted_without_sync',
        reason: 'missing_due_or_payment_identifiers',
        traceId,
      });
    }

    const result = await recordSuccessfulPayment({
      dueId,
      dueIds: [dueId],
      razorpayOrderId,
      razorpayPaymentId,
      source: 'webhook',
      eventId: String(req.body?.payload?.payment?.entity?.id || ''),
    });

    return res.status(200).json({
      status: 'ok',
      event,
      traceId,
      dueId: result.dueId,
      transactionId: result.transactionId,
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (error: any) {
    const failureType = classifyWebhookFailure(error);
    const event = String(req.body?.event || '');
    const paymentEntity = req.body?.payload?.payment?.entity || null;
    const orderEntity = req.body?.payload?.order?.entity || null;

    console.error(`[Razorpay Webhook][${traceId}] ${failureType} failure:`, {
      message: String(error?.message || error || 'Unknown webhook processing error'),
      event,
      paymentId: String(paymentEntity?.id || ''),
      orderId: String(paymentEntity?.order_id || orderEntity?.id || ''),
      dueId: String(paymentEntity?.notes?.due_id || orderEntity?.notes?.due_id || ''),
    });

    return res.status(500).json({
      error: error?.message || 'Webhook processing failed',
      failureType,
      traceId,
    });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyWebhookSignature, recordSuccessfulPayment } from '../../../lib/server/payments/paymentCore';

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

  console.log('[Razorpay Webhook] Received webhook event');

  if (!signature) {
    console.warn('[Razorpay Webhook] Missing secret or signature');
    return res.status(400).json({ error: "Missing secret or signature" });
  }

  try {
    const valid = verifyWebhookSignature(payloadString, signature);
    if (!valid) {
      console.warn("[Razorpay Webhook] Invalid signature");
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = String(req.body?.event || '');
    console.log('[Razorpay Webhook] Signature valid. Event:', event);

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
      return res.status(200).json({ status: 'ignored', event });
    }

    if (!dueId || !razorpayOrderId || !razorpayPaymentId) {
      console.warn('[Razorpay Webhook] Missing due/order/payment identifiers in payload');
      return res.status(202).json({
        status: 'accepted_without_sync',
        reason: 'missing_due_or_payment_identifiers',
      });
    }

    const result = await recordSuccessfulPayment({
      dueId,
      razorpayOrderId,
      razorpayPaymentId,
      source: 'webhook',
      eventId: String(req.body?.payload?.payment?.entity?.id || ''),
    });

    return res.status(200).json({
      status: 'ok',
      event,
      dueId: result.dueId,
      transactionId: result.transactionId,
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (error: any) {
    console.error('[Razorpay Webhook] Processing failed:', error);
    return res.status(500).json({ error: error?.message || 'Webhook processing failed' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const signature = req.headers['x-razorpay-signature'] as string;

  console.log('[Razorpay Webhook] Received webhook event');

  if (!webhookSecret || !signature) {
    console.warn('[Razorpay Webhook] Missing secret or signature');
    return res.status(400).json({ error: "Missing secret or signature" });
  }

  const shasum = crypto.createHmac('sha256', webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === signature) {
    console.log("[Razorpay Webhook] Signature valid. Event:", req.body.event);
    res.status(200).json({ status: "ok" });
  } else {
    console.warn("[Razorpay Webhook] Invalid signature");
    res.status(400).json({ error: "Invalid signature" });
  }
}

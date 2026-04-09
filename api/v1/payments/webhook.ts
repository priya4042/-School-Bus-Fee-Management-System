import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyPayUResponseHash } from '../../../lib/server/payments/paymentCore.js';
import { recordSuccessfulPayment } from '../../../lib/server/payments/recordSuccessfulPayment.js';

const classifyWebhookFailure = (error: any): 'CONFIG' | 'DATA' | 'RUNTIME' => {
  const raw = String(error?.message || error || '').toLowerCase();

  if (
    raw.includes('supabase_url') ||
    raw.includes('supabase_service_role_key') ||
    raw.includes('payu_merchant_salt') ||
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

  const traceId = `webhook-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  console.log(`[PayU Webhook][${traceId}] Received webhook event`);

  try {
    const body = req.body || {};
    const payuStatus = String(body.status || '').toLowerCase();
    const txnid = String(body.txnid || '');
    const mihpayid = String(body.mihpayid || '');
    const hash = String(body.hash || '');
    const dueId = String(body.udf1 || '').trim();

    if (payuStatus !== 'success') {
      console.log(`[PayU Webhook][${traceId}] Non-success status: ${payuStatus}`);
      return res.status(200).json({ status: 'ignored', payuStatus, traceId });
    }

    // Verify response hash
    const valid = verifyPayUResponseHash({
      salt: '',
      status: payuStatus,
      email: String(body.email || ''),
      firstname: String(body.firstname || ''),
      productinfo: String(body.productinfo || ''),
      amount: String(body.amount || ''),
      txnid,
      key: '',
      responseHash: hash,
      udf1: String(body.udf1 || ''),
      udf2: String(body.udf2 || ''),
      udf3: String(body.udf3 || ''),
      udf4: String(body.udf4 || ''),
      udf5: String(body.udf5 || ''),
      additionalCharges: String(body.additionalCharges || ''),
    });

    if (!valid) {
      console.warn(`[PayU Webhook][${traceId}] Invalid hash`);
      return res.status(400).json({ error: 'Invalid hash', traceId });
    }

    if (!dueId || !txnid || !mihpayid) {
      console.warn(`[PayU Webhook][${traceId}] Missing due/txn identifiers`);
      return res.status(202).json({
        status: 'accepted_without_sync',
        reason: 'missing_due_or_payment_identifiers',
        traceId,
      });
    }

    const result = await recordSuccessfulPayment({
      dueId,
      dueIds: [dueId],
      payuTxnId: txnid,
      payuMihpayId: mihpayid,
      source: 'webhook',
    });

    return res.status(200).json({
      status: 'ok',
      traceId,
      dueId: result.dueId,
      transactionId: result.transactionId,
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (error: any) {
    const failureType = classifyWebhookFailure(error);
    console.error(`[PayU Webhook][${traceId}] ${failureType} failure:`, {
      message: String(error?.message || error || 'Unknown webhook processing error'),
    });

    return res.status(500).json({
      error: error?.message || 'Webhook processing failed',
      failureType,
      traceId,
    });
  }
}

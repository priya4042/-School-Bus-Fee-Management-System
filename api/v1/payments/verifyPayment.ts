import { VercelRequest, VercelResponse } from '@vercel/node';

const classifyVerifyFailure = (error: any): 'CONFIG' | 'DATA' | 'RUNTIME' => {
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

  const body = (req.body || {}) as any;
  const {
    txnid,
    mihpayid,
    status: payuStatus,
    hash: responseHash,
    amount,
    productinfo,
    firstname,
    email,
    dueId,
    due_id,
    due_ids,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    additionalCharges,
  } = body;
  const traceId = `verify-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const finalDueId = String(dueId || due_id || udf1 || '').trim();

  console.log(`[PayU Verify][${traceId}] Verifying payment for dueId: ${finalDueId}, txnid: ${txnid}, mihpayid: ${mihpayid}, status: ${payuStatus}`);

  if (!finalDueId || !txnid || !mihpayid) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  if (payuStatus !== 'success') {
    return res.status(400).json({ success: false, error: `Payment was not successful. Status: ${payuStatus}` });
  }

  try {
    const [{ verifyPayUResponseHash }, { recordSuccessfulPayment }] = await Promise.all([
      import('../../../lib/server/payments/paymentCore.js'),
      import('../../../lib/server/payments/recordSuccessfulPayment.js'),
    ]);

    const valid = verifyPayUResponseHash({
      salt: '',  // function reads from env
      status: String(payuStatus),
      email: String(email || ''),
      firstname: String(firstname || ''),
      productinfo: String(productinfo || ''),
      amount: String(amount || ''),
      txnid: String(txnid),
      key: '', // function reads from env
      responseHash: String(responseHash || ''),
      udf1: String(udf1 || ''),
      udf2: String(udf2 || ''),
      udf3: String(udf3 || ''),
      udf4: String(udf4 || ''),
      udf5: String(udf5 || ''),
      additionalCharges: String(additionalCharges || ''),
    });

    if (!valid) {
      console.warn(`[PayU Verify][${traceId}] Invalid hash for payment: ${mihpayid}`);
      return res.status(400).json({ success: false, error: 'Invalid payment hash' });
    }

    console.log(`[PayU Verify][${traceId}] Hash valid for payment: ${mihpayid}`);
    const result = await recordSuccessfulPayment({
      dueId: finalDueId,
      dueIds: Array.isArray(due_ids) ? due_ids.map((id: any) => String(id)) : [],
      payuTxnId: String(txnid),
      payuMihpayId: String(mihpayid),
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
    console.error(`[PayU Verify][${traceId}] ${failureType} failure:`, {
      message: String(error?.message || error || 'Unknown payment verification failure'),
      dueId: finalDueId,
      mihpayid: String(mihpayid || ''),
      txnid: String(txnid || ''),
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

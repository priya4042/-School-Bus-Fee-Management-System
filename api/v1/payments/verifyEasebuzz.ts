import { VercelRequest, VercelResponse } from '@vercel/node';

const classifyVerifyFailure = (error: any): 'CONFIG' | 'DATA' | 'RUNTIME' => {
  const raw = String(error?.message || error || '').toLowerCase();
  if (
    raw.includes('easebuzz_salt') ||
    raw.includes('easebuzz_key') ||
    raw.includes('supabase_url') ||
    raw.includes('supabase_service_role_key') ||
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

const parseBody = (req: VercelRequest): Record<string, any> => {
  if (req.body && typeof req.body === 'object') return req.body as Record<string, any>;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      const params = new URLSearchParams(req.body);
      const out: Record<string, any> = {};
      params.forEach((v, k) => (out[k] = v));
      return out;
    }
  }
  return {};
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = parseBody(req);
  const {
    txnid,
    easepayid,
    payment_id,
    status,
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
    udf6,
    udf7,
    udf8,
    udf9,
    udf10,
  } = body;

  const traceId = `eb-verify-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const finalDueId = String(dueId || due_id || udf1 || '').trim();
  const gatewayTxnId = String(easepayid || payment_id || '').trim();

  console.log(
    `[Easebuzz Verify][${traceId}] dueId=${finalDueId} txnid=${txnid} easepayid=${gatewayTxnId} status=${status}`
  );

  if (!finalDueId || !txnid || !gatewayTxnId) {
    return res.status(400).json({ success: false, error: 'Missing required fields', traceId });
  }

  const normalisedStatus = String(status || '').toLowerCase();
  if (normalisedStatus !== 'success') {
    return res.status(400).json({
      success: false,
      error: `Payment was not successful. Status: ${status}`,
      traceId,
    });
  }

  try {
    const [{ verifyEasebuzzResponseHash }, { recordSuccessfulPayment }] = await Promise.all([
      import('../../../lib/server/payments/easebuzzCore.js'),
      import('../../../lib/server/payments/recordSuccessfulPayment.js'),
    ]);

    const valid = verifyEasebuzzResponseHash({
      status: String(status),
      email: String(email || ''),
      firstname: String(firstname || ''),
      productinfo: String(productinfo || ''),
      amount: String(amount || ''),
      txnid: String(txnid),
      responseHash: String(responseHash || ''),
      udf1: String(udf1 || ''),
      udf2: String(udf2 || ''),
      udf3: String(udf3 || ''),
      udf4: String(udf4 || ''),
      udf5: String(udf5 || ''),
      udf6: String(udf6 || ''),
      udf7: String(udf7 || ''),
      udf8: String(udf8 || ''),
      udf9: String(udf9 || ''),
      udf10: String(udf10 || ''),
    });

    if (!valid) {
      console.warn(`[Easebuzz Verify][${traceId}] Invalid hash for payment: ${gatewayTxnId}`);
      return res.status(400).json({ success: false, error: 'Invalid payment hash', traceId });
    }

    console.log(`[Easebuzz Verify][${traceId}] Hash valid for payment: ${gatewayTxnId}`);
    const result = await recordSuccessfulPayment({
      dueId: finalDueId,
      dueIds: Array.isArray(due_ids) ? due_ids.map((id: any) => String(id)) : [],
      payuTxnId: String(txnid),
      payuMihpayId: gatewayTxnId,
      source: 'easebuzz-verify',
    });

    return res.status(200).json({
      success: true,
      status: 'ok',
      gateway: 'easebuzz',
      traceId,
      alreadyProcessed: result.alreadyProcessed,
      transactionId: result.transactionId,
      dueId: result.dueId,
    });
  } catch (error: any) {
    const failureType = classifyVerifyFailure(error);
    console.error(`[Easebuzz Verify][${traceId}] ${failureType} failure:`, {
      message: String(error?.message || error || 'Unknown payment verification failure'),
      dueId: finalDueId,
      easepayid: gatewayTxnId,
      txnid: String(txnid || ''),
    });

    return res.status(500).json({
      success: false,
      traceId,
      failureType,
      error: error?.message || 'Payment verification failed',
    });
  }
}

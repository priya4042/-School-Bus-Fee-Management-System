import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  resolveEasebuzzKeys,
  easebuzzBaseUrl,
  generateEasebuzzRequestHash,
} from '../../../lib/server/payments/easebuzzCore.js';

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

  const { amount, studentId, month, dueId, due_id, studentName, email, phone } = (req.body || {}) as any;
  const finalDueId = String(dueId || due_id || '').trim();
  const { key, salt, env } = resolveEasebuzzKeys();
  const traceId = `eb-init-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  if (!amount) return res.status(400).json({ error: 'Amount is required' });
  if (!key || !salt) {
    return res.status(500).json({
      error: 'Server payment configuration missing (EASEBUZZ_KEY / EASEBUZZ_SALT).',
    });
  }

  try {
    const txnid = `EB${Date.now().toString(36).toUpperCase()}${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;
    const amountStr = Number(amount).toFixed(2);
    const productinfo = `Bus Fee - ${finalDueId}`;
    const firstname = String(studentName || 'Parent').slice(0, 60);
    const emailAddr = String(email || 'parent@buswaypro.app').trim();
    const phoneStr = String(phone || '9999999999').replace(/\D/g, '').slice(-10) || '9999999999';

    const appUrl =
      String(process.env.APP_URL || process.env.VITE_APP_URL || '').replace(/\/$/, '') ||
      `https://${req.headers.host || 'buswaypro.app'}`;
    const surl = `${appUrl}/api/v1/payments/verifyEasebuzz`;
    const furl = `${appUrl}/api/v1/payments/verifyEasebuzz`;

    const udf1 = finalDueId;
    const udf2 = String(studentId || '');
    const udf3 = String(month || '');

    const hash = generateEasebuzzRequestHash({
      key,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email: emailAddr,
      salt,
      udf1,
      udf2,
      udf3,
    });

    const formBody = new URLSearchParams({
      key,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email: emailAddr,
      phone: phoneStr,
      surl,
      furl,
      hash,
      udf1,
      udf2,
      udf3,
    });

    const initiateUrl = `${easebuzzBaseUrl(env)}/payment/initiateLink`;
    console.log(`[Easebuzz Init][${traceId}] POST ${initiateUrl} txnid=${txnid}`);

    const response = await fetch(initiateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
    });

    const json: any = await response.json().catch(() => ({}));

    if (!response.ok || Number(json?.status) !== 1 || !json?.data) {
      console.error(`[Easebuzz Init][${traceId}] Failed`, json);
      return res.status(502).json({
        error: json?.data || json?.error_desc || 'Failed to initiate Easebuzz payment',
        code: 'EASEBUZZ_INIT_FAILED',
        traceId,
      });
    }

    return res.status(200).json({
      success: true,
      accessKey: String(json.data),
      key,
      env,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email: emailAddr,
      phone: phoneStr,
      udf1,
      udf2,
      udf3,
      traceId,
    });
  } catch (error: any) {
    console.error(`[Easebuzz Init][${traceId}] Error:`, error);
    return res.status(500).json({
      error: error?.message || 'Failed to initiate Easebuzz payment',
      code: 'EASEBUZZ_INIT_ERROR',
      traceId,
    });
  }
}

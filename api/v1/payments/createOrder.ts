import { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';

const cleanEnv = (value: string) => String(value || '').trim().replace(/^['\"]|['\"]$/g, '');

const inferKeyMode = (keyId: string) => {
  if (keyId.startsWith('rzp_test_')) return 'test';
  if (keyId.startsWith('rzp_live_')) return 'live';
  return 'unknown';
};

const buildReceipt = (studentId: string, month: string | number) => {
  const studentPart = String(studentId || 'stu')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-10);
  const monthPart = String(month || '0')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 2);
  const tsPart = Date.now().toString().slice(-10);
  // Keep receipt short; Razorpay max is 40 chars.
  return `r_${studentPart}_${monthPart}_${tsPart}`.slice(0, 40);
};

type KeyPair = {
  keyId: string;
  keySecret: string;
  keyIdSource: string;
  keySecretSource: string;
};

const resolveKeyPairs = (): KeyPair[] => {
  const raw = {
    keyIdPrimary: cleanEnv(process.env.RAZORPAY_KEY_ID || ''),
    keyIdFallback: cleanEnv(process.env.VITE_RAZORPAY_KEY_ID || ''),
    keySecretPrimary: cleanEnv(process.env.RAZORPAY_KEY_SECRET || ''),
    keySecretFallback: cleanEnv(process.env.VITE_RAZORPAY_KEY_SECRET || ''),
  };

  const candidates: KeyPair[] = [
    {
      keyId: raw.keyIdPrimary,
      keySecret: raw.keySecretPrimary,
      keyIdSource: 'RAZORPAY_KEY_ID',
      keySecretSource: 'RAZORPAY_KEY_SECRET',
    },
    {
      keyId: raw.keyIdFallback,
      keySecret: raw.keySecretFallback,
      keyIdSource: 'VITE_RAZORPAY_KEY_ID',
      keySecretSource: 'VITE_RAZORPAY_KEY_SECRET',
    },
    {
      keyId: raw.keyIdPrimary,
      keySecret: raw.keySecretFallback,
      keyIdSource: 'RAZORPAY_KEY_ID',
      keySecretSource: 'VITE_RAZORPAY_KEY_SECRET',
    },
    {
      keyId: raw.keyIdFallback,
      keySecret: raw.keySecretPrimary,
      keyIdSource: 'VITE_RAZORPAY_KEY_ID',
      keySecretSource: 'RAZORPAY_KEY_SECRET',
    },
  ];

  const uniq = new Map<string, KeyPair>();
  for (const pair of candidates) {
    if (!pair.keyId || !pair.keySecret) continue;
    const key = `${pair.keyId}::${pair.keySecret}`;
    if (!uniq.has(key)) uniq.set(key, pair);
  }
  return [...uniq.values()];
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

  const { amount, studentId, month, dueId, due_id } = req.body;
  const finalDueId = String(dueId || due_id || '').trim();
  const keyPairs = resolveKeyPairs();

  console.log(`[Razorpay Order] Creating order for student: ${studentId}, amount: ${amount}, due: ${finalDueId}`);

  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  if (keyPairs.length === 0) {
    return res.status(500).json({
      error: 'Server payment configuration missing (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).',
    });
  }

  let lastError: any = null;
  let lastPair: KeyPair | null = null;

  for (const pair of keyPairs) {
    try {
      const razorpay = new Razorpay({
        key_id: pair.keyId,
        key_secret: pair.keySecret,
      });

      const options = {
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: buildReceipt(String(studentId || ''), month),
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
      lastError = error;
      lastPair = pair;
      const providerMessage = String(
        error?.error?.description ||
        error?.description ||
        error?.message ||
        ''
      ).toLowerCase();
      const providerCode = String(error?.error?.code || error?.code || '').toUpperCase();
      const isAuthFailure = providerMessage.includes('authentication failed') || providerCode === 'BAD_REQUEST_ERROR';
      if (!isAuthFailure) break;
    }
  }

  console.error('[Razorpay Order] Error:', lastError);
  const providerMessage =
    lastError?.error?.description ||
    lastError?.description ||
    lastError?.message ||
    'Failed to create order';

  return res.status(500).json({
    error: providerMessage,
    code: lastError?.error?.code || lastError?.code || 'RAZORPAY_ORDER_CREATE_FAILED',
    diagnostics: {
      keyIdSource: lastPair?.keyIdSource || 'NONE',
      keySecretSource: lastPair?.keySecretSource || 'NONE',
      keyMode: inferKeyMode(lastPair?.keyId || ''),
      keyIdTail: lastPair?.keyId ? lastPair.keyId.slice(-6) : '',
      triedPairs: keyPairs.map((pair) => `${pair.keyIdSource}+${pair.keySecretSource}`),
    },
  });
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const cleanEnv = (value: string) => String(value || '').trim().replace(/^['\"]|['\"]$/g, '');

const resolveKeys = () => {
  const merchantKey = cleanEnv(process.env.PAYU_MERCHANT_KEY || process.env.VITE_PAYU_MERCHANT_KEY || '');
  const merchantSalt = cleanEnv(process.env.PAYU_MERCHANT_SALT || process.env.VITE_PAYU_MERCHANT_SALT || '');
  return { merchantKey, merchantSalt };
};

const generatePayUHash = (params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  salt: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}) => {
  // PayU hash formula:
  // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
  const hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|${params.udf1 || ''}|${params.udf2 || ''}|${params.udf3 || ''}|${params.udf4 || ''}|${params.udf5 || ''}||||||${params.salt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
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

  const { amount, studentId, month, dueId, due_id, studentName, email, phone } = req.body;
  const finalDueId = String(dueId || due_id || '').trim();
  const { merchantKey, merchantSalt } = resolveKeys();

  console.log(`[PayU Order] Creating hash for student: ${studentId}, amount: ${amount}, due: ${finalDueId}`);

  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  if (!merchantKey || !merchantSalt) {
    return res.status(500).json({
      error: 'Server payment configuration missing (PAYU_MERCHANT_KEY / PAYU_MERCHANT_SALT).',
    });
  }

  try {
    const txnid = `BW${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const amountStr = Number(amount).toFixed(2);
    const productinfo = `Bus Fee - ${finalDueId}`;
    const firstname = String(studentName || 'Parent').slice(0, 60);
    const emailAddr = String(email || 'parent@buswaypro.app').trim();

    const hash = generatePayUHash({
      key: merchantKey,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email: emailAddr,
      salt: merchantSalt,
      udf1: finalDueId,
      udf2: String(studentId || ''),
      udf3: String(month || ''),
    });

    console.log(`[PayU Order] Generated hash for txnid: ${txnid}`);

    return res.status(200).json({
      merchantKey,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email: emailAddr,
      phone: String(phone || ''),
      hash,
      udf1: finalDueId,
      udf2: String(studentId || ''),
      udf3: String(month || ''),
    });
  } catch (error: any) {
    console.error('[PayU Order] Error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate payment hash',
      code: 'PAYU_HASH_FAILED',
    });
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const required = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ] as const;

  const optional = [
    'RAZORPAY_WEBHOOK_SECRET',
    'PAYMENT_EMAIL_ENABLED',
    'RESEND_API_KEY',
    'PAYMENT_EMAIL_FROM',
  ] as const;

  const missingRequired = required.filter((key) => !String(process.env[key] || '').trim());
  const missingOptional = optional.filter((key) => !String(process.env[key] || '').trim());

  return res.status(200).json({
    ok: missingRequired.length === 0,
    missingRequired,
    missingOptional,
    runtime: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      vercelEnv: process.env.VERCEL_ENV || 'unknown',
    },
  });
}

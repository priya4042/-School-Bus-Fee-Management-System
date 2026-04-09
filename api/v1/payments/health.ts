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

  const getEffective = (keys: string[]) => {
    for (const key of keys) {
      const value = String(process.env[key] || '').trim();
      if (value) {
        return { value, key };
      }
    }
    return { value: '', key: '' };
  };

  const requiredWithFallbacks = [
    { label: 'PAYU_MERCHANT_KEY', keys: ['PAYU_MERCHANT_KEY', 'VITE_PAYU_MERCHANT_KEY'] },
    { label: 'PAYU_MERCHANT_SALT', keys: ['PAYU_MERCHANT_SALT', 'VITE_PAYU_MERCHANT_SALT'] },
    { label: 'SUPABASE_URL', keys: ['SUPABASE_URL', 'VITE_SUPABASE_URL'] },
    { label: 'SUPABASE_SERVICE_ROLE_KEY', keys: ['SUPABASE_SERVICE_ROLE_KEY'] },
  ] as const;

  const optional = [
    'PAYMENT_EMAIL_ENABLED',
    'RESEND_API_KEY',
    'PAYMENT_EMAIL_FROM',
  ] as const;

  const resolvedRequired = requiredWithFallbacks.map((entry) => {
    const effective = getEffective([...entry.keys]);
    return {
      name: entry.label,
      present: Boolean(effective.value),
      resolvedFrom: effective.key || null,
    };
  });

  const missingRequired = resolvedRequired
    .filter((entry) => !entry.present)
    .map((entry) => entry.name);

  const missingOptional = optional.filter((key) => !String(process.env[key] || '').trim());

  return res.status(200).json({
    ok: missingRequired.length === 0,
    gateway: 'PayU',
    missingRequired,
    missingOptional,
    resolvedRequired,
    runtime: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      vercelEnv: process.env.VERCEL_ENV || 'unknown',
    },
  });
}

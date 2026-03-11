import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * Development OTP endpoint for localhost testing
 * In production, use /api/otp/send which calls Twilio
 * In development, this generates OTP and returns it for manual testing
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  try {
    // Format phone to E.164
    const digits = String(phone).replace(/\D/g, '');
    const formattedPhone = digits.startsWith('91') && digits.length === 12
      ? `+${digits}`
      : `+91${digits.slice(-10)}`;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    console.log(`[DEV OTP] Generating OTP for ${formattedPhone}: ${otp}`);

    // Store in Supabase
    const { error: dbError } = await supabase.from('otp_logs').insert({
      phone_number: formattedPhone,
      otp_code: otp,
      is_verified: false,
      expires_at: expiresAt,
    });

    if (dbError) throw dbError;

    // In DEVELOPMENT: Return the OTP so frontend can use it for testing
    // In PRODUCTION: Don't return OTP (user gets it via SMS)
    const isDev = !process.env.PRODUCTION || process.env.NODE_ENV !== 'production';
    
    console.log(`[DEV OTP] Success. Dev mode: ${isDev}, OTP: ${otp}`);

    return res.status(200).json({
      success: true,
      message: 'OTP generated successfully',
      ...(isDev && { otp, formattedPhone }) // Include OTP in dev mode only
    });
  } catch (err: any) {
    console.error('[DEV OTP] Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate OTP' });
  }
}

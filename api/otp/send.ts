import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  // Format phone to E.164
  const digits = String(phone).replace(/\D/g, '');
  const formattedPhone = digits.startsWith('91') && digits.length === 12
    ? `+${digits}`
    : `+91${digits.slice(-10)}`;

  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Store in Supabase otp_logs
    const { error: dbError } = await supabase.from('otp_logs').insert({
      phone_number: formattedPhone,
      otp_code: otp,
      is_verified: false,
      expires_at: expiresAt,
    });
    if (dbError) throw dbError;

    // Send SMS via Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
      console.error('[OTP Send] Twilio credentials missing');
      return res.status(500).json({ error: 'SMS service not configured. Contact admin.' });
    }

    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: `Your School Bus WayPro OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`,
      from: fromPhone,
      to: formattedPhone,
    });

    console.log(`[OTP Send] OTP sent to ${formattedPhone}`);
    return res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (err: any) {
    console.error('[OTP Send] Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send OTP' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

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

  const { phone, otp, admissionNumber } = req.body;
  console.log(`[OTP Verify] Request for phone: ${phone}, admission: ${admissionNumber}`);

  if (!phone || !otp || !admissionNumber) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('admission_number', admissionNumber.trim())
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) {
      console.warn(`[OTP Verify] Profile not found for admission: ${admissionNumber}`);
      return res.status(404).json({ error: 'Profile not found' });
    }

    const prefs = profile.preferences as any;
    if (!prefs || prefs.otp !== otp) {
      console.warn(`[OTP Verify] Invalid OTP for ${phone}`);
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (Date.now() > prefs.otp_expiry) {
      console.warn(`[OTP Verify] Expired OTP for ${phone}`);
      return res.status(400).json({ error: 'OTP expired' });
    }

    console.log(`[OTP Verify] Success for ${phone}`);
    res.status(200).json({ success: true, message: 'OTP verified' });
  } catch (error: any) {
    console.error('[OTP Verify] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify OTP' });
  }
}

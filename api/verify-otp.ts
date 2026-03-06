import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, otp, admissionNumber } = req.body;

  if (!phone || !otp || !admissionNumber) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Get profile and check OTP
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('admission_number', admissionNumber.trim())
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const prefs = profile.preferences as any;
    if (!prefs || prefs.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (Date.now() > prefs.otp_expiry) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // OTP is valid
    res.status(200).json({ success: true, message: 'OTP verified' });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify OTP' });
  }
}

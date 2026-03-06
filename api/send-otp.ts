import type { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, admissionNumber } = req.body;

  if (!phone || !admissionNumber) {
    return res.status(400).json({ error: 'Phone and Admission Number are required' });
  }

  try {
    // 1. Verify admission number exists and is a parent
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('admission_number', admissionNumber.trim())
      .eq('role', 'PARENT')
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) {
      return res.status(404).json({ error: 'Invalid admission number' });
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Send via Twilio
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: `Your School Bus WayPro verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone.startsWith('+') ? phone : `+91${phone}` // Default to India if no prefix
    });

    // 4. Store OTP in profiles table temporarily (using fleet_security_token as a hack if no other field exists, 
    // but let's try to use a dedicated table first, and fallback to a metadata field if we can)
    // Actually, let's just use the 'preferences' field which is a JSONB to store the OTP
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        preferences: { 
          otp, 
          otp_expiry: Date.now() + 5 * 60 * 1000, // 5 minutes
          temp_phone: phone
        }
      })
      .eq('admission_number', admissionNumber.trim());

    if (updateError) throw updateError;

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: error.message || 'Failed to send OTP' });
  }
}

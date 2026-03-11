import type { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
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

  const { phone, admissionNumber } = req.body;
  console.log(`[OTP Send] Request for phone: ${phone}, admission: ${admissionNumber}`);

  if (!phone || !admissionNumber) {
    return res.status(400).json({ error: 'Phone and Admission Number are required' });
  }

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('admission_number', admissionNumber.trim())
      .eq('role', 'PARENT')
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) {
      console.warn(`[OTP Send] Profile not found for admission: ${admissionNumber}`);
      return res.status(404).json({ error: 'Invalid admission number' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[OTP Send] Generated OTP for ${phone}`);

    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      // Assuming India code if no country code provided
      formattedPhone = `+91${formattedPhone.replace(/\D/g, '')}`;
    } else {
      formattedPhone = `+${formattedPhone.replace(/\D/g, '')}`;
    }

    console.log(`[OTP Send] Formatted phone number: ${formattedPhone}`);

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    try {
      await client.messages.create({
        body: `Your School Bus WayPro verification code is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });
      console.log(`[OTP Send] Twilio message sent successfully to ${formattedPhone}`);
    } catch (twilioError: any) {
      console.error(`[OTP Send] Twilio Error:`, twilioError);
      return res.status(500).json({ error: 'Failed to send SMS via Twilio. Please check phone number format.' });
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        preferences: { 
          otp, 
          otp_expiry: Date.now() + 5 * 60 * 1000,
          temp_phone: formattedPhone
        }
      })
      .eq('admission_number', admissionNumber.trim());

    if (updateError) {
      console.error(`[OTP Send] Supabase Update Error:`, updateError);
      throw updateError;
    }

    console.log(`[OTP Send] Success for ${formattedPhone}`);
    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('[OTP Send] Unexpected Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process OTP request' });
  }
}

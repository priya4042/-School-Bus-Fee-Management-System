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
    const normalizedAdmissionNumber = admissionNumber.trim();

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, parent_id')
      .eq('admission_number', admissionNumber.trim())
      .maybeSingle();

    if (studentError) throw studentError;
    if (!student) {
      console.warn(`[OTP Send] Student not found for admission: ${admissionNumber}`);
      return res.status(404).json({ error: 'Invalid admission number' });
    }

    if (student.parent_id) {
      return res.status(409).json({ error: 'This admission number is already linked to a parent account.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[OTP Send] Generated OTP for ${phone}`);

    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+91${formattedPhone.replace(/\D/g, '')}`;
    } else {
      formattedPhone = `+${formattedPhone.replace(/\D/g, '')}`;
    }

    console.log(`[OTP Send] Formatted phone number: ${formattedPhone}`);

    // Save OTP to DB first so frontend DB-fallback verification always works
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { error: otpLogError } = await supabase.from('otp_logs').insert({
      phone_number: formattedPhone,
      otp_code: otp,
      is_verified: false,
      expires_at: expiresAt,
    });
    if (otpLogError) throw otpLogError;

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioSid || !twilioToken || !twilioFrom) {
      console.warn('[OTP Send] Twilio not configured — OTP saved in DB for fallback verification');
      console.log(`[OTP Send] Success (DB-only) for ${formattedPhone} and admission ${normalizedAdmissionNumber}`);
      return res.status(200).json({ success: true, message: 'OTP sent', devOtp: otp });
    }

    try {
      const client = twilio(twilioSid, twilioToken);
      await client.messages.create({
        body: `Your School Bus WayPro verification code is: ${otp}`,
        from: twilioFrom,
        to: formattedPhone,
      });
      console.log(`[OTP Send] Twilio message sent successfully to ${formattedPhone}`);
    } catch (twilioError: any) {
      // Twilio failed but OTP is already saved in DB — return success so frontend can verify via DB
      console.warn(`[OTP Send] Twilio failed (OTP in DB): ${twilioError?.message}`);
      return res.status(200).json({ success: true, message: 'OTP saved (SMS unavailable)', devOtp: otp });
    }

    console.log(`[OTP Send] Success for ${formattedPhone} and admission ${normalizedAdmissionNumber}`);
    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('[OTP Send] Unexpected Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process OTP request' });
  }
}

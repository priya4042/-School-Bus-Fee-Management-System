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

  let formattedPhone = phone.trim();
  if (!formattedPhone.startsWith('+')) {
    formattedPhone = `+91${formattedPhone.replace(/\D/g, '')}`;
  } else {
    formattedPhone = `+${formattedPhone.replace(/\D/g, '')}`;
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
      console.warn(`[OTP Verify] Student not found for admission: ${admissionNumber}`);
      return res.status(404).json({ error: 'Admission number not found' });
    }

    if (student.parent_id) {
      return res.status(409).json({ error: 'This admission number is already linked to a parent account.' });
    }

    const now = new Date().toISOString();
    const { data: otpLogs, error: otpError } = await supabase
      .from('otp_logs')
      .select('id')
      .eq('phone_number', formattedPhone)
      .eq('otp_code', otp.trim())
      .eq('is_verified', false)
      .gte('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1);

    if (otpError) throw otpError;
    if (!otpLogs || otpLogs.length === 0) {
      console.warn(`[OTP Verify] Invalid or expired OTP for ${formattedPhone}`);
      return res.status(400).json({ error: 'Invalid OTP or phone number' });
    }

    const { error: verifyError } = await supabase
      .from('otp_logs')
      .update({ is_verified: true })
      .eq('id', otpLogs[0].id);

    if (verifyError) throw verifyError;

    console.log(`[OTP Verify] Success for ${phone} and admission ${normalizedAdmissionNumber}`);
    res.status(200).json({ success: true, message: 'OTP verified' });
  } catch (error: any) {
    console.error('[OTP Verify] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify OTP' });
  }
}

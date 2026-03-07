const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabase');
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Send OTP
router.post('/send', async (req, res) => {
  const { phone, admissionNumber } = req.body;
  if (!phone || !admissionNumber) {
    return res.status(400).json({ error: 'Phone and Admission Number are required' });
  }

  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('admission_number', admissionNumber.trim())
      .eq('role', 'PARENT')
      .maybeSingle();

    if (!profile) {
      return res.status(404).json({ error: 'Invalid admission number' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const formattedPhone = `+91${phone.replace(/\D/g, '').slice(-10)}`;

    await client.messages.create({
      body: `Your verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    await supabaseAdmin
      .from('profiles')
      .update({
        preferences: {
          otp,
          otp_expiry: Date.now() + 5 * 60 * 1000,
          temp_phone: formattedPhone,
        },
      })
      .eq('admission_number', admissionNumber.trim());

    res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  const { phone, otp, admissionNumber } = req.body;
  if (!phone || !otp || !admissionNumber) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('preferences')
      .eq('admission_number', admissionNumber.trim())
      .maybeSingle();

    const prefs = profile?.preferences;
    if (!prefs || prefs.otp !== otp || Date.now() > prefs.otp_expiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.json({ success: true, message: 'OTP verified' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

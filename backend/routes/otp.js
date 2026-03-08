const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabase');
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);



// ================= SEND OTP =================
router.post('/send', async (req, res) => {

  const { phone, admission_number, admissionNumber } = req.body;

  const admission = admission_number || admissionNumber;

  if (!phone || !admission) {
    return res.status(400).json({
      error: 'Phone and Admission Number are required'
    });
  }

  try {

    // 1️⃣ Find parent via student
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('parent_id')
      .eq('admission_number', admission.trim())
      .maybeSingle();

    if (!student || !student.parent_id) {
      return res.status(404).json({
        error: 'Parent not linked to this admission number'
      });
    }

    // 2️⃣ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const formattedPhone =
      '+91' + phone.replace(/\D/g, '').slice(-10);

    // 3️⃣ Send SMS
    await client.messages.create({
      body: `Your BusWay login OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    // 4️⃣ Save OTP in otp_logs
    await supabaseAdmin
      .from('otp_logs')
      .insert({
        phone_number: formattedPhone,
        otp_code: otp,
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
      });

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: err.message });
  }
});



// ================= VERIFY OTP =================
router.post('/verify', async (req, res) => {

  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({
      error: 'Phone and OTP required'
    });
  }

  try {

    const formattedPhone =
      '+91' + phone.replace(/\D/g, '').slice(-10);

    const { data: record } = await supabaseAdmin
      .from('otp_logs')
      .select('*')
      .eq('phone_number', formattedPhone)
      .eq('otp_code', otp)
      .eq('is_verified', false)
      .maybeSingle();

    if (!record) {
      return res.status(400).json({
        error: 'Invalid OTP'
      });
    }

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({
        error: 'OTP expired'
      });
    }

    // mark OTP used
    await supabaseAdmin
      .from('otp_logs')
      .update({ is_verified: true })
      .eq('id', record.id);

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
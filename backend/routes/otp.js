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

  const phone =
    req.body.phone ||
    req.body.mobile_number ||
    req.body.mobileNumber;

  const admission =
    req.body.admission_number ||
    req.body.admissionNumber;

  if (!phone || !admission) {
    return res.status(400).json({
      error: 'Phone and Admission Number are required'
    });
  }

  try {

    // Find student
    const { data: student, error } = await supabaseAdmin
      .from('students')
      .select('parent_id')
      .eq('admission_number', admission.trim())
      .maybeSingle();

    if (error) throw error;

    if (!student || !student.parent_id) {
      return res.status(404).json({
        error: 'Parent not linked to this admission number'
      });
    }

    const formattedPhone =
      '+91' + phone.replace(/\D/g, '').slice(-10);

    // Generate OTP
    const otp =
      Math.floor(100000 + Math.random() * 900000).toString();

    // Send SMS
    await client.messages.create({
      body: `Your BusWay login OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    // Save OTP
    await supabaseAdmin
      .from('otp_logs')
      .insert({
        phone_number: formattedPhone,
        otp_code: otp,
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
        is_verified: false
      });

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (err) {

    console.error('Send OTP error:', err);

    res.status(500).json({
      error: 'Failed to send OTP'
    });
  }
});



// ================= VERIFY OTP =================
router.post('/verify', async (req, res) => {

  const phone =
    req.body.phone ||
    req.body.mobile_number ||
    req.body.mobileNumber;

  const otp = req.body.otp;

  if (!phone || !otp) {
    return res.status(400).json({
      error: 'Phone and OTP required'
    });
  }

  try {

    const formattedPhone =
      '+91' + phone.replace(/\D/g, '').slice(-10);

    const { data: record, error } = await supabaseAdmin
      .from('otp_logs')
      .select('*')
      .eq('phone_number', formattedPhone)
      .eq('otp_code', otp)
      .eq('is_verified', false)
      .maybeSingle();

    if (error) throw error;

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

    // mark OTP verified
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

    res.status(500).json({
      error: 'OTP verification failed'
    });
  }
});


module.exports = router;
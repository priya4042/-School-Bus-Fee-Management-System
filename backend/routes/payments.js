const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabase');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
router.post('/create-order', async (req, res) => {
  const { amount } = req.body;
  if (!amount) {
    return res.status(400).json({ error: 'Amount required' });
  }

  try {
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Verify Payment
router.post('/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dueId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment details' });
  }

  // Signature verification
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    const { error } = await supabaseAdmin
      .from('monthly_dues')
      .update({ 
        status: 'PAID', 
        paid_at: new Date().toISOString(),
        payment_id: razorpay_payment_id
      })
      .eq('id', dueId);

    if (error) throw error;

    // Send payment confirmation SMS
    try {
      const { data: due } = await supabaseAdmin
        .from('monthly_dues')
        .select('student_id, amount, month')
        .eq('id', dueId)
        .single();

      if (due) {
        const { data: student } = await supabaseAdmin
          .from('students')
          .select('full_name, parent_id')
          .eq('id', due.student_id)
          .single();

        if (student) {
          const { data: parent } = await supabaseAdmin
            .from('profiles')
            .select('phone')
            .eq('id', student.parent_id)
            .single();

          if (parent?.phone) {
            const { sendSMS } = require('../utils/sms');
            await sendSMS(parent.phone, `Payment of ₹${due.amount} for ${student.full_name} (${due.month}) was successful. Receipt ID: ${razorpay_payment_id}`);
          }
        }
      }
    } catch (smsErr) {
      console.error('Failed to send payment SMS:', smsErr);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Webhook
router.post('/webhook', async (req, res) => {
  // Handle webhook logic here
  res.status(200).json({ status: 'ok' });
});

module.exports = router;

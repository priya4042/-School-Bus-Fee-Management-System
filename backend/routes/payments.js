const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabase');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
router.post('/createOrder', async (req, res) => {
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
router.post('/verifyPayment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dueId } = req.body;

  // Signature verification logic omitted for brevity, add it here for production
  try {
    const { error } = await supabaseAdmin
      .from('monthly_dues')
      .update({ status: 'PAID', paid_at: new Date().toISOString() })
      .eq('id', dueId);

    if (error) throw error;
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

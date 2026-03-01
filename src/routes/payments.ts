import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { supabase } from '../services/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { sendWhatsAppMessage } from '../services/notification.js';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Create Razorpay Order
router.post('/create-order', authenticate, async (req: any, res) => {
  const { paymentId } = req.body;
  const parentId = req.user.id;

  try {
    // 1. Fetch existing payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('parent_id', parentId)
      .single();

    if (error || !payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    if (payment.status === 'captured') {
      return res.status(400).json({ error: 'Payment already completed' });
    }

    // 2. If order already exists, return it
    if (payment.razorpay_order_id) {
      return res.json({ id: payment.razorpay_order_id, amount: Math.round(payment.total_amount * 100), currency: 'INR' });
    }

    // 3. Create new order
    const options = {
      amount: Math.round(payment.total_amount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `rcpt_${payment.id.slice(0, 8)}`,
    };

    const order = await razorpay.orders.create(options);

    // 4. Update payment record with order ID
    await supabase.from('payments').update({
      razorpay_order_id: order.id,
      updated_at: new Date().toISOString()
    }).eq('id', payment.id);

    res.json(order);
  } catch (err) {
    console.error('Razorpay Order Error:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify Payment (Client-side callback)
router.post('/verify', authenticate, async (req: any, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    // Update payment status
    const { data: payment, error } = await supabase
      .from('payments')
      .update({ 
        status: 'captured', 
        razorpay_payment_id,
        payment_method: 'online',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select('*, students(full_name, parent_phone)')
      .single();

    if (error) return res.status(500).json({ error: 'Failed to update payment status' });

    // Send WhatsApp Notification
    if (payment && payment.students?.parent_phone) {
      const message = `Payment Received\n\nStudent: ${payment.students.full_name}\nMonth: ${payment.billing_month}\nAmount: ₹${payment.total_amount}\n\nThank you for using BusWay Pro.`;
      await sendWhatsAppMessage(payment.students.parent_phone, message);
    }

    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
});

// Razorpay Webhook (Production Grade)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const signature = req.headers['x-razorpay-signature'] as string;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === 'payment.captured') {
    const { order_id, id: payment_id } = event.payload.payment.entity;

    // Idempotent update
    const { data: payment, error } = await supabase
      .from('payments')
      .update({ 
        status: 'captured', 
        razorpay_payment_id: payment_id,
        payment_method: 'online',
        updated_at: new Date().toISOString(),
        paid_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', order_id)
      .neq('status', 'captured')
      .select('*, students(full_name, parent_phone)')
      .single();

    if (error) {
      console.error('Webhook DB Update Error:', error);
    } else if (payment) {
      // Send WhatsApp Notification
      const studentName = payment.students?.full_name || 'Student';
      const parentPhone = payment.students?.parent_phone;
      if (parentPhone) {
        const message = `Payment Received\n\nStudent: ${studentName}\nMonth: ${payment.billing_month}\nAmount: ₹${payment.amount}\n\nThank you for using BusWay Pro.`;
        await sendWhatsAppMessage(parentPhone, message);
      }
    }
  }

  res.json({ status: 'ok' });
});

export default router;

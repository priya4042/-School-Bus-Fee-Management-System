import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = keyId && keySecret ? new Razorpay({
  key_id: keyId,
  key_secret: keySecret
}) : null;

export const createOrder = async (amount: number, currency: string = 'INR') => {
  if (!razorpay) {
    console.warn('[Razorpay] Credentials missing. Creating mock order.');
    return { id: 'mock_order_' + Date.now(), amount: amount * 100, currency };
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in paisa
      currency,
      receipt: 'receipt_' + Date.now()
    });
    return order;
  } catch (error) {
    console.error('[Razorpay] Error creating order:', error);
    throw error;
  }
};

export const verifyPayment = (orderId: string, paymentId: string, signature: string) => {
  if (!razorpay || !keySecret) return true; // Mock verification if not configured

  const hmac = crypto.createHmac('sha256', keySecret);
  hmac.update(orderId + "|" + paymentId);
  const generatedSignature = hmac.digest('hex');
  
  return generatedSignature === signature;
};

import axios from 'axios';
import { ENV } from '../config/env';
import { loadPayU } from '../lib/razorpay';
import { openEasebuzzCheckout } from '../lib/easebuzz';

export const paymentService = {
  /**
   * Create a payment hash for monthly bus fee via PayU
   */
  createPaymentOrder: async (amount, studentId, month) => {
    if (!ENV.PAYU_MERCHANT_KEY) {
      console.warn('PAYU_MERCHANT_KEY is missing. Payment gateway is being configured.');
      return { success: false, error: 'Payment gateway is being configured by our developers. Please try again later.' };
    }

    try {
      const response = await axios.post(`${ENV.API_BASE_URL}/api/payments/createOrder`, {
        amount,
        studentId,
        month
      });

      return {
        success: true,
        txnid: response.data.txnid,
        hash: response.data.hash,
        merchantKey: response.data.merchantKey,
        amount: response.data.amount,
      };
    } catch (error) {
      console.error('Failed to create payment order:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  /**
   * Verify the payment after PayU checkout
   */
  verifyPayment: async (paymentData) => {
    if (!ENV.PAYU_MERCHANT_KEY) {
      return { success: false, error: 'Payment gateway is being configured. Please try again later.' };
    }

    try {
      const response = await axios.post(`${ENV.API_BASE_URL}/api/payments/verifyPayment`, paymentData);

      return { success: true, message: 'Payment verified successfully', data: response.data };
    } catch (error) {
      console.error('Failed to verify payment:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  /**
   * Create an Easebuzz payment link (returns access_key for checkout.js)
   */
  createEasebuzzOrder: async ({ amount, studentId, month, dueId, studentName, email, phone }) => {
    if (!ENV.EASEBUZZ_KEY) {
      console.warn('EASEBUZZ_KEY is missing. Easebuzz gateway is being configured.');
      return { success: false, error: 'Easebuzz is being configured. Please try again later.' };
    }

    try {
      const response = await axios.post(`${ENV.API_BASE_URL}/api/v1/payments/easebuzzInitiate`, {
        amount,
        studentId,
        month,
        dueId,
        studentName,
        email,
        phone,
      });

      return {
        success: true,
        accessKey: response.data.accessKey,
        merchantKey: response.data.key,
        env: response.data.env,
        txnid: response.data.txnid,
        amount: response.data.amount,
      };
    } catch (error) {
      console.error('Failed to create Easebuzz order:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  /**
   * Open Easebuzz checkout and resolve with the gateway response on close.
   * The caller is responsible for forwarding the response to verifyEasebuzzPayment.
   */
  openEasebuzzCheckout: ({ accessKey, merchantKey, env }) =>
    new Promise((resolve) => {
      openEasebuzzCheckout({
        accessKey,
        merchantKey,
        env,
        onResponse: (response) => resolve(response),
      }).then((launched) => {
        if (!launched) resolve({ status: 'launch_failed' });
      });
    }),

  /**
   * Verify the Easebuzz response hash server-side and record the payment.
   */
  verifyEasebuzzPayment: async (paymentData) => {
    try {
      const response = await axios.post(
        `${ENV.API_BASE_URL}/api/v1/payments/verifyEasebuzz`,
        paymentData
      );
      return { success: true, message: 'Payment verified successfully', data: response.data };
    } catch (error) {
      console.error('Failed to verify Easebuzz payment:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  /**
   * Full Easebuzz flow: create order → open checkout → verify.
   * Returns { success, data } or { success: false, error }.
   */
  payWithEasebuzz: async ({ amount, studentId, month, dueId, studentName, email, phone }) => {
    const order = await paymentService.createEasebuzzOrder({
      amount,
      studentId,
      month,
      dueId,
      studentName,
      email,
      phone,
    });
    if (!order.success) return order;

    const response = await paymentService.openEasebuzzCheckout({
      accessKey: order.accessKey,
      merchantKey: order.merchantKey,
      env: order.env,
    });

    if (!response || response.status === 'launch_failed') {
      return { success: false, error: 'Failed to open Easebuzz checkout' };
    }
    if (String(response.status).toLowerCase() !== 'success') {
      return { success: false, error: `Payment ${response.status}`, data: response };
    }

    return paymentService.verifyEasebuzzPayment({ ...response, dueId });
  },

  /**
   * Generate a downloadable PDF receipt
   */
  generateReceipt: async (transactionId, details) => {
    try {
      console.log(`Generating receipt for transaction ${transactionId}`, details);

      const receiptHtml = `
        <html>
          <head>
            <title>Receipt - ${transactionId}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
              .container { max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 30px; border-radius: 8px; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h2 { color: #3b82f6; margin: 0 0 10px 0; }
              .details { margin-bottom: 30px; }
              .details p { margin: 5px 0; }
              .total { text-align: right; font-size: 1.2em; border-top: 2px solid #eee; padding-top: 20px; }
              .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #888; }
              @media print {
                body { padding: 0; }
                .container { border: none; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>School Bus WayPro</h2>
                <h3>Payment Receipt</h3>
              </div>
              <div class="details">
                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Student ID:</strong> ${details?.studentId || 'N/A'}</p>
                <p><strong>Month:</strong> ${details?.month || 'N/A'}</p>
                <p><strong>Payment Method:</strong> ${details?.method || 'Online'}</p>
              </div>
              <div class="total">
                <strong>Total Amount: ₹${details?.amount || 0}</strong>
              </div>
              <div class="footer">
                Thank you for your payment!
              </div>
            </div>
            <script>
              window.onload = () => {
                window.print();
                setTimeout(() => window.close(), 500);
              };
            </script>
          </body>
        </html>
      `;

      const blob = new Blob([receiptHtml], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);

      // Open in new window to trigger print dialog (Save as PDF)
      const printWindow = window.open(url, '_blank');
      if (!printWindow) {
        throw new Error('Please allow popups to generate receipt');
      }

      return { success: true, message: 'Receipt generated successfully' };
    } catch (error) {
      console.error('Failed to generate receipt:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Admin function to mark a payment as cash
   */
  markCashPayment: async (studentId, amount, month, adminNotes) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.from('payments').insert({
        student_id: studentId,
        amount: amount,
        month: month,
        notes: adminNotes,
        status: 'SUCCESS',
        method: 'CASH',
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      return { success: true, message: 'Cash payment recorded successfully' };
    } catch (error) {
      console.error('Failed to record cash payment:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Initialize PayU Bolt checkout
   */
  initiateCheckout: async (amount, studentId, month, userDetails, onSuccess, onError) => {
    const res = await loadPayU();

    if (!res || !window.bolt) {
      if (onError) onError('PayU SDK failed to load. Are you online?');
      return;
    }

    const orderRes = await paymentService.createPaymentOrder(amount, studentId, month);

    if (!orderRes.success) {
      if (onError) onError(orderRes.error);
      return;
    }

    if (!ENV.PAYU_MERCHANT_KEY) {
      if (onError) onError('Payment gateway is being configured by our developers. Please try again later.');
      return;
    }

    const surl = `${window.location.origin}/api/v1/payments/verifyPayment`;
    const furl = `${window.location.origin}/api/v1/payments/verifyPayment`;

    const payuData = {
      key: orderRes.merchantKey,
      txnid: orderRes.txnid,
      amount: orderRes.amount,
      productinfo: `Bus Fee for ${month}`,
      firstname: userDetails?.name || '',
      email: userDetails?.email || 'parent@buswaypro.app',
      phone: userDetails?.phone || '',
      surl,
      furl,
      hash: orderRes.hash,
    };

    window.bolt.launch(payuData, {
      responseHandler: function (response) {
        const txnResponse = response.response || {};
        if (txnResponse.txnStatus === 'SUCCESS') {
          if (onSuccess) onSuccess(txnResponse);
        } else {
          if (onError) onError(txnResponse.txnMessage || 'Payment failed');
        }
      },
      catchException: function (error) {
        if (onError) onError(error?.message || 'Payment checkout error');
      }
    });
  }
};

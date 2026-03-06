import axios from 'axios';
import { ENV } from '../config/env';

// Helper to load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const paymentService = {
  /**
   * Create a payment order for monthly bus fee
   */
  createPaymentOrder: async (amount, studentId, month) => {
    if (!ENV.RAZORPAY_KEY_ID) {
      console.warn('RAZORPAY_KEY_ID is missing in env.js. Simulating payment order.');
      return { success: true, orderId: `sim_order_${Date.now()}`, amount };
    }

    try {
      // In a real app, this calls your backend to create a Razorpay order securely
      const response = await axios.post('/api/create-razorpay-order', {
        amount,
        studentId,
        month
      });

      return { 
        success: true, 
        orderId: response.data.orderId, 
        amount: response.data.amount,
        currency: response.data.currency || 'INR'
      };
    } catch (error) {
      console.error('Failed to create payment order:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  /**
   * Verify the payment after Razorpay checkout
   */
  verifyPayment: async (paymentData) => {
    if (!ENV.RAZORPAY_KEY_ID) {
      console.warn('RAZORPAY_KEY_ID is missing. Simulating payment verification.');
      return { success: true, message: 'Payment verified (simulated)' };
    }

    try {
      // In a real app, this calls your backend to verify the Razorpay signature
      const response = await axios.post('/api/verify-razorpay-payment', paymentData);
      
      return { success: true, message: 'Payment verified successfully', data: response.data };
    } catch (error) {
      console.error('Failed to verify payment:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
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
   * Initialize Razorpay checkout
   */
  initiateCheckout: async (amount, studentId, month, userDetails, onSuccess, onError) => {
    const res = await loadRazorpayScript();
    
    if (!res) {
      if (onError) onError('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const orderRes = await paymentService.createPaymentOrder(amount, studentId, month);
    
    if (!orderRes.success) {
      if (onError) onError(orderRes.error);
      return;
    }

    if (!ENV.RAZORPAY_KEY_ID) {
      // Simulated success if no key
      setTimeout(() => {
        const mockPaymentData = {
          razorpay_payment_id: `sim_pay_${Date.now()}`,
          razorpay_order_id: orderRes.orderId,
          razorpay_signature: 'sim_signature'
        };
        if (onSuccess) onSuccess(mockPaymentData);
      }, 1000);
      return;
    }

    const options = {
      key: ENV.RAZORPAY_KEY_ID,
      amount: orderRes.amount,
      currency: orderRes.currency || 'INR',
      name: 'School Bus WayPro',
      description: `Bus Fee for ${month}`,
      order_id: orderRes.orderId,
      handler: async function (response) {
        const verifyRes = await paymentService.verifyPayment(response);
        if (verifyRes.success) {
          if (onSuccess) onSuccess(response);
        } else {
          if (onError) onError(verifyRes.error);
        }
      },
      prefill: {
        name: userDetails?.name || '',
        email: userDetails?.email || '',
        contact: userDetails?.phone || ''
      },
      theme: {
        color: '#3b82f6'
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response) {
      if (onError) onError(response.error.description);
    });
    paymentObject.open();
  }
};

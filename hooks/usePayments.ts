
import { useState } from 'react';
import api from '../lib/api';
import { loadRazorpay, openRazorpay } from '../lib/razorpay';
import { PaymentStatus } from '../types';

export const usePayments = () => {
  const [loading, setLoading] = useState(false);

  const initiatePayment = async (dueId: string, amount: number, studentName: string) => {
    setLoading(true);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error('Razorpay SDK failed to load');

      // 1. Create Order on Backend (Mocked response here for immediate UI feedback)
      // In prod: const { data: order } = await api.post('/payments/create-order', { due_id: dueId });
      const mockOrder = {
        id: `order_${Math.random().toString(36).slice(2, 10)}`,
        amount: amount * 100, // Razorpay expects paise
        currency: 'INR'
      };

      // 2. Open Razorpay Checkout with Multi-channel support
      const options = {
        key: 'rzp_test_YourTestKey', // Replace with your actual key in prod
        amount: mockOrder.amount,
        currency: 'INR',
        name: 'BusWay Pro',
        description: `Bus Fee Payment - ${studentName}`,
        order_id: mockOrder.id,
        handler: async (response: any) => {
          // 3. Verify Payment
          try {
            // In prod: await api.post('/payments/verify', {
            //   due_id: dueId,
            //   razorpay_order_id: response.razorpay_order_id,
            //   razorpay_payment_id: response.razorpay_payment_id,
            //   razorpay_signature: response.razorpay_signature,
            // });
            alert(`Payment of ₹${amount} successful! (Transaction: ${response.razorpay_payment_id})`);
            window.location.reload();
          } catch (verifyErr) {
            console.error("Verification failed", verifyErr);
            alert("Payment successful but verification failed. Contact support.");
          }
        },
        prefill: {
          name: studentName,
          email: "parent@example.com",
          contact: "9999999999"
        },
        notes: {
          student_id: studentName,
          due_id: dueId
        },
        theme: { 
          color: '#1e40af' 
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed by user');
          }
        }
      };

      openRazorpay(options);
    } catch (err) {
      console.error(err);
      alert('Payment failed to initialize. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return { initiatePayment, loading };
};

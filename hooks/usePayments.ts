import { useState } from 'react';
import { showToast, showAlert } from '../lib/swal';
import api from '../lib/api';

declare const Razorpay: any;

export type PaymentMethod = 'RAZORPAY';

interface PaymentState {
  isOpen: boolean;
  dueId: string | null;
  amount: number;
  studentName: string;
  step: 'SELECT' | 'PROCESSING' | 'SUCCESS';
  transactionId: string | null;
}

export const usePayments = () => {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isOpen: false,
    dueId: null,
    amount: 0,
    studentName: '',
    step: 'SELECT',
    transactionId: null
  });

  const openPortal = (dueId: string, amount: number, studentName: string) => {
    setPaymentState({
      isOpen: true,
      dueId,
      amount,
      studentName,
      step: 'SELECT',
      transactionId: null
    });
  };

  const closePortal = () => {
    setPaymentState(prev => ({ ...prev, isOpen: false }));
  };

  const initiateRazorpay = async () => {
    setPaymentState(prev => ({ ...prev, step: 'PROCESSING' }));
    try {
      // 1. Create order on backend
      const { data: order } = await api.post('/payments/create-order', {
        amount: paymentState.amount,
        dueId: paymentState.dueId
      });

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "BusWay Pro",
        description: `Fee Payment for ${paymentState.studentName}`,
        order_id: order.id,
        handler: async (response: any) => {
          // 3. Verify payment on backend
          try {
            const { data: verifyData } = await api.post('/payments/verify', {
              ...response,
              dueId: paymentState.dueId
            });

            if (verifyData.success) {
              setPaymentState(prev => ({
                ...prev,
                step: 'SUCCESS',
                transactionId: response.razorpay_payment_id
              }));
              showToast('Payment Successful', 'success');
            } else {
              throw new Error('Verification failed');
            }
          } catch (err: any) {
            showAlert('Payment Error', err.message || 'Failed to verify payment', 'error');
            setPaymentState(prev => ({ ...prev, step: 'SELECT' }));
          }
        },
        prefill: {
          name: paymentState.studentName,
        },
        theme: {
          color: "#1e40af"
        }
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        showAlert('Payment Failed', response.error.description, 'error');
        setPaymentState(prev => ({ ...prev, step: 'SELECT' }));
      });
      rzp.open();

    } catch (err: any) {
      console.error("Razorpay initialization failed", err);
      showToast(err.message || 'Failed to initiate payment', 'error');
      setPaymentState(prev => ({ ...prev, step: 'SELECT' }));
    }
  };

  return { 
    paymentState, 
    openPortal, 
    closePortal, 
    initiateRazorpay
  };
};

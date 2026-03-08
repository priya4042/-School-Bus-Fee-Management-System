import { useState } from 'react';

export const usePayments = () => {
  const [paymentState, setPaymentState] = useState({
    step: 'idle',
    amount: 0,
    description: '',
    loading: false
  });

  const openPortal = (dueId: string, amount: number, description: string) => {
    setPaymentState({
      step: 'portal',
      amount,
      description,
      loading: false
    });
  };

  const closePortal = () => {
    setPaymentState(prev => ({ ...prev, step: 'idle' }));
  };

  const initiateRazorpay = async () => {
    setPaymentState(prev => ({ ...prev, loading: true }));
    // Mock Razorpay initiation
    setTimeout(() => {
      setPaymentState(prev => ({ ...prev, step: 'success', loading: false }));
    }, 2000);
  };

  return {
    paymentState,
    openPortal,
    closePortal,
    initiateRazorpay
  };
};

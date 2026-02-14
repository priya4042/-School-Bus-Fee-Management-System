
import { useState } from 'react';
import { showToast, showAlert, showLoading, closeSwal } from '../lib/swal';

export type PaymentMethod = 'CARD' | 'UPI' | 'GPAY' | 'PAYTM';

interface PaymentState {
  isOpen: boolean;
  dueId: string | number | null;
  amount: number;
  studentName: string;
  method: PaymentMethod | null;
  step: 'SELECT' | 'DETAILS' | 'PROCESSING' | 'SUCCESS';
}

export const usePayments = () => {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isOpen: false,
    dueId: null,
    amount: 0,
    studentName: '',
    method: null,
    step: 'SELECT',
  });

  const openPortal = (dueId: string | number, amount: number, studentName: string) => {
    setPaymentState({
      isOpen: true,
      dueId,
      amount,
      studentName,
      method: null,
      step: 'SELECT',
    });
  };

  const closePortal = () => {
    setPaymentState(prev => ({ ...prev, isOpen: false }));
  };

  const selectMethod = (method: PaymentMethod) => {
    if (method === 'GPAY' || method === 'PAYTM') {
      processPayment(method);
    } else {
      setPaymentState(prev => ({ ...prev, method, step: 'DETAILS' }));
    }
  };

  const processPayment = (method: PaymentMethod, details?: any) => {
    setPaymentState(prev => ({ ...prev, method, step: 'PROCESSING' }));
    
    // Simulate Gateway Communication
    setTimeout(() => {
      setPaymentState(prev => ({ ...prev, step: 'SUCCESS' }));
      
      // Update local storage/state to reflect payment
      const existingDues = JSON.parse(localStorage.getItem('fee_dues') || '[]');
      const updatedDues = existingDues.map((d: any) => 
        String(d.id) === String(paymentState.dueId) ? { ...d, status: 'PAID' } : d
      );
      localStorage.setItem('fee_dues', JSON.stringify(updatedDues));
      
      showToast('Payment Settled Successfully', 'success');
      
      // Refresh page after a delay to show updated ledger
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }, 2500);
  };

  return { 
    paymentState, 
    openPortal, 
    closePortal, 
    selectMethod, 
    processPayment 
  };
};

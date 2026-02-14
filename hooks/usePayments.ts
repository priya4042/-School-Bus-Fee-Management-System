
import { useState } from 'react';
import { showToast } from '../lib/swal';
import { PaymentStatus } from '../types';

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
      // Simulate App Redirection immediately for Wallets
      setPaymentState(prev => ({ ...prev, method, step: 'PROCESSING' }));
      processPayment(method);
    } else {
      setPaymentState(prev => ({ ...prev, method, step: 'DETAILS' }));
    }
  };

  // Renamed from executePayment to processPayment to match pages/ParentDashboard.tsx and pages/Payments.tsx
  const processPayment = (method: PaymentMethod, details?: any) => {
    setPaymentState(prev => ({ ...prev, method, step: 'PROCESSING' }));
    
    // Simulate Network Latency / Bank Processing
    setTimeout(() => {
      // Update local storage to persist the "PAID" status
      const savedDues = localStorage.getItem('fee_dues');
      if (savedDues) {
        const dues = JSON.parse(savedDues);
        const updatedDues = dues.map((d: any) => 
          String(d.id) === String(paymentState.dueId) ? { ...d, status: PaymentStatus.PAID } : d
        );
        localStorage.setItem('fee_dues', JSON.stringify(updatedDues));
      }

      setPaymentState(prev => ({ ...prev, step: 'SUCCESS' }));
      showToast('Transaction Settled', 'success');
      
      // Auto-reload after success to refresh parent dashboard/ledger
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }, 3000);
  };

  return { 
    paymentState, 
    openPortal, 
    closePortal, 
    selectMethod, 
    processPayment 
  };
};

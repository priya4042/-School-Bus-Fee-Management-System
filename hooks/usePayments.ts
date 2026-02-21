
import { useState } from 'react';
import { showToast } from '../lib/swal';
import { PaymentStatus, MonthlyDue } from '../types';
import { MONTHS } from '../constants';

export type PaymentMethod = 'CARD' | 'UPI' | 'GPAY' | 'PAYTM';

interface PaymentState {
  isOpen: boolean;
  dueId: string | number | null;
  amount: number;
  studentName: string;
  method: PaymentMethod | null;
  step: 'SELECT' | 'DETAILS' | 'PROCESSING' | 'SUCCESS';
  transactionId: string | null;
  monthYear: string | null;
}

export const usePayments = () => {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isOpen: false,
    dueId: null,
    amount: 0,
    studentName: '',
    method: null,
    step: 'SELECT',
    transactionId: null,
    monthYear: null
  });

  const openPortal = (dueId: string | number, amount: number, studentName: string) => {
    // Find due details for the receipt
    const savedDues = localStorage.getItem('fee_dues');
    let monthYear = "N/A";
    if (savedDues) {
        const dues = JSON.parse(savedDues);
        const due = dues.find((d: any) => String(d.id) === String(dueId));
        if (due) monthYear = `${MONTHS[due.month-1]} ${due.year}`;
    }

    setPaymentState({
      isOpen: true,
      dueId,
      amount,
      studentName,
      method: null,
      step: 'SELECT',
      transactionId: null,
      monthYear
    });
  };

  const closePortal = () => {
    setPaymentState(prev => ({ ...prev, isOpen: false }));
  };

  const selectMethod = (method: PaymentMethod) => {
    if (method === 'GPAY' || method === 'PAYTM') {
      setPaymentState(prev => ({ ...prev, method, step: 'PROCESSING' }));
      processPayment(method);
    } else {
      setPaymentState(prev => ({ ...prev, method, step: 'DETAILS' }));
    }
  };

  const processPayment = (method: PaymentMethod, details?: any) => {
    setPaymentState(prev => ({ ...prev, method, step: 'PROCESSING' }));
    
    setTimeout(() => {
      const txnId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const paymentDate = new Date().toISOString().split('T')[0];

      // 1. Update Due Status
      const savedDues = localStorage.getItem('fee_dues');
      if (savedDues) {
        const dues = JSON.parse(savedDues);
        const updatedDues = dues.map((d: any) => 
          String(d.id) === String(paymentState.dueId) ? { ...d, status: PaymentStatus.PAID } : d
        );
        localStorage.setItem('fee_dues', JSON.stringify(updatedDues));
      }

      // 2. Create Receipt Entry
      const savedReceipts = localStorage.getItem('db_receipts');
      const receipts = savedReceipts ? JSON.parse(savedReceipts) : [];
      const newReceipt = {
          id: txnId,
          transaction_id: txnId,
          amount: paymentState.amount,
          studentName: paymentState.studentName,
          monthYear: paymentState.monthYear,
          date: paymentDate,
          method: method,
          status: 'SUCCESS'
      };
      receipts.unshift(newReceipt);
      localStorage.setItem('db_receipts', JSON.stringify(receipts));

      setPaymentState(prev => ({ 
          ...prev, 
          step: 'SUCCESS',
          transactionId: txnId
      }));
      
      showToast('Transaction Settled', 'success');
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

  import { useState } from 'react';
  import { showToast, showAlert } from '../lib/swal';
  import api from '../lib/api';
  import { loadRazorpay } from '../lib/razorpay';

  export type PaymentMethod = 'RAZORPAY';

  interface PaymentState {
    isOpen: boolean;
    dueId: string | null;
    amount: number;
    studentName: string;
    step: 'SELECT' | 'PROCESSING' | 'SUCCESS';
    transactionId: string | null;
    loading: boolean;
  }

  export const usePayments = () => {
    const [paymentState, setPaymentState] = useState<PaymentState>({
      isOpen: false,
      dueId: null,
      amount: 0,
      studentName: '',
      step: 'SELECT',
      transactionId: null,
      loading: false
    });

    const openPortal = (dueId: string, amount: number, studentName: string) => {
      setPaymentState({
        isOpen: true,
        dueId,
        amount,
        studentName,
        step: 'SELECT',
        transactionId: null,
        loading: false
      });
    };

    const closePortal = () => {
      setPaymentState(prev => ({ ...prev, isOpen: false }));
    };

    const initiateRazorpay = async () => {
      if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
        console.error("Razorpay key missing. Add VITE_RAZORPAY_KEY_ID in .env.production or Vercel environment variables.");
        showAlert('Payment Error', 'Razorpay key missing. Please contact support.', 'error');
        return;
      }

      setPaymentState(prev => ({ ...prev, loading: true }));
      try {
        console.log("Payment Amount:", paymentState.amount);
        console.log("DueId:", paymentState.dueId);
        
        // 1. Create order on backend
        console.log("Sending request to /payments/create-order");
        const response = await api.post('/payments/create-order', {
          amount: paymentState.amount,
          dueId: paymentState.dueId
        });
        console.log("Order API response:", response.data);

        if (!response.data || !response.data.id) {
          throw new Error("Invalid order ID");
        }

        // 2. Load Razorpay script
        const isLoaded = await loadRazorpay();
        if (!isLoaded || !(window as any).Razorpay) {
          throw new Error('Razorpay SDK failed to load');
        }

        // 3. Open Razorpay Checkout
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: response.data.amount,
          currency: "INR",
          name: "School Bus WayPro",
          description: "Bus Fee Payment",
          order_id: response.data.id,
          handler: async (paymentResult: any) => {
            console.log("Payment success", paymentResult);
            // Verify payment on backend
            try {
              setPaymentState(prev => ({ ...prev, step: 'PROCESSING' }));
              const { data: verifyData } = await api.post('/payments/verify', {
                ...paymentResult,
                dueId: paymentState.dueId
              });

              if (verifyData.success) {
                setPaymentState(prev => ({
                  ...prev,
                  step: 'SUCCESS',
                  transactionId: paymentResult.razorpay_payment_id,
                  loading: false
                }));
                showToast('Payment Successful', 'success');
              } else {
                throw new Error('Verification failed');
              }
            } catch (err: any) {
              showAlert('Payment Error', err.message || 'Failed to verify payment', 'error');
              setPaymentState(prev => ({ ...prev, step: 'SELECT', loading: false }));
            }
          },
          modal: {
            ondismiss: function(){
              console.log("Payment popup closed")
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        
        // Stop loading on button after popup opens
        setPaymentState(prev => ({ ...prev, loading: false }));

      } catch (err: any) {
        console.error("Payment initiation failed:", err);
        const errorMessage = err.response?.data?.message || err.message || 'Payment failed. Try again.';
        alert(errorMessage);
        setPaymentState(prev => ({ ...prev, step: 'SELECT', loading: false }));
      } finally {
        setPaymentState(prev => ({ ...prev, loading: false }));
      }
    };

    return { 
      paymentState, 
      openPortal, 
      closePortal, 
      initiateRazorpay
    };
  };

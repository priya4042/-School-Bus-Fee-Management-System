  import { useState } from 'react';
  import { showToast, showAlert } from '../lib/swal';
  import api from '../lib/api';
  import { ENV } from '../config/env';
  import { loadRazorpay } from '../lib/razorpay';
  import { supabase } from '../lib/supabase';
  import { PAYMENT_EVENT } from '../lib/telemetry';

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

    const resolveRazorpayKeyId = () => {
      const raw = String(
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        import.meta.env.VITE_RAZORPAY_KEY ||
        ''
      ).trim();

      if (!raw) return '';
      if (raw === 'your_razorpay_key_id') return '';
      return raw;
    };

    const fetchDueContext = async (dueId: string) => {
      const { data, error } = await supabase
        .from('monthly_dues')
        .select('id, student_id, month, year, amount, total_due, students(id, full_name, admission_number, parent_id)')
        .eq('id', String(dueId))
        .maybeSingle();

      if (error || !data) {
        throw new Error('Unable to load fee record for payment. Please refresh and try again.');
      }

      return data as any;
    };

    const normalizeBase = (value: string) => String(value || '').trim().replace(/\/+$/, '');

    const getPaymentApiBases = () => {
      const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const appUrl = String(import.meta.env.VITE_APP_URL || '').trim();
      const explicitPaymentApiRaw = String((import.meta.env as any).VITE_PAYMENT_API_BASE_URL || '').trim();
      const explicitPaymentApi = explicitPaymentApiRaw.includes('your-project.vercel.app')
        ? ''
        : explicitPaymentApiRaw;
      const genericApi = String(ENV.API_BASE_URL || '').trim();

      if (explicitPaymentApi) {
        return [normalizeBase(explicitPaymentApi)].filter(Boolean);
      }

      const ordered = [explicitPaymentApi, runtimeOrigin, appUrl, genericApi]
        .map(normalizeBase)
        .filter(Boolean);

      return [...new Set(ordered)];
    };

    const postPaymentApi = async (base: string, path: string, payload: any) => {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${normalizeBase(base)}${path.startsWith('/') ? path : `/${path}`}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(payload || {}),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json().catch(() => ({}))
        : { error: await response.text().catch(() => '') };

      if (!response.ok) {
        const error: any = new Error((data as any)?.error || (data as any)?.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.url = url;
        throw error;
      }

      return data;
    };

    const createOrder = async (dueId: string, amount: number, context: any) => {
      let lastError: any;

      const paymentBases = getPaymentApiBases();
      const payloadVariants = [
        {
          amount,
          dueId,
          due_id: dueId,
          studentId: context?.student_id,
          month: context?.month,
        },
        {
          amount,
          due_id: dueId,
        },
      ];

      const endpointPaths = [
        '/api/v1/payments/createOrder',
      ];

      for (const base of paymentBases) {
        for (const path of endpointPaths) {
          for (const payload of payloadVariants) {
            try {
              const order = await postPaymentApi(base, path, payload);
              if ((order as any)?.id) return order;
            } catch (err: any) {
              lastError = err;
            }
          }
        }
      }

      if (paymentBases.length === 0) {
        const fallbackAttempts = [
          async () => (await api.post('/v1/payments/createOrder', {
            amount,
            studentId: context?.student_id,
            month: context?.month,
            dueId,
            due_id: dueId,
          })).data,
        ];

        for (const attempt of fallbackAttempts) {
          try {
            const order = await attempt();
            if (order?.id) return order;
          } catch (err: any) {
            lastError = err;
          }
        }
      }

      throw lastError || new Error('Unable to initialize payment order.');
    };

    const verifyPayment = async (paymentResult: any, dueId: string) => {
      const payload = {
        ...paymentResult,
        dueId,
        due_id: dueId,
      };

      let lastError: any;

      const paymentBases = getPaymentApiBases();
      const endpointPaths = [
        '/api/v1/payments/verifyPayment',
      ];

      for (const base of paymentBases) {
        for (const path of endpointPaths) {
          try {
            const response: any = await postPaymentApi(base, path, payload);
            const ok = response?.success === true || response?.status === 'ok' || response?.status === 'success';
            if (ok) return response;
          } catch (err: any) {
            lastError = err;
          }
        }
      }

      if (paymentBases.length === 0) {
        const fallbackAttempts = [
          async () => (await api.post('/v1/payments/verifyPayment', payload)).data,
        ];

        for (const attempt of fallbackAttempts) {
          try {
            const response = await attempt();
            const ok = response?.success === true || response?.status === 'ok' || response?.status === 'success';
            if (ok) return response;
          } catch (err: any) {
            lastError = err;
          }
        }
      }

      throw lastError || new Error('Payment verification failed.');
    };

    const persistPaymentRecords = async (dueId: string, paymentId: string, context: any) => {
      const now = new Date().toISOString();
      const totalAmount = Number(context?.total_due || context?.amount || paymentState.amount || 0);
      const studentName = context?.students?.full_name || paymentState.studentName || 'Student';
      const parentId = context?.students?.parent_id;

      await supabase
        .from('monthly_dues')
        .update({
          status: 'PAID',
          paid_at: now,
          transaction_id: paymentId,
          payment_method: 'ONLINE',
        } as any)
        .eq('id', String(dueId));

      const { data: existingReceipt } = await supabase
        .from('receipts')
        .select('id')
        .eq('due_id', String(dueId))
        .maybeSingle();

      if (!existingReceipt) {
        await supabase
          .from('receipts')
          .insert({
            due_id: String(dueId),
            receipt_no: `RCPT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
            amount_paid: totalAmount,
            payment_method: 'ONLINE',
            transaction_id: paymentId,
            created_at: now,
          } as any);
      }

      if (parentId) {
        await supabase
          .from('notifications')
          .insert({
            user_id: parentId,
            title: 'Fee Payment Successful',
            message: `Payment of ₹${totalAmount.toLocaleString('en-IN')} successful for ${studentName}. Receipt ref ${paymentId}. [DUE_ID:${dueId}] [TXN:${paymentId}]`,
            type: 'PAYMENT_SUCCESS',
            is_read: false,
          } as any);
      }

      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['ADMIN', 'SUPER_ADMIN']);

      const adminIds = (admins || []).map((admin: any) => admin.id).filter(Boolean);
      if (adminIds.length > 0) {
        const adminNotifications = adminIds.map((adminId: string) => ({
          user_id: adminId,
          title: 'Parent Fee Payment Confirmed',
          message: `Parent payment received: ${studentName}, ₹${totalAmount.toLocaleString('en-IN')}, ${context?.month}/${context?.year}. Receipt ref ${paymentId}. [DUE_ID:${dueId}] [TXN:${paymentId}]`,
          type: 'PAYMENT_SUCCESS',
          is_read: false,
        }));
        await supabase.from('notifications').insert(adminNotifications as any);
      }

      window.dispatchEvent(new CustomEvent(PAYMENT_EVENT, {
        detail: {
          studentName,
          amount: totalAmount,
          txnId: paymentId,
          dueId,
          timestamp: Date.now(),
        }
      }));
    };

    const initiateRazorpay = async () => {
      const userToken = localStorage.getItem('schoolBusToken');
      console.log("Initiating Razorpay payment. Token found:", !!userToken);
      const razorpayKeyId = resolveRazorpayKeyId();
      
      if (!userToken) {
        alert("Please login to continue");
        setPaymentState(prev => ({ ...prev, loading: false }));
        return;
      }

      if (!razorpayKeyId) {
        console.error('Razorpay key missing. Add VITE_RAZORPAY_KEY_ID (or VITE_RAZORPAY_KEY) in environment variables.');
        showAlert('Payment Error', 'Razorpay key is not configured. Please ask support to set VITE_RAZORPAY_KEY_ID.', 'error');
        return;
      }

      setPaymentState(prev => ({ ...prev, loading: true }));
      try {
        if (!paymentState.dueId) {
          throw new Error('No due selected for payment.');
        }

        const dueContext = await fetchDueContext(String(paymentState.dueId));
        const order = await createOrder(String(paymentState.dueId), paymentState.amount, dueContext);

        const isLoaded = await loadRazorpay();
        if (!isLoaded || !(window as any).Razorpay) {
          throw new Error('Razorpay SDK failed to load');
        }

        const options = {
          key: razorpayKeyId,
          amount: order.amount,
          currency: "INR",
          name: "School Bus WayPro",
          description: "Bus Fee Payment",
          order_id: order.id,
          method: {
            card: true,
            upi: true,
            netbanking: true,
            wallet: true,
            emi: true,
            paylater: true,
          },
          prefill: {
            name: dueContext?.students?.full_name || paymentState.studentName,
          },
          theme: {
            color: '#1E40AF',
          },
          handler: async (paymentResult: any) => {
            try {
              setPaymentState(prev => ({ ...prev, step: 'PROCESSING' }));
              await verifyPayment(paymentResult, String(paymentState.dueId));

              window.dispatchEvent(new CustomEvent(PAYMENT_EVENT, {
                detail: {
                  studentName: dueContext?.students?.full_name || paymentState.studentName,
                  amount: Number(dueContext?.total_due || dueContext?.amount || paymentState.amount || 0),
                  txnId: paymentResult.razorpay_payment_id,
                  dueId: String(paymentState.dueId),
                  timestamp: Date.now(),
                }
              }));

              setPaymentState(prev => ({
                ...prev,
                step: 'SUCCESS',
                transactionId: paymentResult.razorpay_payment_id,
                loading: false
              }));
              showToast('Payment Successful', 'success');
            } catch (err: any) {
              showAlert('Payment Error', err.message || 'Failed to verify payment', 'error');
              setPaymentState(prev => ({ ...prev, step: 'SELECT', loading: false }));
            }
          },
          modal: {
            ondismiss: function() {
              setPaymentState(prev => ({ ...prev, loading: false }));
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
        showAlert('Payment Failed', errorMessage, 'error');
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

  import { useState } from 'react';
  import type { PaymentBundle } from '../utils/feeCalculator';
  import { showToast, showAlert } from '../lib/swal';
  import { loadRazorpay } from '../lib/razorpay';
  import { supabase } from '../lib/supabase';
  import { PAYMENT_EVENT } from '../lib/telemetry';

  export type PaymentMethod = 'RAZORPAY';

  interface PaymentState {
    isOpen: boolean;
    dueId: string | null;
    dueIds: string[];
    amount: number;
    studentName: string;
    studentMeta: {
      admissionNumber?: string;
      grade?: string;
      section?: string;
      busNumber?: string;
    } | null;
    breakdown: PaymentBundle | null;
    step: 'SELECT' | 'PROCESSING' | 'SUCCESS';
    transactionId: string | null;
    loading: boolean;
  }

  export const usePayments = () => {
    const [paymentState, setPaymentState] = useState<PaymentState>({
      isOpen: false,
      dueId: null,
      dueIds: [],
      amount: 0,
      studentName: '',
      studentMeta: null,
      breakdown: null,
      step: 'SELECT',
      transactionId: null,
      loading: false
    });

    const openPortal = (
      dueId: string,
      amount: number,
      studentName: string,
      dueIds?: Array<string | number>,
      breakdown?: PaymentBundle | null
    ) => {
      const normalizedDueIds = (dueIds || [dueId]).map((id) => String(id));
      setPaymentState({
        isOpen: true,
        dueId,
        dueIds: normalizedDueIds,
        amount,
        studentName,
        studentMeta: null,
        breakdown: breakdown || null,
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
        .select('id, student_id, month, year, amount, total_due, students(id, full_name, admission_number, grade, section, parent_id, buses(*))')
        .eq('id', String(dueId))
        .maybeSingle();

      if (error || !data) {
        throw new Error('Unable to load fee record for payment. Please refresh and try again.');
      }

      return data as any;
    };

    const normalizeBase = (value: string) => String(value || '').trim().replace(/\/+$/, '');

    const isHttpUrl = (value: string) => /^https?:\/\//i.test(String(value || '').trim());

    const isPlaceholderBase = (value: string) => {
      const normalized = normalizeBase(value).toLowerCase();
      if (!normalized) return false;
      return (
        normalized.includes('your-project.vercel.app') ||
        normalized.includes('example.com') ||
        normalized.includes('your-domain.com') ||
        normalized.includes('your-app.vercel.app')
      );
    };

    const getPaymentApiBases = () => {
      const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const appUrl = String(import.meta.env.VITE_APP_URL || '').trim();
      const explicitPaymentApiRaw = String((import.meta.env as any).VITE_PAYMENT_API_BASE_URL || '').trim();
      const explicitPaymentApi = isPlaceholderBase(explicitPaymentApiRaw)
        ? ''
        : explicitPaymentApiRaw;
      const knownProd = 'https://school-bus-fee-management-system.vercel.app';

      const ordered = [runtimeOrigin, explicitPaymentApi, appUrl, knownProd]
        .map(normalizeBase)
        .filter((base) => Boolean(base) && isHttpUrl(base) && !isPlaceholderBase(base));

      return [...new Set(ordered)];
    };

    const postPaymentApi = async (base: string, path: string, payload: any) => {
      let accessToken: string | null = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        accessToken = session?.access_token || null;
      } catch (sessionError: any) {
        const raw = String(sessionError?.message || sessionError || '').toLowerCase();
        if (raw.includes('invalid refresh token') || raw.includes('refresh token not found')) {
          console.warn('[Payments] Supabase refresh token is invalid. Proceeding without auth header and asking user to re-login.');
        } else {
          console.warn('[Payments] Unable to fetch Supabase session. Proceeding without auth header.', sessionError);
        }
      }
      const url = `${normalizeBase(base)}${path.startsWith('/') ? path : `/${path}`}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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
        error.code = (data as any)?.code || '';
        error.details = data;
        throw error;
      }

      return data;
    };

    const formatPaymentError = (err: any, fallback: string) => {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        fallback;

      const code =
        err?.response?.data?.code ||
        err?.code ||
        '';

      const status = err?.status || err?.response?.status;
      const parts = [message];
      if (code) parts.push(`Code: ${code}`);
      if (status) parts.push(`Status: ${status}`);
      if (Array.isArray(err?.attemptedUrls) && err.attemptedUrls.length > 0) {
        parts.push(`Tried: ${err.attemptedUrls.join(', ')}`);
      }
      return parts.join(' | ');
    };

    const createOrder = async (dueId: string, amount: number, context: any, dueIds: string[]) => {
      let lastError: any;
      const attemptedUrls: string[] = [];

      const paymentBases = getPaymentApiBases();
      const payloadVariants = [
        {
          amount,
          dueId,
          due_id: dueId,
          due_ids: dueIds,
          studentId: context?.student_id,
          month: context?.month,
        },
        {
          amount,
          due_id: dueId,
          due_ids: dueIds,
        },
      ];

      const endpointPaths = [
        '/api/v1/payments/createOrder',
      ];

      for (const base of paymentBases) {
        for (const path of endpointPaths) {
          for (const payload of payloadVariants) {
            try {
              attemptedUrls.push(`${normalizeBase(base)}${path}`);
              const order = await postPaymentApi(base, path, payload);
              if ((order as any)?.id) return order;
            } catch (err: any) {
              lastError = err;
            }
          }
        }
      }

      if (lastError) {
        (lastError as any).attemptedUrls = attemptedUrls;
      }
      throw lastError || new Error('Unable to initialize payment order.');
    };

    const verifyPayment = async (paymentResult: any, dueId: string, dueIds: string[]) => {
      const payload = {
        ...paymentResult,
        dueId,
        due_id: dueId,
        due_ids: dueIds,
      };

      let lastError: any;
      const attemptedUrls: string[] = [];

      const paymentBases = getPaymentApiBases();
      const endpointPaths = [
        '/api/v1/payments/verifyPayment',
      ];

      for (const base of paymentBases) {
        for (const path of endpointPaths) {
          try {
            attemptedUrls.push(`${normalizeBase(base)}${path}`);
            const response: any = await postPaymentApi(base, path, payload);
            const ok = response?.success === true || response?.status === 'ok' || response?.status === 'success';
            if (ok) return response;
          } catch (err: any) {
            lastError = err;
          }
        }
      }

      if (lastError) {
        (lastError as any).attemptedUrls = attemptedUrls;
      }
      throw lastError || new Error('Payment verification failed.');
    };

    const persistPaymentRecords = async (dueId: string, paymentId: string, context: any) => {
      const now = new Date().toISOString();
      const totalAmount = Number(context?.total_due || context?.amount || paymentState.amount || 0);
      const studentName = context?.students?.full_name || paymentState.studentName || 'Student';

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
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initiating Razorpay payment. Supabase session found:', !!session?.access_token);
      const razorpayKeyId = resolveRazorpayKeyId();
      
      if (!session?.access_token) {
        alert('Please login to continue');
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
        const dueStudent = Array.isArray((dueContext as any)?.students)
          ? (dueContext as any).students[0]
          : (dueContext as any)?.students;
        const dueBus = Array.isArray(dueStudent?.buses) ? dueStudent.buses[0] : dueStudent?.buses;
        const resolvedBusNumber = String(
          dueBus?.vehicle_number || dueBus?.plate || dueStudent?.vehicle_number || dueStudent?.plate || dueStudent?.bus_number || dueBus?.bus_number || ''
        ).trim();

        setPaymentState(prev => ({
          ...prev,
          studentMeta: {
            admissionNumber: dueStudent?.admission_number || '',
            grade: dueStudent?.grade || '',
            section: dueStudent?.section || '',
            busNumber: resolvedBusNumber || 'N/A',
          }
        }));

        const order = await createOrder(String(paymentState.dueId), paymentState.amount, dueContext, paymentState.dueIds || [String(paymentState.dueId)]);

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
              await verifyPayment(paymentResult, String(paymentState.dueId), paymentState.dueIds || [String(paymentState.dueId)]);

              window.dispatchEvent(new CustomEvent(PAYMENT_EVENT, {
                detail: {
                  studentName: dueContext?.students?.full_name || paymentState.studentName,
                  amount: Number(paymentState.amount || dueContext?.total_due || dueContext?.amount || 0),
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
        const errorMessage = formatPaymentError(err, 'Payment failed. Try again.');
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

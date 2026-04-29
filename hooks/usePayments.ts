  import { useState } from 'react';
  import type { PaymentBundle } from '../utils/feeCalculator';
  import { showToast, showAlert } from '../lib/swal';
  import { loadPayU } from '../lib/razorpay';
  import { supabase } from '../lib/supabase';
  import { PAYMENT_EVENT } from '../lib/telemetry';
  import { loadFeeSettings } from '../lib/feeSettings';

  export type PaymentMethod = 'PAYU' | 'UPI_INTENT' | 'UPI_QR';

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

    const fetchDueContext = async (dueId: string) => {
      const { data, error } = await supabase
        .from('monthly_dues')
        .select('id, student_id, month, year, amount, total_due, students(id, full_name, admission_number, grade, section, parent_id, buses(bus_number, plate))')
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

    const createPayUHash = async (dueId: string, amount: number, context: any, dueIds: string[]) => {
      let lastError: any;
      const attemptedUrls: string[] = [];

      const paymentBases = getPaymentApiBases();
      const dueStudent = Array.isArray(context?.students) ? context.students[0] : context?.students;

      const payload = {
        amount,
        dueId,
        due_id: dueId,
        due_ids: dueIds,
        studentId: context?.student_id,
        month: context?.month,
        studentName: dueStudent?.full_name || paymentState.studentName || 'Parent',
        email: '',
        phone: '',
      };

      const endpointPaths = ['/api/v1/payments/createOrder'];

      for (const base of paymentBases) {
        for (const path of endpointPaths) {
          try {
            attemptedUrls.push(`${normalizeBase(base)}${path}`);
            const result = await postPaymentApi(base, path, payload);
            if ((result as any)?.hash && (result as any)?.txnid) return result;
          } catch (err: any) {
            lastError = err;
          }
        }
      }

      if (lastError) {
        (lastError as any).attemptedUrls = attemptedUrls;
      }
      throw lastError || new Error('Unable to initialize payment.');
    };

    const verifyPayment = async (payuResponse: any, dueId: string, dueIds: string[]) => {
      const payload = {
        txnid: payuResponse.txnid,
        mihpayid: payuResponse.mihpayid,
        status: payuResponse.status,
        hash: payuResponse.hash,
        amount: payuResponse.amount,
        productinfo: payuResponse.productinfo,
        firstname: payuResponse.firstname,
        email: payuResponse.email,
        udf1: payuResponse.udf1,
        udf2: payuResponse.udf2,
        udf3: payuResponse.udf3,
        udf4: payuResponse.udf4,
        udf5: payuResponse.udf5,
        additionalCharges: payuResponse.additionalCharges,
        dueId,
        due_id: dueId,
        due_ids: dueIds,
      };

      let lastError: any;
      const attemptedUrls: string[] = [];

      const paymentBases = getPaymentApiBases();
      const endpointPaths = ['/api/v1/payments/verifyPayment'];

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

    const initiatePayU = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initiating PayU payment. Supabase session found:', !!session?.access_token);

      if (!session?.access_token) {
        alert('Please login to continue');
        setPaymentState(prev => ({ ...prev, loading: false }));
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
          dueBus?.plate || dueStudent?.plate || dueStudent?.bus_number || dueBus?.bus_number || ''
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

        // Get hash from server
        let hashData: any;
        try {
          hashData = await createPayUHash(
            String(paymentState.dueId),
            paymentState.amount,
            dueContext,
            paymentState.dueIds || [String(paymentState.dueId)]
          );
        } catch (hashErr: any) {
          const msg = String(hashErr?.message || hashErr?.details?.error || '').toLowerCase();
          if (msg.includes('configuration missing') || msg.includes('payu_merchant') || msg.includes('not configured') || hashErr?.status === 500) {
            showAlert(
              'Payment Coming Soon',
              'Our developers are setting up the payment gateway. Online payments will be available shortly. Please try again later or contact your school bus administrator.',
              'info'
            );
            setPaymentState(prev => ({ ...prev, step: 'SELECT', loading: false }));
            return;
          }
          throw hashErr;
        }

        const isLoaded = await loadPayU();
        if (!isLoaded || !(window as any).bolt) {
          throw new Error('PayU SDK failed to load. Please check your internet connection.');
        }

        const surl = `${window.location.origin}/api/v1/payments/verifyPayment`;
        const furl = `${window.location.origin}/api/v1/payments/verifyPayment`;

        const payuData = {
          key: hashData.merchantKey,
          txnid: hashData.txnid,
          amount: hashData.amount,
          productinfo: hashData.productinfo,
          firstname: hashData.firstname,
          email: hashData.email,
          phone: hashData.phone || '',
          surl,
          furl,
          hash: hashData.hash,
          udf1: hashData.udf1 || '',
          udf2: hashData.udf2 || '',
          udf3: hashData.udf3 || '',
          udf4: '',
          udf5: '',
        };

        // Launch PayU Bolt checkout
        (window as any).bolt.launch(payuData, {
          responseHandler: async (response: any) => {
            try {
              console.log('[PayU] Bolt response:', response.response?.txnStatus);
              const txnResponse = response.response || {};

              if (txnResponse.txnStatus === 'SUCCESS') {
                setPaymentState(prev => ({ ...prev, step: 'PROCESSING' }));

                await verifyPayment(
                  {
                    txnid: txnResponse.txnid,
                    mihpayid: txnResponse.mihpayid,
                    status: 'success',
                    hash: txnResponse.hash,
                    amount: txnResponse.amount,
                    productinfo: txnResponse.productinfo,
                    firstname: txnResponse.firstname,
                    email: txnResponse.email,
                    udf1: txnResponse.udf1,
                    udf2: txnResponse.udf2,
                    udf3: txnResponse.udf3,
                    udf4: txnResponse.udf4,
                    udf5: txnResponse.udf5,
                    additionalCharges: txnResponse.additionalCharges,
                  },
                  String(paymentState.dueId),
                  paymentState.dueIds || [String(paymentState.dueId)]
                );

                window.dispatchEvent(new CustomEvent(PAYMENT_EVENT, {
                  detail: {
                    studentName: dueContext?.students?.full_name || paymentState.studentName,
                    amount: Number(paymentState.amount || dueContext?.total_due || dueContext?.amount || 0),
                    txnId: txnResponse.mihpayid || txnResponse.txnid,
                    dueId: String(paymentState.dueId),
                    timestamp: Date.now(),
                  }
                }));

                setPaymentState(prev => ({
                  ...prev,
                  step: 'SUCCESS',
                  transactionId: txnResponse.mihpayid || txnResponse.txnid,
                  loading: false
                }));
                showToast('Payment Successful', 'success');
              } else {
                const errorMsg = txnResponse.txnMessage || txnResponse.error_Message || 'Payment was not successful';
                showAlert('Payment Failed', errorMsg, 'error');
                setPaymentState(prev => ({ ...prev, step: 'SELECT', loading: false }));
              }
            } catch (err: any) {
              showAlert('Payment Error', err.message || 'Failed to verify payment', 'error');
              setPaymentState(prev => ({ ...prev, step: 'SELECT', loading: false }));
            }
          },
          catchException: (error: any) => {
            console.error('[PayU] Bolt exception:', error);
            const errorMsg = error?.message || 'Payment checkout encountered an error.';
            showAlert('Payment Error', errorMsg, 'error');
            setPaymentState(prev => ({ ...prev, step: 'SELECT', loading: false }));
          }
        });

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

    // Keep old name as alias for backward compat
    const initiateRazorpay = initiatePayU;

    const initiateUpiIntent = async () => {
      setPaymentState(prev => ({ ...prev, loading: true }));
      try {
        if (!paymentState.dueId) throw new Error('No due selected.');

        const dueContext = await fetchDueContext(String(paymentState.dueId));
        const dueStudent = Array.isArray(dueContext?.students) ? dueContext.students[0] : dueContext?.students;
        const dueBus = Array.isArray(dueStudent?.buses) ? dueStudent.buses[0] : dueStudent?.buses;

        setPaymentState(prev => ({
          ...prev,
          studentMeta: {
            admissionNumber: dueStudent?.admission_number || '',
            grade: dueStudent?.grade || '',
            section: dueStudent?.section || '',
            busNumber: String(dueBus?.plate || dueBus?.bus_number || 'N/A'),
          }
        }));

        const settings = loadFeeSettings();
        
        // Try to fetch from database first
        let upiId = '';
        let businessName = '';
        
        try {
          const { data: dbSettings } = await supabase
            .from('payment_settings')
            .select('upi_id, business_name')
            .limit(1)
            .single();
          
          if (dbSettings) {
            upiId = String(dbSettings.upi_id || '').trim();
            businessName = String(dbSettings.business_name || '').trim();
          }
        } catch (err) {
          console.log('Payment settings not in database, trying environment variables');
        }

        // Fall back to environment variables and settings
        if (!upiId) {
          upiId = String(
            settings.adminUpiId ||
            import.meta.env.VITE_UPI_ID ||
            import.meta.env.VITE_ADMIN_UPI_ID ||
            ''
          ).trim();
        }

        if (!businessName) {
          businessName = String(import.meta.env.VITE_BUSINESS_NAME || 'School Bus WayPro').trim();
        }

        if (!upiId) {
          showAlert('UPI Not Available', 'UPI payment is not configured yet. Please configure UPI settings in Payment Settings or contact administrator.', 'info');
          setPaymentState(prev => ({ ...prev, loading: false }));
          return;
        }

        const amount = paymentState.amount;
        const studentName = dueStudent?.full_name || paymentState.studentName || 'Student';
        const txnRef = `BUSWAY${Date.now()}`;
        const note = `Bus Fee - ${studentName}`;

        const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}&tr=${txnRef}`;

        // Try to open UPI app
        window.location.href = upiUrl;

        // After redirect back, show confirmation dialog
        setPaymentState(prev => ({ ...prev, loading: false }));

        // Wait a moment then show confirmation
        setTimeout(() => {
          setPaymentState(prev => ({
            ...prev,
            step: 'UPI_CONFIRM' as any,
            transactionId: txnRef,
          }));
        }, 1500);

      } catch (err: any) {
        console.error('UPI Intent failed:', err);
        showAlert('UPI Error', err.message || 'Failed to open UPI app.', 'error');
        setPaymentState(prev => ({ ...prev, loading: false }));
      }
    };

    const confirmUpiPayment = async (upiRefId: string) => {
      if (!upiRefId.trim()) {
        showToast('Please enter UPI reference number', 'error');
        return;
      }

      setPaymentState(prev => ({ ...prev, step: 'PROCESSING' }));

      try {
        const now = new Date().toISOString();
        const dueIds = paymentState.dueIds || [String(paymentState.dueId)];

        // Mark all dues as PAID
        for (const dueId of dueIds) {
          await supabase
            .from('monthly_dues')
            .update({
              status: 'PAID',
              paid_at: now,
              transaction_id: upiRefId,
              payment_method: 'UPI',
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
                receipt_no: `UPI-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
                amount_paid: paymentState.amount,
                payment_method: 'UPI',
                transaction_id: upiRefId,
                created_at: now,
              } as any);
          }
        }

        // Notify admin
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .in('role', ['ADMIN', 'SUPER_ADMIN'])
          .limit(1);

        if (admins?.[0]?.id) {
          await supabase.from('notifications').insert({
            user_id: admins[0].id,
            title: `UPI Payment Received`,
            message: `${paymentState.studentName} paid ₹${paymentState.amount} via UPI. Ref: ${upiRefId}. Please verify in your bank app.`,
            type: 'SUCCESS',
            is_read: false,
          });
        }

        window.dispatchEvent(new CustomEvent(PAYMENT_EVENT, {
          detail: {
            studentName: paymentState.studentName,
            amount: paymentState.amount,
            txnId: upiRefId,
            dueId: paymentState.dueId,
            timestamp: Date.now(),
          }
        }));

        setPaymentState(prev => ({
          ...prev,
          step: 'SUCCESS',
          transactionId: upiRefId,
          loading: false,
        }));
        showToast('Payment recorded successfully!', 'success');

      } catch (err: any) {
        showAlert('Error', err.message || 'Failed to record payment.', 'error');
        setPaymentState(prev => ({ ...prev, step: 'SELECT', loading: false }));
      }
    };

    return {
      paymentState,
      openPortal,
      closePortal,
      initiatePayU,
      initiateRazorpay,
      initiateUpiIntent,
      confirmUpiPayment,
    };
  };

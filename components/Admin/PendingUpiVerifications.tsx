import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { showConfirm, showLoading, closeSwal, showToast, showAlert } from '../../lib/swal';
import { useAuthStore } from '../../store/authStore';

interface PendingPayment {
  id: string;
  user_id: string;
  student_id: string;
  amount: number;
  utr: string;
  screenshot_url: string | null;
  status: string;
  created_at: string;
  studentName?: string;
  parentName?: string;
  parentPhone?: string;
}

const buildReceiptNo = (paymentId: string) => {
  const suffix = paymentId.slice(-6) || '000000';
  return `RCPT-${Date.now().toString().slice(-7)}-${suffix}-${Math.floor(Math.random() * 1000)}`;
};

const PendingUpiVerifications: React.FC = () => {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from('payments')
        .select('id, user_id, student_id, amount, utr, screenshot_url, status, created_at')
        .eq('status', 'pending')
        .eq('payment_method', 'upi')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((rows || []).map((r: any) => r.user_id).filter(Boolean))];
      const refIds = [...new Set((rows || []).map((r: any) => r.student_id).filter(Boolean))];

      const profilesPromise = userIds.length
        ? supabase.from('profiles').select('id, full_name, phone_number').in('id', userIds)
        : Promise.resolve({ data: [] as any[] });
      const studentsPromise = refIds.length
        ? supabase.from('students').select('id, full_name').in('id', refIds)
        : Promise.resolve({ data: [] as any[] });
      const duesPromise = refIds.length
        ? supabase.from('monthly_dues').select('id, student_id, students(full_name)').in('id', refIds)
        : Promise.resolve({ data: [] as any[] });

      const [{ data: profiles }, { data: students }, { data: dues }] = await Promise.all([
        profilesPromise,
        studentsPromise,
        duesPromise,
      ]);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => (profileMap[p.id] = p));
      const studentMap: Record<string, any> = {};
      (students || []).forEach((s: any) => (studentMap[s.id] = s));
      const dueMap: Record<string, any> = {};
      (dues || []).forEach((d: any) => (dueMap[d.id] = d));

      const enriched = (rows || []).map((r: any): PendingPayment => {
        const profile = profileMap[r.user_id];
        const studentDirect = studentMap[r.student_id];
        const dueLink = dueMap[r.student_id];
        const studentName =
          studentDirect?.full_name ||
          dueLink?.students?.full_name ||
          'Unknown student';
        return {
          ...r,
          amount: Number(r.amount || 0),
          studentName,
          parentName: profile?.full_name,
          parentPhone: profile?.phone_number,
        };
      });

      setPayments(enriched);
    } catch (err: any) {
      console.error('Failed to load pending UPI payments:', err);
      showToast(err?.message || 'Failed to load pending payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();

    const channel = supabase
      .channel('pending-upi-watch')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => fetchPending()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = useMemo(() => {
    const total = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return { total, totalAmount };
  }, [payments]);

  const resolveDueId = (payment: PendingPayment): string | null => {
    // payments.student_id is set to the bundled dueId by the parent flow.
    // Treat it as a candidate due id.
    return payment.student_id || null;
  };

  const handleConfirm = async (payment: PendingPayment) => {
    const ok = await showConfirm(
      'Confirm Payment Received?',
      `Mark ₹${payment.amount.toLocaleString()} from ${payment.parentName || 'parent'} as paid? This will update the fee, generate a receipt, and notify the parent.`,
      'Confirm Received'
    );
    if (!ok) return;

    showLoading('Marking payment as paid...');
    try {
      const dueId = resolveDueId(payment);
      const transactionId = payment.utr || payment.id;
      const receiptNo = buildReceiptNo(payment.id);

      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'captured',
          verified_at: new Date().toISOString(),
          verified_by: user?.id || null,
        })
        .eq('id', payment.id);
      if (paymentError) throw paymentError;

      if (dueId) {
        const { error: dueError } = await supabase
          .from('monthly_dues')
          .update({ status: 'PAID', paid_at: new Date().toISOString() })
          .eq('id', dueId);
        if (dueError) console.warn('Failed to mark due paid (continuing):', dueError);

        const { error: receiptError } = await supabase
          .from('receipts')
          .insert({
            due_id: dueId,
            receipt_no: receiptNo,
            amount_paid: payment.amount,
            payment_method: 'ONLINE',
            transaction_id: transactionId,
            generated_by: user?.id || null,
          });
        if (receiptError) console.warn('Failed to insert receipt (continuing):', receiptError);
      }

      const { error: notifyError } = await supabase
        .from('notifications')
        .insert({
          user_id: payment.user_id,
          title: 'Payment Confirmed',
          message: `Your payment of ₹${payment.amount.toLocaleString()} has been verified. Receipt is now available to download.`,
          type: 'SUCCESS',
        });
      if (notifyError) console.warn('Failed to insert notification (continuing):', notifyError);

      closeSwal();
      showToast('Payment confirmed. Parent has been notified.', 'success');
      fetchPending();
    } catch (err: any) {
      closeSwal();
      console.error('Confirm failed:', err);
      showAlert('Confirmation Failed', err?.message || 'Could not confirm payment.', 'error');
    }
  };

  const handleReject = async (payment: PendingPayment) => {
    const ok = await showConfirm(
      'Reject Payment?',
      `Mark this UTR (${payment.utr}) as failed? Parent will be notified to retry or contact admin.`,
      'Reject Payment'
    );
    if (!ok) return;

    showLoading('Rejecting payment...');
    try {
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'failed',
          verified_at: new Date().toISOString(),
          verified_by: user?.id || null,
        })
        .eq('id', payment.id);
      if (paymentError) throw paymentError;

      await supabase.from('notifications').insert({
        user_id: payment.user_id,
        title: 'Payment Could Not Be Verified',
        message: `Your payment of ₹${payment.amount.toLocaleString()} (UTR: ${payment.utr}) could not be verified. Please retry or contact the school office.`,
        type: 'WARNING',
      });

      closeSwal();
      showToast('Payment rejected. Parent has been notified.', 'info');
      fetchPending();
    } catch (err: any) {
      closeSwal();
      console.error('Reject failed:', err);
      showAlert('Rejection Failed', err?.message || 'Could not reject payment.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-premium p-12 md:p-20 text-center">
        <i className="fas fa-inbox text-slate-200 text-4xl md:text-5xl mb-4 md:mb-6"></i>
        <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
          No pending UPI submissions
        </p>
        <p className="text-[10px] text-slate-400 mt-2 font-bold">
          Parents who pay via UPI will appear here for verification.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
          <p className="text-slate-500 font-black uppercase text-[8px] md:text-[9px] tracking-widest mb-1 md:mb-2">Pending Verifications</p>
          <p className="text-2xl md:text-3xl font-black text-amber-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
          <p className="text-slate-500 font-black uppercase text-[8px] md:text-[9px] tracking-widest mb-1 md:mb-2">Total Amount</p>
          <p className="text-2xl md:text-3xl font-black text-primary">₹{stats.totalAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 md:p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-clock text-base"></i>
                </div>
                <div className="min-w-0">
                  <p className="font-black text-slate-800 text-sm tracking-tight truncate">
                    {payment.studentName}
                  </p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {payment.parentName || 'Parent'}
                    {payment.parentPhone && (
                      <>
                        {' · '}
                        <a href={`tel:${payment.parentPhone}`} className="text-primary">
                          {payment.parentPhone}
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter">
                  ₹{payment.amount.toLocaleString()}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {new Date(payment.created_at).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 p-3 md:p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  UTR / Transaction ID
                </p>
                <p className="text-sm font-black text-slate-800 break-all">{payment.utr || '—'}</p>
                <p className="text-[9px] font-bold text-slate-500 mt-2">
                  Verify this UTR in your bank app or UPI inbox before confirming.
                </p>
              </div>
              <div className="p-3 md:p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                {payment.screenshot_url ? (
                  <button
                    onClick={() => setPreviewUrl(payment.screenshot_url)}
                    className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <i className="fas fa-image"></i>
                    View Screenshot
                  </button>
                ) : (
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    No screenshot
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 md:gap-3">
              <button
                onClick={() => handleConfirm(payment)}
                className="flex-1 py-3 bg-success text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-success/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <i className="fas fa-check-circle"></i>
                Confirm Received
              </button>
              <button
                onClick={() => handleReject(payment)}
                className="flex-1 md:flex-none px-6 py-3 bg-white text-danger font-black uppercase text-[10px] tracking-widest rounded-2xl border border-danger/20 hover:bg-danger/5 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <i className="fas fa-times-circle"></i>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Screenshot preview */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[3000] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="max-w-2xl max-h-[90vh] flex flex-col items-center gap-4">
            <img
              src={previewUrl}
              alt="Payment screenshot"
              className="max-w-full max-h-[80vh] rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setPreviewUrl(null)}
              className="px-6 py-2 bg-white text-slate-800 font-black uppercase text-[10px] tracking-widest rounded-2xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingUpiVerifications;

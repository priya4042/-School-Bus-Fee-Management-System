import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  History, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  QrCode,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import Receipt from '../Admin/Receipt';

interface FeeManagementProps {
  student: any;
  isDarkMode: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function FeeManagement({ student, isDarkMode }: FeeManagementProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);
  const [waiverReason, setWaiverReason] = useState('');

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/parent/payments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPayments(data);
      } else {
        toast.error(data.error || 'Failed to fetch payment history');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async (payment: any) => {
    setIsPaying(true);
    try {
      // 1. Create Order
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ paymentId: payment.id })
      });
      
      const order = await response.json();
      if (!response.ok) throw new Error(order.error || 'Failed to create order');

      // 2. Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency,
        name: 'BusWay Pro Enterprise',
        description: `Transport Fee - ${payment.billing_month}`,
        order_id: order.id,
        handler: async (response: any) => {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: payment.id
            })
          });
          
          if (verifyRes.ok) {
            toast.success('Payment successful!');
            fetchPayments();
          } else {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: student.full_name,
          email: student.parent_email,
          contact: student.parent_phone
        },
        theme: {
          color: '#4f46e5'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsPaying(false);
    }
  };

  const handleWaiverRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    
    try {
      const response = await fetch('/api/parent/fee/waiver-request', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          reason: waiverReason
        })
      });
      
      if (response.ok) {
        toast.success('Waiver request submitted');
        setIsWaiverModalOpen(false);
        setWaiverReason('');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  const pendingPayment = payments.find(p => p.status === 'pending');
  const overduePayment = payments.find(p => p.status === 'pending' && new Date(p.created_at) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 mb-4">
            <CreditCard size={20} />
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Monthly Fee</p>
          <h4 className="text-2xl font-bold">₹{student.monthly_fee || 0}</h4>
          <p className="text-[10px] text-zinc-400 mt-2">Base transport charges</p>
        </div>

        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 mb-4">
            <AlertCircle size={20} />
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Outstanding Dues</p>
          <h4 className="text-2xl font-bold text-amber-600">₹{pendingPayment ? pendingPayment.total_amount : 0}</h4>
          <p className="text-[10px] text-zinc-400 mt-2">Including late fines if any</p>
        </div>

        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 mb-4">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Last Payment</p>
          <h4 className="text-2xl font-bold text-emerald-600">
            {payments.find(p => p.status === 'captured')?.paid_at 
              ? new Date(payments.find(p => p.status === 'captured').paid_at).toLocaleDateString() 
              : 'None'}
          </h4>
          <p className="text-[10px] text-zinc-400 mt-2">Successfully processed</p>
        </div>
      </div>

      {/* Active Payment Action */}
      {pendingPayment && (
        <div className={`p-8 rounded-[40px] border-4 ${isDarkMode ? 'bg-indigo-900/10 border-indigo-900/20' : 'bg-indigo-50 border-indigo-100'} flex flex-col md:flex-row items-center justify-between gap-8`}>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white dark:bg-zinc-900 flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-600/10">
              <QrCode size={40} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold uppercase tracking-wider">Due Now</span>
                <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-300">Fee for {pendingPayment.billing_month}</h3>
              </div>
              <p className="text-indigo-700 dark:text-indigo-400/80">Total amount payable: <span className="font-bold">₹{pendingPayment.total_amount}</span></p>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <Calendar size={12} />
                Due Date: {pendingPayment.due_date ? new Date(pendingPayment.due_date).toLocaleDateString() : 'N/A'}
              </p>
              {pendingPayment.fine_amount > 0 && (
                <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Late fine of ₹{pendingPayment.fine_amount} applied
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {pendingPayment.fine_amount > 0 && (
              <button 
                onClick={() => {
                  setSelectedPayment(pendingPayment);
                  setIsWaiverModalOpen(true);
                }}
                className="px-6 py-4 rounded-2xl font-bold text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-all text-sm"
              >
                Request Waiver
              </button>
            )}
            <button 
              onClick={() => handlePayment(pendingPayment)}
              disabled={isPaying}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-70"
            >
              {isPaying ? <Loader2 className="animate-spin" size={20} /> : <><CreditCard size={20} /> Pay Now</>}
            </button>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
              <History size={20} />
            </div>
            <h3 className="text-lg font-bold">Payment History</h3>
          </div>
          <button className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            <Download size={14} />
            Download All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-black/20 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Fine</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <Loader2 className="mx-auto animate-spin text-indigo-500 mb-2" size={32} />
                    <p className="text-sm text-zinc-500">Loading transactions...</p>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-zinc-500">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="group hover:bg-zinc-50 dark:hover:bg-black/20 transition-colors">
                    <td className="px-6 py-4 font-bold">{payment.billing_month}</td>
                    <td className="px-6 py-4 text-zinc-500">₹{payment.amount}</td>
                    <td className="px-6 py-4 text-red-500">₹{payment.fine_amount}</td>
                    <td className="px-6 py-4 font-bold">₹{payment.total_amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        payment.status === 'captured' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' :
                        payment.status === 'pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20' :
                        'bg-red-100 text-red-600 dark:bg-red-900/20'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '--'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payment.status === 'captured' && (
                        <button 
                          onClick={() => setSelectedPayment({...payment, students: student})}
                          className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl text-indigo-600 transition-all"
                          title="Print Receipt"
                        >
                          <Printer size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedPayment && selectedPayment.status === 'captured' && (
          <Receipt payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
        )}
      </AnimatePresence>

      {/* Waiver Modal */}
      <AnimatePresence>
        {isWaiverModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}
            >
              <div className="p-8 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-2xl font-bold">Request Fee Waiver</h3>
                <p className="text-zinc-500 text-sm mt-1">Submit a request to the school admin to waive off the late fine for {selectedPayment?.billing_month}.</p>
              </div>

              <form onSubmit={handleWaiverRequest} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Reason for Request</label>
                  <textarea 
                    required
                    value={waiverReason}
                    onChange={(e) => setWaiverReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[120px] resize-none"
                    placeholder="Describe the reason for late payment..."
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsWaiverModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

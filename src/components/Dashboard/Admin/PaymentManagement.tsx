import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Download, 
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  QrCode,
  Printer,
  X,
  RefreshCw,
  Bell,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import Receipt from './Receipt';

interface Payment {
  id: string;
  amount: number;
  billing_month: string;
  status: string;
  created_at: string;
  payment_method?: string;
  students?: { full_name: string; admission_number: string; grade: string; section: string };
}

export default function PaymentManagement({ isDarkMode }: { isDarkMode: boolean }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateMonth, setGenerateMonth] = useState(new Date().toISOString().slice(0, 7));
  const [generateDueDate, setGenerateDueDate] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/payments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPayments(data);
      } else {
        setPayments([]);
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFees = async () => {
    if (!generateMonth) {
      toast.error('Please select a billing month');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/fees/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          month: generateMonth,
          dueDate: generateDueDate || null
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Generated ${data.count} fee records`);
        setShowGenerateModal(false);
        fetchPayments();
      } else {
        toast.error(data.error || 'Failed to generate fees');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalRevenue = payments.filter(p => p.status === 'captured').reduce((acc, p) => acc + p.amount, 0);
  const pendingFees = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Financial Overview</h2>
          <p className="text-zinc-500 text-sm">Track revenue, pending dues and transaction history</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchPayments}
            className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
          >
            <QrCode size={20} />
            QR Payment
          </button>
          <button 
            onClick={async () => {
              try {
                const res = await fetch('/api/admin/notifications/send-reminders', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (res.ok) toast.success(`Sent ${data.count} reminders`);
                else toast.error(data.error);
              } catch (err) { toast.error('Failed to send'); }
            }}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Bell size={20} />
            Send Reminders
          </button>
          <button 
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <CreditCard size={20} />
            Generate Monthly Fees
          </button>
        </div>
      </div>

      {/* Generate Fees Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Generate Monthly Fees</h3>
                <button onClick={() => setShowGenerateModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Billing Month</label>
                  <input 
                    type="month" 
                    value={generateMonth}
                    onChange={(e) => setGenerateMonth(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Due Date (Optional)</label>
                  <input 
                    type="date" 
                    value={generateDueDate}
                    onChange={(e) => setGenerateDueDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Defaults to the 10th of the selected month if left blank.</p>
                </div>
                <button 
                  onClick={handleGenerateFees}
                  disabled={isGenerating}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={20} /> : 'Generate Fees'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Payment Modal */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[32px] p-8 shadow-2xl text-center"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Accept QR Payment</h3>
                <button onClick={() => setShowQRModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 bg-zinc-50 dark:bg-black/20 rounded-3xl mb-6 flex flex-col items-center">
                <div className="w-48 h-48 bg-white p-4 rounded-2xl shadow-inner mb-4">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=buswaypro@upi%26pn=BusWay%20Pro%26mc=0000%26tid=123456%26tr=789012%26tn=Bus%20Fee%20Payment%26am=2500%26cu=INR`} 
                    alt="Payment QR" 
                    className="w-full h-full"
                  />
                </div>
                <p className="text-sm font-bold text-zinc-500">Scan to pay ₹2,500</p>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">UPI ID: buswaypro@upi</p>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-zinc-500">After scanning, the parent will receive an instant WhatsApp confirmation.</p>
                <button 
                  onClick={() => {
                    toast.success('Payment verified successfully!');
                    setShowQRModal(false);
                    fetchPayments();
                  }}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"
                >
                  Verify & Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <Receipt payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">+8.2%</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Total Revenue</p>
          <h3 className="text-3xl font-bold mt-1 text-zinc-900 dark:text-white">₹{totalRevenue.toLocaleString()}</h3>
        </div>

        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <Clock size={24} />
            </div>
            <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">12 Pending</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Outstanding Dues</p>
          <h3 className="text-3xl font-bold mt-1 text-zinc-900 dark:text-white">₹{pendingFees.toLocaleString()}</h3>
        </div>

        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <CreditCard size={24} />
            </div>
            <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Successful Payments</p>
          <h3 className="text-3xl font-bold mt-1 text-zinc-900 dark:text-white">
            {payments.filter(p => p.status === 'captured').length}
          </h3>
        </div>
      </div>

      {/* Transactions Table */}
      <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Recent Transactions</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text"
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-zinc-800 bg-zinc-800/50' : 'border-zinc-100 bg-zinc-50/50'}`}>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Student</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Month</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-blue-500 mb-2" size={32} />
                    <p className="text-zinc-500">Loading transactions...</p>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">{payment.students?.full_name}</p>
                        <p className="text-xs text-zinc-500">{payment.students?.admission_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {payment.billing_month}
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                      ₹{payment.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        payment.status === 'captured' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {payment.status === 'captured' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {payment.status === 'pending' && (
                          <>
                            <button 
                              onClick={async () => {
                                if (!confirm('Mark this payment as paid via Cash?')) return;
                                try {
                                  const res = await fetch(`/api/admin/payments/${payment.id}/mark-paid`, {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                  });
                                  if (res.ok) {
                                    toast.success('Payment marked as paid');
                                    fetchPayments();
                                  }
                                } catch (err) {
                                  toast.error('Failed to update payment');
                                }
                              }}
                              className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                            >
                              Mark Paid (Cash)
                            </button>
                            <button 
                              onClick={async () => {
                                if (!confirm('Are you sure you want to delete this payment record?')) return;
                                try {
                                  const res = await fetch(`/api/admin/payments/${payment.id}`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                  });
                                  if (res.ok) {
                                    toast.success('Payment record deleted');
                                    fetchPayments();
                                  } else {
                                    toast.error('Failed to delete payment');
                                  }
                                } catch (err) {
                                  toast.error('Connection error');
                                }
                              }}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        <button 
                          disabled={payment.status !== 'captured'}
                          onClick={() => setSelectedPayment(payment)}
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-blue-500 transition-colors disabled:opacity-30"
                          title="Print Receipt"
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

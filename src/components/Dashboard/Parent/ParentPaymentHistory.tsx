import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  Loader2,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

interface Payment {
  id: string;
  amount: number;
  billing_month: string;
  status: string;
  created_at: string;
  students?: { full_name: string; admission_number: string };
}

export default function ParentPaymentHistory({ isDarkMode }: { isDarkMode: boolean }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/parent/payments', {
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

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalPaid = payments.filter(p => p.status === 'captured').reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Payment History</h2>
        <p className="text-zinc-500 text-sm">View and download your previous fee receipts</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">Total Paid</span>
          </div>
          <h3 className="text-3xl font-bold mt-1 text-zinc-900 dark:text-white">₹{totalPaid.toLocaleString()}</h3>
          <p className="text-zinc-500 text-xs mt-2 font-medium">Across all students</p>
        </div>

        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">Success</span>
          </div>
          <h3 className="text-3xl font-bold mt-1 text-zinc-900 dark:text-white">
            {payments.filter(p => p.status === 'captured').length}
          </h3>
          <p className="text-zinc-500 text-xs mt-2 font-medium">Successful Transactions</p>
        </div>

        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <Clock size={24} />
            </div>
            <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">Pending</span>
          </div>
          <h3 className="text-3xl font-bold mt-1 text-zinc-900 dark:text-white">
            {payments.filter(p => p.status === 'pending').length}
          </h3>
          <p className="text-zinc-500 text-xs mt-2 font-medium">Pending Dues</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Recent Transactions</h3>
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
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-blue-500 mb-2" size={32} />
                    <p className="text-zinc-500">Loading history...</p>
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
                      <button 
                        disabled={payment.status !== 'captured'}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-blue-500 transition-colors disabled:opacity-30 flex items-center gap-2"
                      >
                        <FileText size={16} />
                        <span className="text-xs font-bold">PDF</span>
                      </button>
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

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  ArrowRight,
  Loader2,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

declare var Razorpay: any;

export default function ParentFeePayment({ isDarkMode }: { isDarkMode: boolean }) {
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/parent/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStudents(data);
        if (data.length > 0) setSelectedStudent(data[0]);
      }
    } catch (err) {
      toast.error('Failed to load student data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handlePayment = async () => {
    if (!selectedStudent) return;
    setIsProcessing(true);
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          amount: selectedStudent.monthly_fee,
          month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
        })
      });

      const order = await response.json();
      if (!response.ok) throw new Error(order.error);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "BusWay Pro Enterprise",
        description: `Transport Fee - ${selectedStudent.full_name}`,
        order_id: order.id,
        handler: function (response: any) {
          toast.success('Payment successful! Receipt will be generated shortly.');
          fetchStudents();
        },
        prefill: {
          name: selectedStudent.full_name,
          email: "parent@example.com",
        },
        theme: {
          color: "#10b981",
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Payment failed to initialize');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Fee Payment</h2>
          <p className="text-zinc-500 text-sm">Securely pay your child's monthly transport fees</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
          <ShieldCheck size={14} />
          Powered by Razorpay
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="mx-auto animate-spin text-emerald-500 mb-4" size={48} />
              <p className="text-zinc-500">Loading student details...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
              <AlertCircle size={48} className="mx-auto text-zinc-300 mb-4" />
              <p className="text-zinc-500">No students linked to your account.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Student Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map((student) => (
                  <button 
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-6 rounded-3xl border text-left transition-all ${
                      selectedStudent?.id === student.id 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 ring-2 ring-emerald-500/20' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl">
                        {student.full_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white">{student.full_name}</h4>
                        <p className="text-xs text-zinc-500">{student.admission_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Monthly Fee</span>
                      <span className="font-bold text-zinc-900 dark:text-white">₹{student.monthly_fee}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Payment Card */}
              <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-xl shadow-zinc-200/50'}`}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Bill Summary</h3>
                  <div className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                    Pending
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">Billing Month</p>
                        <p className="text-xs text-zinc-500">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-white">₹{selectedStudent?.monthly_fee}</span>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">Service Tax</p>
                        <p className="text-xs text-zinc-500">GST @ 0% (Educational)</p>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-white">₹0</span>
                  </div>

                  <div className="flex justify-between items-center pt-6">
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">Total Amount</p>
                    <p className="text-3xl font-bold text-emerald-600">₹{selectedStudent?.monthly_fee}</p>
                  </div>
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full mt-10 bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-3xl font-bold text-lg transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={24} /> : (
                    <>
                      Pay Securely Now
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
            <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Payment Security</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                <p className="text-xs text-zinc-500">256-bit SSL encrypted transactions for maximum security.</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                <p className="text-xs text-zinc-500">No card details are stored on our servers.</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                <p className="text-xs text-zinc-500">Instant digital receipts generated after every payment.</p>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900 text-white shadow-2xl shadow-black/20">
            <h4 className="font-bold mb-2">Need Help?</h4>
            <p className="text-zinc-400 text-xs mb-6">If you face any issues with the payment, please contact our support team.</p>
            <button className="w-full py-3 rounded-xl bg-white text-zinc-900 font-bold text-sm">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

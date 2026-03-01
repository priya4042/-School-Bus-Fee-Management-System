import React from 'react';
import { Bus, Printer, Download, CheckCircle2 } from 'lucide-react';

interface ReceiptProps {
  payment: any;
  onClose: () => void;
}

export default function Receipt({ payment, onClose }: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl print:shadow-none print:rounded-none">
        {/* Header - Hidden in Print */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between print:hidden">
          <h2 className="text-xl font-bold">Payment Receipt</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              <Printer size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-12 space-y-8 print:p-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Bus size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter">BusWay <span className="text-emerald-600">Pro</span></h1>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Enterprise Transport Solutions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Receipt No</p>
              <p className="text-lg font-bold">#RCP-{payment.id.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-8 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Billed To</p>
              <h3 className="text-lg font-bold">{payment.students?.full_name}</h3>
              <p className="text-sm text-zinc-500">Admission No: {payment.students?.admission_number}</p>
              <p className="text-sm text-zinc-500">Class: {payment.students?.grade}-{payment.students?.section}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Payment Details</p>
              <p className="text-sm text-zinc-500">Date: {new Date(payment.created_at).toLocaleDateString()}</p>
              <p className="text-sm text-zinc-500">Method: {payment.payment_method?.toUpperCase()}</p>
              <p className="text-sm text-zinc-500">Status: <span className="text-emerald-600 font-bold">SUCCESS</span></p>
            </div>
          </div>

          <div className="mt-12">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Description</th>
                  <th className="text-right py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                <tr>
                  <td className="py-6">
                    <p className="font-bold text-zinc-900 dark:text-white">Bus Transport Fee</p>
                    <p className="text-xs text-zinc-500">Monthly subscription for {payment.billing_month}</p>
                  </td>
                  <td className="py-6 text-right font-bold text-lg">₹{payment.amount?.toLocaleString()}</td>
                </tr>
                {payment.fine_amount > 0 && (
                  <tr>
                    <td className="py-6">
                      <p className="font-bold text-red-500">Late Fine</p>
                      <p className="text-xs text-zinc-500">Applied for delayed payment</p>
                    </td>
                    <td className="py-6 text-right font-bold text-lg text-red-500">₹{payment.fine_amount?.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-zinc-900 dark:border-white">
                  <td className="py-6 font-black text-xl uppercase tracking-tighter">Total Paid</td>
                  <td className="py-6 text-right font-black text-2xl text-emerald-600">₹{payment.total_amount?.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="pt-12 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Verified Payment</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Authorized Signatory</p>
              <div className="w-32 h-px bg-zinc-200 dark:bg-zinc-700 ml-auto"></div>
            </div>
          </div>

          <div className="text-center pt-8">
            <p className="text-[10px] text-zinc-400 font-medium">This is a computer-generated receipt and does not require a physical signature.</p>
            <p className="text-[10px] text-zinc-400 font-medium mt-1">BusWay Pro Enterprise • www.buswaypro.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

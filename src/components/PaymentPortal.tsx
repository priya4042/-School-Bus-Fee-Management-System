import React from 'react';
import Modal from './Modal';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface PaymentPortalProps {
  state: {
    step: string;
    amount: number;
    description: string;
    loading: boolean;
  };
  onClose: () => void;
  onInitiateRazorpay: () => void;
}

const PaymentPortal: React.FC<PaymentPortalProps> = ({ state, onClose, onInitiateRazorpay }) => {
  if (state.step === 'idle') return null;

  return (
    <Modal isOpen={true} onClose={onClose} title="Payment Gateway">
      <div className="p-8 space-y-8">
        {state.step === 'portal' && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment For</p>
               <p className="text-lg font-black text-slate-800 uppercase tracking-tight">{state.description}</p>
               <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between items-center">
                  <p className="text-sm font-black text-slate-500 uppercase">Total Amount</p>
                  <p className="text-3xl font-black text-primary tracking-tighter">₹{state.amount.toLocaleString()}</p>
               </div>
            </div>

            <div className="space-y-4">
               <button 
                 onClick={onInitiateRazorpay}
                 disabled={state.loading}
                 className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20 hover:bg-blue-800 transition-all flex items-center justify-center gap-3"
               >
                 {state.loading ? (
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 ) : (
                   <>
                     <CreditCard size={16} />
                     Pay with Razorpay
                   </>
                 )}
               </button>
               <p className="text-center text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  Secure 256-bit SSL Encrypted Transaction
               </p>
            </div>
          </div>
        )}

        {state.step === 'success' && (
          <div className="text-center py-10 space-y-6">
             <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Payment Successful</h3>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Your transaction has been processed</p>
             </div>
             <button 
               onClick={onClose}
               className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest"
             >
               Close Portal
             </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaymentPortal;

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { PaymentMethod } from '../hooks/usePayments';
import { useReceipts } from '../hooks/useReceipts';

interface PaymentPortalProps {
  state: any;
  onClose: () => void;
  onSelectMethod: (method: PaymentMethod) => void;
  onConfirm: (method: PaymentMethod, details?: any) => void;
}

const PaymentPortal: React.FC<PaymentPortalProps> = ({ state, onClose, onSelectMethod, onConfirm }) => {
  const { downloadReceipt, downloading } = useReceipts();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (state.step === 'SELECT') {
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setUpiId('');
    }
  }, [state.step]);

  const handleCardFormat = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    setCardNumber(parts.join(' ').slice(0, 19));
  };

  const inputClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold transition-all text-slate-800 placeholder-slate-400";

  const renderContent = () => {
    if (state.step === 'SELECT') {
      return (
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Choose Payment Protocol</p>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => onSelectMethod('CARD')}
              className="group flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-primary hover:bg-white transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <i className="fas fa-credit-card text-xl"></i>
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 text-sm">Cards</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Debit / Credit / Prepaid</p>
                </div>
              </div>
              <i className="fas fa-chevron-right text-slate-300 group-hover:text-primary transition-colors"></i>
            </button>

            <button 
              onClick={() => onSelectMethod('UPI')}
              className="group flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-success hover:bg-white transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-success shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <i className="fas fa-bolt text-xl"></i>
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 text-sm">UPI ID</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Instant bank-to-bank transfer</p>
                </div>
              </div>
              <i className="fas fa-chevron-right text-slate-300 group-hover:text-success transition-colors"></i>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onSelectMethod('GPAY')} className="group flex flex-col items-center justify-center gap-3 p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[#4285F4] hover:bg-white transition-all active:scale-[0.98]">
                <i className="fab fa-google-pay text-4xl text-[#5f6368] group-hover:text-[#4285F4] transition-colors"></i>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Google Pay</span>
              </button>
              <button onClick={() => onSelectMethod('PAYTM')} className="group flex flex-col items-center justify-center gap-3 p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[#00BAF2] hover:bg-white transition-all active:scale-[0.98]">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-100 group-hover:border-[#00BAF2] transition-colors">
                   <span className="text-[#002970] font-black text-xs">Paytm</span>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Wallet / UPI</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (state.step === 'DETAILS') {
      return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          {state.method === 'CARD' ? (
            <div className="space-y-4">
              <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden shadow-2xl mb-6">
                <div className="absolute top-0 right-0 p-6 opacity-10"><i className="fas fa-wifi rotate-90 text-5xl"></i></div>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-10">SECURE NODE</p>
                <p className="text-2xl font-black tracking-[0.2em] mb-6">{cardNumber || '•••• •••• •••• ••••'}</p>
                <div className="flex justify-between items-end">
                   <div><p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Validity</p><p className="text-sm font-bold tracking-widest">{expiry || 'MM/YY'}</p></div>
                   <div className="w-12 h-8 bg-white/10 rounded-lg border border-white/10 flex items-center justify-center"><i className="fab fa-cc-visa text-xl text-white"></i></div>
                </div>
              </div>
              <div className="space-y-4">
                <input type="text" placeholder="Card Number" value={cardNumber} onChange={(e) => handleCardFormat(e.target.value)} className={inputClass} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={inputClass} />
                  <input type="password" placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 flex items-center gap-4 mb-6">
                  <i className="fas fa-bolt text-primary text-3xl"></i>
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">UPI ID Required</p>
                    <p className="text-xs text-slate-500 font-medium">Verified VPA for secure bank-to-bank settlement.</p>
                  </div>
               </div>
               <input type="text" placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className={inputClass + " text-center text-lg"} />
            </div>
          )}
          <button 
            onClick={() => onConfirm(state.method!, state.method === 'CARD' ? { cardNumber, expiry, cvv } : { upiId })}
            className="w-full py-5 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-blue-800 transition-all active:scale-[0.98]"
          >
            Confirm & Pay ₹{state.amount}
          </button>
        </div>
      );
    }

    if (state.step === 'PROCESSING') {
      return (
        <div className="py-20 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-500">
           <div className="relative">
              <div className="w-24 h-24 border-4 border-slate-100 rounded-full"></div>
              <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0"></div>
           </div>
           <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Syncing with Gateway</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Establishing encrypted socket...</p>
           </div>
        </div>
      );
    }

    if (state.step === 'SUCCESS') {
      return (
        <div className="py-12 flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-bottom-8 duration-500">
           <div className="w-24 h-24 bg-success text-white rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl shadow-success/30">
              <i className="fas fa-check"></i>
           </div>
           <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Transaction Authorized</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID: {state.transactionId}</p>
           </div>
           
           <div className="w-full space-y-3 pt-6 border-t border-slate-100">
              <button 
                onClick={() => downloadReceipt(state.transactionId, state.transactionId)}
                disabled={!!downloading}
                className="w-full py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-800 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {downloading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-file-pdf"></i>}
                Download Digital Receipt
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
              >
                Return to Dashboard
              </button>
           </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Modal isOpen={state.isOpen} onClose={onClose} title={state.step === 'SUCCESS' ? 'Payment Complete' : `Settle Fee: ${state.studentName}`}>
      {renderContent()}
    </Modal>
  );
};

export default PaymentPortal;
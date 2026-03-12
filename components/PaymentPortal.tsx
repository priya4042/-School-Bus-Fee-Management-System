import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import { useReceipts } from '../hooks/useReceipts';
import api from '../lib/api';

const FEE_SETTINGS_KEY = 'busway_fee_settings_v1';

interface PaymentPortalProps {
  state: any;
  onClose: () => void;
  onInitiateRazorpay: () => void;
}

const PaymentPortal: React.FC<PaymentPortalProps> = ({ state, onClose, onInitiateRazorpay }) => {
  const { downloadReceipt, downloading } = useReceipts();
  const [runtimeQrUrl, setRuntimeQrUrl] = useState('');
  const [runtimeUpiId, setRuntimeUpiId] = useState('');

  const adminQrUrl = useMemo(
    () => String(runtimeQrUrl || import.meta.env.VITE_ADMIN_PAYMENT_QR_URL || '').trim(),
    [runtimeQrUrl]
  );
  const adminUpiId = useMemo(
    () => String(runtimeUpiId || import.meta.env.VITE_ADMIN_UPI_ID || '').trim(),
    [runtimeUpiId]
  );

  useEffect(() => {
    const fromLocal = () => {
      try {
        const localRaw = localStorage.getItem(FEE_SETTINGS_KEY);
        if (!localRaw) return;
        const local = JSON.parse(localRaw);
        if (local?.adminPaymentQrUrl) setRuntimeQrUrl(String(local.adminPaymentQrUrl));
        if (local?.adminUpiId) setRuntimeUpiId(String(local.adminUpiId));
      } catch {
      }
    };

    const fromApi = async () => {
      try {
        const { data } = await api.get('settings/fees');
        if (data?.adminPaymentQrUrl) setRuntimeQrUrl(String(data.adminPaymentQrUrl));
        if (data?.adminUpiId) setRuntimeUpiId(String(data.adminUpiId));
      } catch {
      }
    };

    fromLocal();
    fromApi();
  }, []);

  const renderContent = () => {
    if (state.step === 'SELECT') {
      return (
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount to Settle</p>
            <p className="text-4xl font-black text-slate-800 tracking-tighter">₹{Number(state.amount || 0).toLocaleString()}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{state.studentName}</p>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Secure Payment Gateway</p>
            
            <button 
              onClick={onInitiateRazorpay}
              disabled={state.loading}
              className="group w-full flex items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-black transition-all active:scale-[0.98] text-white shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white shadow-sm border border-white/10 group-hover:scale-110 transition-transform">
                  {state.loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-shield-alt text-xl"></i>}
                </div>
                <div className="text-left">
                  <p className="font-black text-white text-sm">{state.loading ? "Starting Secure Payment..." : "Pay Securely"}</p>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">Cards, UPI, Netbanking, Wallets</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <i className="fab fa-cc-visa text-white/20 text-xs"></i>
                 <i className="fab fa-cc-mastercard text-white/20 text-xs"></i>
                 <i className="fas fa-university text-white/20 text-xs"></i>
                 <i className="fas fa-chevron-right text-white/40 ml-2"></i>
              </div>
            </button>

            {adminQrUrl && (
              <div className="p-5 bg-white rounded-2xl border border-slate-200">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Alternative: Admin UPI QR</p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={adminQrUrl}
                    alt="Admin payment QR"
                    className="w-28 h-28 rounded-xl border border-slate-200 object-cover"
                  />
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Scan & pay manually</p>
                    {adminUpiId && (
                      <p className="text-[10px] font-bold text-slate-500 mt-1">UPI ID: {adminUpiId}</p>
                    )}
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                      After manual payment, share reference with bus admin.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-[8px] text-slate-400 text-center font-medium uppercase tracking-widest">
            <i className="fas fa-lock mr-1"></i> 256-bit SSL Encrypted Transaction
          </p>
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
                onClick={() => downloadReceipt(state.dueId || state.transactionId, state.transactionId)}
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
                Cancel
              </button>
              <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-wider">Receipt stays available in Receipts module anytime.</p>
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

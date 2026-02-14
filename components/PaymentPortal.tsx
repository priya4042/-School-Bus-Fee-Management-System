
import React, { useState } from 'react';
import Modal from './Modal';
import { PaymentMethod } from '../hooks/usePayments';

interface PaymentPortalProps {
  state: any;
  onClose: () => void;
  onSelectMethod: (method: PaymentMethod) => void;
  onConfirm: (method: PaymentMethod, details?: any) => void;
}

const PaymentPortal: React.FC<PaymentPortalProps> = ({ state, onClose, onSelectMethod, onConfirm }) => {
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');

  const formatCardNumber = (value: string) => {
    return value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  };

  const renderContent = () => {
    if (state.step === 'SELECT') {
      return (
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Select Secure Method</p>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => onSelectMethod('CARD')}
              className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:border-primary hover:bg-white transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <i className="fas fa-credit-card text-xl"></i>
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 text-sm">Cards</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Visa, Master, Rupay</p>
                </div>
              </div>
              <i className="fas fa-chevron-right text-slate-300 group-hover:text-primary"></i>
            </button>

            <button 
              onClick={() => onSelectMethod('UPI')}
              className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:border-primary hover:bg-white transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-success shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <i className="fas fa-bolt text-xl"></i>
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 text-sm">Unified Interface (UPI)</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">PhonePe, BHIM, Any App</p>
                </div>
              </div>
              <i className="fas fa-chevron-right text-slate-300 group-hover:text-success"></i>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onSelectMethod('GPAY')}
                className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-primary hover:bg-white transition-all group"
              >
                <i className="fab fa-google-pay text-3xl text-slate-600 group-hover:text-primary transition-colors"></i>
                <span className="text-[10px] font-black text-slate-400 uppercase">GPay</span>
              </button>
              <button 
                onClick={() => onSelectMethod('PAYTM')}
                className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-primary hover:bg-white transition-all group"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-[10px]">P</div>
                <span className="text-[10px] font-black text-slate-400 uppercase">Paytm</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (state.step === 'DETAILS') {
      if (state.method === 'CARD') {
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <i className="fas fa-wifi rotate-90 text-4xl"></i>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-8">Secure Vault Payment</p>
              <p className="text-xl font-black tracking-[0.2em] mb-6">{cardData.number || '•••• •••• •••• ••••'}</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Expiry</p>
                  <p className="text-sm font-bold">{cardData.expiry || 'MM/YY'}</p>
                </div>
                <div className="w-12 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <i className="fab fa-cc-visa text-xl"></i>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Card Number</label>
                <input 
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardData.number}
                  onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-700 focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Expiry Date</label>
                  <input 
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardData.expiry}
                    onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-700 focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Security CVV</label>
                  <input 
                    type="password"
                    placeholder="•••"
                    maxLength={3}
                    value={cardData.cvv}
                    onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-700 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => onConfirm('CARD', cardData)}
              className="w-full py-5 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-800 transition-all active:scale-95"
            >
              Pay ₹{state.amount.toLocaleString()} Securely
            </button>
          </div>
        );
      }

      if (state.method === 'UPI') {
        return (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="p-8 bg-success/5 border-2 border-dashed border-success/20 rounded-[2.5rem] flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-success text-white rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-success/20 mb-6">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h4 className="font-black text-slate-800 uppercase text-xs mb-2">Unified Payments Interface</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enter your VPA / UPI ID to proceed</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">UPI ID (VPA)</label>
              <input 
                type="text"
                placeholder="username@bank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-6 py-5 rounded-[1.5rem] border-2 border-slate-100 bg-white outline-none font-black text-xl text-success tracking-tight focus:border-success transition-all text-center"
              />
            </div>

            <button 
              onClick={() => onConfirm('UPI', { upiId })}
              className="w-full py-5 bg-success text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-success/20 hover:bg-green-600 transition-all active:scale-95"
            >
              Verify & Pay ₹{state.amount.toLocaleString()}
            </button>
          </div>
        );
      }
    }

    if (state.step === 'PROCESSING') {
      return (
        <div className="py-20 flex flex-col items-center text-center animate-pulse">
          <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8"></div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Encrypting Link</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Communication with Banking Node...</p>
        </div>
      );
    }

    if (state.step === 'SUCCESS') {
      return (
        <div className="py-20 flex flex-col items-center text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-success text-white rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl shadow-success/30 mb-8">
            <i className="fas fa-check"></i>
          </div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Payment Settled</h3>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Transaction ID: TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>
      );
    }
  };

  return (
    <Modal isOpen={state.isOpen} onClose={onClose} title={`Settle Fee: ₹${state.amount.toLocaleString()}`}>
      <div className="p-2">
        <div className="flex items-center justify-between mb-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Billed Student</p>
            <p className="font-black text-slate-800">{state.studentName}</p>
          </div>
          <div className="text-right">
             <i className="fas fa-lock text-success text-xs mb-1 block"></i>
             <p className="text-[8px] font-black text-slate-300 uppercase">256-Bit SSL</p>
          </div>
        </div>
        {renderContent()}
      </div>
    </Modal>
  );
};

export default PaymentPortal;

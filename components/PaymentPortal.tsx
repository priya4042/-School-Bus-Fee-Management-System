import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import UpiPaymentFlow from './Payment/UpiPaymentFlow';
import { useReceipts } from '../hooks/useReceipts';
import api from '../lib/api';
import { FEE_SETTINGS_UPDATED_EVENT, loadFeeSettings } from '../lib/feeSettings';
import { MONTHS } from '../constants';

interface PaymentPortalProps {
  state: any;
  onClose: () => void;
  onInitiateRazorpay: () => void;
  onInitiatePayU?: () => void;
  onInitiateEasebuzz?: () => void;
  onInitiateUpi?: () => void;
  onConfirmUpi?: (refId: string) => void;
  user?: any;
}

const PaymentPortal: React.FC<PaymentPortalProps> = ({ state, onClose, onInitiateRazorpay, onInitiatePayU, onInitiateEasebuzz, onInitiateUpi, onConfirmUpi, user }) => {
  const { downloadReceipt, downloading } = useReceipts();

  const renderContent = () => {
    if (state.step === 'SELECT') {
      const bundle = state.breakdown;

      return (
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount to Settle</p>
            <p className="text-4xl font-black text-slate-800 tracking-tighter">₹{Number(state.amount || 0).toLocaleString()}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{state.studentName}</p>
            {!!state?.studentMeta?.busNumber && (
              <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-2">
                Bus Number: {String(state.studentMeta.busNumber)}
              </p>
            )}
          </div>

          {bundle && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/70">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Payment Summary</p>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">{bundle.explanation}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Months Included</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">{bundle.monthsCount}</p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Base Fees</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">₹{Number(bundle.totalBaseAmount || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Late Fees</p>
                  <p className={`text-2xl font-black tracking-tight mt-1 ${bundle.totalLateFee > 0 ? 'text-danger' : 'text-slate-800'}`}>
                    ₹{Number(bundle.totalLateFee || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Month-wise Breakdown</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {bundle.firstMonthLabel} to {bundle.targetMonthLabel}
                  </p>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {bundle.items.map((item: any) => (
                    <div key={item.dueId} className="px-5 py-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-widest">{item.label}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Due {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-IN') : `${MONTHS[(item.month || 1) - 1]} ${item.year}`}
                        </p>
                        <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">{item.reason}</p>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <p className="text-sm font-black text-slate-800">₹{Number(item.total || 0).toLocaleString('en-IN')}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Base ₹{Number(item.baseAmount || 0).toLocaleString('en-IN')}
                        </p>
                        {item.lateFee > 0 && (
                          <p className="text-[8px] font-black text-danger uppercase tracking-widest mt-1">
                            + ₹{Number(item.lateFee || 0).toLocaleString('en-IN')} Late Fee
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* UPI Payment Flow - Only Payment Method */}
            <UpiPaymentFlow
              amount={Number(state.amount || 0)}
              studentId={String(state.dueIds?.[0] || state.studentId || 'unknown')}
              studentName={String(state.studentName || 'Student')}
              userId={String(user?.id || '')}
              onSuccess={onClose}
              onClose={onClose}
            />
          </div>
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

    if (state.step === 'UPI_CONFIRM') {
      // UPI confirmation is now handled in UpiPaymentFlow component
      // This step is kept for backward compatibility but should not be reached
      onClose();
      return null;
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
                onClick={() => downloadReceipt(state.dueId || state.transactionId, state.transactionId, {
                  id: state.dueId || state.transactionId,
                  transaction_id: state.transactionId,
                  total_due: state.amount,
                  amount: state.amount,
                  paid_at: new Date().toISOString(),
                  payment_months: state.breakdown?.items?.map((item: any) => ({
                    label: item.label,
                    month: item.month,
                    year: item.year,
                    amount: item.total,
                    baseAmount: item.baseAmount,
                    lateFee: item.lateFee,
                  })) || [],
                  billing_period_label: state.breakdown?.monthsCount > 1
                    ? `${state.breakdown?.firstMonthLabel} to ${state.breakdown?.targetMonthLabel}`
                    : state.breakdown?.targetMonthLabel,
                  students: {
                    full_name: state.studentName || 'Student',
                    admission_number: state?.studentMeta?.admissionNumber || 'N/A',
                    grade: state?.studentMeta?.grade || 'N/A',
                    section: state?.studentMeta?.section || 'N/A',
                    bus_number: state?.studentMeta?.busNumber || 'N/A',
                    plate: state?.studentMeta?.busNumber || 'N/A',
                  },
                })}
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
    <Modal
      isOpen={state.isOpen}
      onClose={onClose}
      title={state.step === 'SUCCESS' ? 'Payment Complete' : `Settle Fee: ${state.studentName}`}
      maxWidthClass="max-w-2xl"
      bodyClassName="p-6 md:p-8"
    >
      {renderContent()}
    </Modal>
  );
};

export default PaymentPortal;

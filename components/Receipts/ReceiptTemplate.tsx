import React from 'react';
import { Download, Printer, Share2, CheckCircle2 } from 'lucide-react';
import { generateBarcodeImage, generateQRCodeImage } from '../../utils/barcodeGenerator';

interface ReceiptProps {
  receipt: {
    receiptNumber: string;
    date: string;
    studentName: string;
    admissionId: string;
    className: string;
    parentName: string;
    month: string;
    baseFee: number;
    lateFee: number;
    discount: number;
    totalPaid: number;
    paymentMethod: string;
    transactionId: string;
    barcode: string;
  };
  onClose: () => void;
}

const ReceiptTemplate: React.FC<ReceiptProps> = ({ receipt, onClose }) => {
  const [qrCode, setQrCode] = React.useState('');
  const barcodeImg = generateBarcodeImage(receipt.barcode);

  React.useEffect(() => {
    generateQRCodeImage(receipt.receiptNumber).then(setQrCode);
  }, [receipt.receiptNumber]);

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden my-8">
        <div className="p-12">
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl">🚌</div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">BusWay Pro</h1>
              </div>
              <p className="text-slate-400 text-xs font-medium">Enterprise Fleet Management System</p>
            </div>
            <div className="text-right">
              <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl inline-flex items-center gap-2 mb-4">
                <CheckCircle2 size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Payment Successful</span>
              </div>
              <p className="text-slate-900 font-bold text-sm">Receipt #: {receipt.receiptNumber}</p>
              <p className="text-slate-400 text-xs font-medium">Date: {receipt.date}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Student Details</p>
                <p className="text-slate-900 font-bold">{receipt.studentName}</p>
                <p className="text-slate-500 text-sm">ID: {receipt.admissionId} | Class: {receipt.className}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Parent Name</p>
                <p className="text-slate-900 font-bold">{receipt.parentName}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Method</p>
                <p className="text-slate-900 font-bold capitalize">{receipt.paymentMethod}</p>
                <p className="text-slate-500 text-xs font-mono">TXN: {receipt.transactionId}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billing Month</p>
                <p className="text-slate-900 font-bold">{receipt.month}</p>
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-slate-50 rounded-[2rem] p-8 mb-12">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Monthly Transport Fee</span>
                <span className="text-slate-900 font-bold">₹{receipt.baseFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Late Fee Penalty</span>
                <span className="text-slate-900 font-bold">₹{receipt.lateFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Discount Applied</span>
                <span className="text-emerald-600 font-bold">-₹{receipt.discount.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-900 font-black uppercase tracking-widest text-xs">Total Amount Paid</span>
                <span className="text-2xl font-black text-primary">₹{receipt.totalPaid.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Barcode & QR */}
          <div className="flex justify-between items-end">
            <div className="space-y-4">
              <img src={barcodeImg} alt="Barcode" className="h-16" />
              <p className="text-[10px] font-mono text-slate-400 tracking-[0.3em]">{receipt.barcode}</p>
            </div>
            <div className="text-center space-y-2">
              {qrCode && <img src={qrCode} alt="QR Code" className="w-24 h-24" />}
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Scan to Verify</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-8 flex gap-4">
          <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
            <Printer size={18} />
            Print
          </button>
          <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
            <Download size={18} />
            Download PDF
          </button>
          <button className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
            <Share2 size={18} />
            Share
          </button>
          <button onClick={onClose} className="px-8 py-4 rounded-2xl text-slate-500 font-bold text-sm hover:bg-slate-100 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptTemplate;

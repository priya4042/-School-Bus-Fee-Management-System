import React, { useState } from 'react';
import { Scanner } from '@zxing/library';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { X, Camera, Keyboard } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const [manualInput, setManualInput] = useState('');
  const [showManual, setShowManual] = useState(false);

  const handleScan = (err: any, result: any) => {
    if (result) {
      onScan(result.text);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="p-4 flex justify-between items-center bg-slate-900 text-white">
        <h2 className="text-lg font-bold">Scan Fee Barcode</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {!showManual ? (
          <>
            <BarcodeScannerComponent
              width="100%"
              height="100%"
              onUpdate={handleScan}
              className="object-cover"
            />
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-64 h-40 border-2 border-primary-light rounded-lg shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]"></div>
              <p className="mt-8 text-white font-medium bg-black/50 px-4 py-2 rounded-full">
                Align barcode within the frame
              </p>
            </div>
          </>
        ) : (
          <div className="p-8 w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
              Enter Barcode Manually
            </label>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white text-xl font-mono tracking-widest focus:ring-2 focus:ring-primary-light"
              placeholder="e.g. FEE12345..."
              autoFocus
            />
            <button
              onClick={() => onScan(manualInput)}
              className="w-full mt-6 bg-primary-light text-white font-bold py-4 rounded-2xl hover:bg-primary transition-colors"
            >
              Verify Barcode
            </button>
          </div>
        )}
      </div>

      <div className="p-8 bg-slate-900 flex justify-center gap-4">
        <button
          onClick={() => setShowManual(!showManual)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
        >
          {showManual ? <Camera size={20} /> : <Keyboard size={20} />}
          {showManual ? 'Switch to Camera' : 'Manual Entry'}
        </button>
      </div>
    </div>
  );
};

export default BarcodeScanner;

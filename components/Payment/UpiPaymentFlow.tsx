import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/swal';
import { useUpiSettings } from '../../lib/upiSettings';

type UpiApp = 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'any';

const buildUpiLink = (app: UpiApp, params: { upiId: string; businessName: string; amount: number; note: string }) => {
  const query = `pa=${encodeURIComponent(params.upiId)}&pn=${encodeURIComponent(params.businessName)}&am=${params.amount}&cu=INR&tn=${encodeURIComponent(params.note)}`;
  switch (app) {
    case 'gpay':
      return `tez://upi/pay?${query}`;
    case 'phonepe':
      return `phonepe://pay?${query}`;
    case 'paytm':
      return `paytmmp://pay?${query}`;
    case 'bhim':
      return `bhim://pay?${query}`;
    case 'any':
    default:
      return `upi://pay?${query}`;
  }
};

const UPI_APPS: { id: UpiApp; label: string; icon: string; color: string }[] = [
  { id: 'gpay', label: 'Google Pay', icon: 'fab fa-google-pay', color: 'from-blue-500 to-sky-600' },
  { id: 'phonepe', label: 'PhonePe', icon: 'fas fa-mobile-alt', color: 'from-purple-600 to-violet-700' },
  { id: 'paytm', label: 'Paytm', icon: 'fas fa-wallet', color: 'from-cyan-500 to-blue-600' },
  { id: 'bhim', label: 'BHIM', icon: 'fas fa-rupee-sign', color: 'from-orange-500 to-amber-600' },
];

interface UpiPaymentFlowProps {
  amount: number;
  studentId: string;
  studentName: string;
  userId: string;
  onSuccess: () => void;
  onClose: () => void;
}

const UpiPaymentFlow: React.FC<UpiPaymentFlowProps> = ({ 
  amount, 
  studentId, 
  studentName,
  userId,
  onSuccess,
  onClose 
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [utrInput, setUtrInput] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const { settings: upiSettings, configured: upiConfigured } = useUpiSettings();
  const UPI_ID = upiSettings.upiId;
  const BUSINESS_NAME = upiSettings.businessName;
  const [showAppPicker, setShowAppPicker] = useState(false);

  const note = `Bus Fee ${studentName}`;
  const linkParams = { upiId: UPI_ID, businessName: BUSINESS_NAME, amount, note };

  // Generate QR Code (always universal upi:// scheme so any app can scan)
  useEffect(() => {
    const generateQr = async () => {
      try {
        const upiLink = buildUpiLink('any', linkParams);
        const qrDataUrl = await QRCode.toDataURL(upiLink, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
        });
        setQrUrl(qrDataUrl);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
        showToast('Failed to generate QR code', 'error');
      }
    };

    generateQr();
  }, [amount, studentName, UPI_ID, BUSINESS_NAME]);

  // Open the picked UPI app
  const handlePayWithApp = (app: UpiApp) => {
    const link = buildUpiLink(app, linkParams);
    window.location.href = link;
    // If the app isn't installed, deep links silently fail. Fallback to universal upi:// after a brief moment.
    if (app !== 'any') {
      setTimeout(() => {
        window.location.href = buildUpiLink('any', linkParams);
      }, 1500);
    }
    setShowAppPicker(false);
  };

  // Validate UTR
  const validateUtr = (utr: string): { valid: boolean; error: string } => {
    const trimmedUtr = utr.trim();
    
    if (!trimmedUtr) {
      return { valid: false, error: 'UTR number is required' };
    }
    
    if (trimmedUtr.length < 12) {
      return { valid: false, error: 'UTR must be at least 12 characters' };
    }
    
    return { valid: true, error: '' };
  };

  // Check for duplicate UTR
  const checkDuplicateUtr = async (utr: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('id')
        .eq('utr', utr.trim())
        .limit(1);

      if (error) throw error;
      return (data && data.length > 0);
    } catch (err) {
      console.error('Failed to check duplicate UTR:', err);
      return false;
    }
  };

  // Upload Screenshot to Supabase Storage
  const uploadScreenshot = async (file: File): Promise<string | null> => {
    try {
      const timestamp = Date.now();
      const filename = `upi-payments/${userId}/${timestamp}-${studentId}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(filename);
      
      return urlData?.publicUrl || null;
    } catch (err) {
      console.error('Failed to upload screenshot:', err);
      return null;
    }
  };

  // Handle Submit
  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);

      // Validate UTR
      const validation = validateUtr(utrInput);
      if (!validation.valid) {
        setError(validation.error);
        setLoading(false);
        return;
      }

      // Check for duplicate UTR
      const isDuplicate = await checkDuplicateUtr(utrInput);
      if (isDuplicate) {
        setError('This UTR has already been submitted. Please use a different transaction ID.');
        setLoading(false);
        return;
      }

      // Upload screenshot if provided
      let screenshotUrl = null;
      if (screenshotFile) {
        screenshotUrl = await uploadScreenshot(screenshotFile);
      }

      // Insert payment record with pending status
      const { data, error: insertError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          student_id: studentId,
          amount: amount,
          utr: utrInput.trim(),
          screenshot_url: screenshotUrl,
          status: 'pending',
          payment_method: 'upi',
          created_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      // Show success
      setSubmitted(true);
      showToast('Payment submitted successfully. Awaiting verification.', 'success');
      
      // Callback after 2 seconds
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Failed to submit payment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit payment';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-200 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <i className="fas fa-check text-green-600 text-4xl"></i>
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Payment Submitted</h3>
          <p className="text-sm font-bold text-slate-600 leading-relaxed">
            Your payment of <span className="text-green-600 font-black">₹{amount.toLocaleString()}</span> has been submitted successfully.
          </p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">
            Awaiting verification from admin
          </p>
        </div>

        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-xs font-bold text-blue-700 flex items-start gap-2">
            <i className="fas fa-info-circle mt-0.5 flex-shrink-0"></i>
            <span>
              We've received your transaction ID <span className="font-black">{utrInput}</span>. Our team will verify the payment within 24 hours.
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Amount Summary */}
      <div className="p-6 bg-gradient-to-br from-primary/10 to-blue-50 rounded-3xl border border-primary/20 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount to Pay</p>
        <p className="text-4xl font-black text-primary tracking-tighter">₹{amount.toLocaleString()}</p>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-3">{studentName}</p>
      </div>

      {/* Configuration warning */}
      {!upiConfigured && (
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50">
          <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i>
            UPI not configured by admin yet
          </p>
          <p className="text-[10px] font-bold text-amber-600 mt-1">
            Using fallback ID — payments may not reach the correct account.
          </p>
        </div>
      )}

      {/* Primary "Pay Now" button — opens app picker */}
      <button
        onClick={() => setShowAppPicker(!showAppPicker)}
        disabled={loading}
        className="group w-full flex items-center justify-between p-5 bg-gradient-to-r from-green-600 to-emerald-600 border border-green-500 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all active:scale-[0.98] text-white shadow-xl shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white border border-white/20 group-hover:scale-110 transition-transform">
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-mobile-alt text-xl"></i>}
          </div>
          <div className="text-left">
            <p className="font-black text-white text-base">Pay via UPI App</p>
            <p className="text-[9px] font-bold text-white/70 uppercase tracking-wider">
              {showAppPicker ? 'Pick your preferred UPI app below' : 'Google Pay, PhonePe, BHIM, Paytm'}
            </p>
          </div>
        </div>
        <i className={`fas fa-chevron-${showAppPicker ? 'up' : 'down'} text-white/60`}></i>
      </button>

      {/* App picker grid */}
      {showAppPicker && (
        <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
          {UPI_APPS.map((app) => (
            <button
              key={app.id}
              onClick={() => handlePayWithApp(app.id)}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${app.color} text-white p-4 shadow-lg active:scale-95 transition-all`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                  <i className={`${app.icon} text-base`}></i>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">{app.label}</p>
              </div>
            </button>
          ))}
          <button
            onClick={() => handlePayWithApp('any')}
            className="col-span-2 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-slate-700 p-3 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <i className="fas fa-th-large text-slate-400"></i>
            <p className="text-[10px] font-black uppercase tracking-widest">Any other UPI app</p>
          </button>
        </div>
      )}

      {/* OR Divider */}
      <div className="relative flex items-center gap-3 py-2">
        <div className="flex-1 h-px bg-slate-200"></div>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">OR</span>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      {/* QR Code Section */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-5 bg-purple-50 border-b border-slate-100 text-center">
          <p className="text-sm font-black text-slate-800">Scan QR Code</p>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Scan with any UPI app</p>
        </div>

        {qrUrl && (
          <div className="p-6 flex flex-col items-center gap-4">
            <div className="p-3 bg-white border-4 border-slate-100 rounded-xl">
              <img src={qrUrl} alt="UPI QR Code" className="w-40 h-40 rounded-lg" />
            </div>
            <p className="text-lg font-black text-slate-900">₹{amount.toLocaleString()}</p>
            <p className="text-[9px] font-bold text-slate-500 text-center max-w-xs">
              Scan above QR code with your UPI app to make payment
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 space-y-3">
        <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
          <i className="fas fa-lightbulb"></i>
          Important Instructions
        </p>
        <ul className="space-y-2 text-[9px] font-bold text-amber-800 leading-relaxed">
          <li className="flex gap-2">
            <span className="text-amber-600 font-black">1.</span>
            <span>Complete payment in your UPI app (Google Pay, PhonePe, BHIM or Paytm)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-600 font-black">2.</span>
            <span>Copy the transaction ID (UTR) from the payment confirmation</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-600 font-black">3.</span>
            <span>Enter the UTR below for verification</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-600 font-black">4.</span>
            <span>Optionally upload the payment screenshot</span>
          </li>
        </ul>
      </div>

      {/* UTR Input Section */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          After completing payment, please enter your UTR (Transaction ID) below for verification
        </p>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">
            UTR / Transaction ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={utrInput}
            onChange={(e) => {
              setUtrInput(e.target.value);
              setError('');
            }}
            placeholder="E.g., 518003721843 or 221209153918"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 focus:border-primary transition-all"
          />
          <p className="text-[8px] text-slate-400 font-medium">Length: {utrInput.length} characters (minimum 12 required)</p>
        </div>

        {/* Screenshot Upload (Optional) */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block flex items-center gap-2">
            <i className="fas fa-image"></i>
            Payment Screenshot <span className="text-slate-400">(Optional)</span>
          </label>
          <input
            ref={screenshotInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 5 * 1024 * 1024) {
                  setError('Screenshot must be less than 5MB');
                  return;
                }
                setScreenshotFile(file);
                setError('');
              }
            }}
            className="hidden"
          />
          <button
            onClick={() => screenshotInputRef.current?.click()}
            className="w-full px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-slate-300 transition-all text-center"
          >
            {screenshotFile ? (
              <div className="flex items-center justify-center gap-2">
                <i className="fas fa-check-circle text-green-600"></i>
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
                  {screenshotFile.name}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <i className="fas fa-cloud-upload-alt text-slate-400 text-lg"></i>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  Click to upload screenshot
                </span>
                <span className="text-[8px] text-slate-400">PNG, JPG (up to 5MB)</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 animate-in slide-in-from-top-2 duration-200">
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all disabled:opacity-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !utrInput.trim()}
          className="flex-1 px-4 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <i className="fas fa-circle-notch fa-spin"></i>
              Submitting...
            </>
          ) : (
            <>
              <i className="fas fa-check-circle"></i>
              Submit Payment
            </>
          )}
        </button>
      </div>

      <p className="text-[8px] text-slate-400 text-center font-medium uppercase tracking-widest">
        <i className="fas fa-lock mr-1"></i> 256-bit SSL Encrypted Transaction
      </p>
    </div>
  );
};

export default UpiPaymentFlow;

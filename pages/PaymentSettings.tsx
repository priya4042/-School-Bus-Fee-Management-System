import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { showToast, showLoading, closeSwal } from '../lib/swal';
import { notifyUpiSettingsUpdated } from '../lib/upiSettings';

interface PaymentConfig {
  id?: string;
  upi_id: string;
  business_name: string;
  updated_at?: string;
}

const PaymentSettings: React.FC = () => {
  const [settings, setSettings] = useState<PaymentConfig>({
    upi_id: '',
    business_name: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<PaymentConfig>({
    upi_id: '',
    business_name: '',
  });

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    setLoading(true);
    try {
      // Try to get existing settings
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setSettings({
          id: data.id,
          upi_id: data.upi_id || '',
          business_name: data.business_name || '',
          updated_at: data.updated_at,
        });
        setOriginalSettings({
          id: data.id,
          upi_id: data.upi_id || '',
          business_name: data.business_name || '',
          updated_at: data.updated_at,
        });
      }
      
      // Also get environment variable defaults if settings are empty
      if (!data) {
        const envUpiId = import.meta.env.VITE_UPI_ID || '';
        const envBusinessName = import.meta.env.VITE_BUSINESS_NAME || '';
        if (envUpiId || envBusinessName) {
          setSettings({
            upi_id: envUpiId,
            business_name: envBusinessName,
          });
          setOriginalSettings({
            upi_id: envUpiId,
            business_name: envBusinessName,
          });
        }
      }
    } catch (err: any) {
      console.log('Payment settings table may not exist yet or is empty');
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!settings.upi_id.trim() || !settings.business_name.trim()) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    // Validate UPI ID format (should contain @)
    if (!settings.upi_id.includes('@')) {
      showToast('Invalid UPI ID format. Should be like: yourname@hdfc', 'warning');
      return;
    }

    showLoading('Saving Payment Configuration...');
    setSaving(true);

    try {
      if (settings.id) {
        // Update existing
        const { error } = await supabase
          .from('payment_settings')
          .update({
            upi_id: settings.upi_id,
            business_name: settings.business_name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id);

        if (error) throw error;
        showToast('Payment settings updated successfully', 'success');
        notifyUpiSettingsUpdated();
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('payment_settings')
          .insert([
            {
              upi_id: settings.upi_id,
              business_name: settings.business_name,
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setSettings(prev => ({
            ...prev,
            id: data.id,
            updated_at: data.updated_at,
          }));
          setOriginalSettings(prev => ({
            ...prev,
            id: data.id,
            updated_at: data.updated_at,
          }));
        }
        showToast('Payment settings created successfully', 'success');
      }
      notifyUpiSettingsUpdated();
      closeSwal();
    } catch (err: any) {
      console.error('Error saving payment settings:', err);
      closeSwal();
      showToast('Error saving payment settings: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    showToast('Changes discarded', 'info');
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const themedInputClass = "w-full px-6 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-black transition-all text-slate-800 placeholder-slate-400";
  const themeButtonClass = "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm";

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Payment Settings...</p>
      </div>
    );
  }

  const isLive = !!settings.id && !!settings.upi_id?.includes('@');

  return (
    <div className="max-w-3xl space-y-6 md:space-y-10 pb-20">
      <div>
        <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight">Payment Gateway Configuration</h2>
        <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em]">Manage UPI and Payment Settings</p>
      </div>

      {/* Live status banner */}
      <div className={`p-4 md:p-5 rounded-2xl border ${isLive ? 'bg-success/5 border-success/20' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLive ? 'bg-success/10 text-success' : 'bg-amber-100 text-amber-600'}`}>
            <i className={`fas ${isLive ? 'fa-check-circle' : 'fa-exclamation-triangle'} text-lg`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[11px] font-black uppercase tracking-widest ${isLive ? 'text-success' : 'text-amber-700'}`}>
              {isLive ? 'Live — parents see your UPI ID' : 'Not configured — parents see fallback'}
            </p>
            <p className="text-[10px] font-bold text-slate-600 mt-1 break-all">
              {isLive ? `Active UPI: ${settings.upi_id} (${settings.business_name})` : 'Save your UPI ID below to start collecting payments.'}
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-premium p-5 md:p-8 space-y-5 md:space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">
              UPI ID
            </label>
            <input
              type="text"
              name="upi_id"
              value={settings.upi_id}
              onChange={handleInputChange}
              placeholder="e.g., schoolbus@hdfc"
              className={themedInputClass}
            />
            <p className="text-[10px] text-slate-400 mt-2 font-bold">
              Format: yourname@bankname (e.g., schoolbus@hdfc, admin@axis)
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">
              Business Name
            </label>
            <input
              type="text"
              name="business_name"
              value={settings.business_name}
              onChange={handleInputChange}
              placeholder="e.g., SchoolBusWay"
              className={themedInputClass}
            />
            <p className="text-[10px] text-slate-400 mt-2 font-bold">
              This will appear in customers' payment requests
            </p>
          </div>
        </div>

        {settings.updated_at && (
          <div className="p-4 bg-success/5 border border-success/20 rounded-2xl">
            <p className="text-[10px] font-bold text-success/80">
              Last updated: {new Date(settings.updated_at).toLocaleString()}
            </p>
          </div>
        )}

        {/* Test Info */}
        <div className="p-4 bg-info/5 border border-info/20 rounded-2xl">
          <p className="text-[11px] font-black text-info/80 mb-2">💡 HOW TO GET UPI ID:</p>
          <ul className="text-[10px] text-info/70 space-y-1 ml-4">
            <li>• Download Google Pay, PhonePe, or BHIM app</li>
            <li>• Set up a merchant account or UPI ID</li>
            <li>• Your UPI ID format: username@bankname</li>
            <li>• Supported banks: HDFC, Axis, ICICI, Kotak, IDBI, etc.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex-1 ${themeButtonClass} ${
              hasChanges && !saving
                ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-check mr-2"></i>
                Save Settings
              </>
            )}
          </button>
          {hasChanges && (
            <button
              onClick={handleReset}
              disabled={saving}
              className={`flex-1 ${themeButtonClass} bg-slate-100 text-slate-600 border border-slate-200 hover:scale-105`}
            >
              <i className="fas fa-undo mr-2"></i>
              Discard Changes
            </button>
          )}
        </div>
      </div>

      {/* Documentation Card */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl md:rounded-3xl border border-primary/20 p-5 md:p-8">
        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <i className="fas fa-book text-primary"></i>
          How It Works
        </h3>
        <div className="space-y-3 text-[11px] text-slate-700 font-bold">
          <p>✓ Settings are saved to the database and persist across app restarts</p>
          <p>✓ When parents click "Pay via UPI", they'll be directed to their UPI app</p>
          <p>✓ The payment request includes your UPI ID and business name</p>
          <p>✓ Parents manually verify payment and upload transaction screenshot</p>
          <p>✓ Admin approves or rejects payment based on UTR verification</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;

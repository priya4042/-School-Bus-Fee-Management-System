import React, { useState } from 'react';
import { MessageSquare, Settings, Shield, Bell, Send, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

const WhatsAppSettings: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [autoSendPayment, setAutoSendPayment] = useState(true);
  const [autoSendReminder, setAutoSendReminder] = useState(true);
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">WhatsApp Integration</h1>
          <p className="text-slate-500 font-medium mt-2">Automated notifications and payment confirmations</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-premium border border-slate-100">
          <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl ${isEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
            {isEnabled ? 'Service Active' : 'Service Paused'}
          </span>
          <button 
            onClick={() => setIsEnabled(!isEnabled)}
            className={`w-14 h-8 rounded-full relative transition-colors ${isEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${isEnabled ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Configuration */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Shield size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">API Configuration</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">WhatsApp Business API Key</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 font-mono"
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary text-xs font-bold hover:underline">
                    Rotate Key
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Phone Number ID</label>
                  <input 
                    type="text" 
                    defaultValue="109283746554321"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Business Account ID</label>
                  <input 
                    type="text" 
                    defaultValue="987654321012345"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-black transition-colors shadow-lg shadow-slate-200">
                  Save Configuration
                </button>
              </div>
            </div>
          </div>

          {/* Automation Rules */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-warning/10 rounded-2xl flex items-center justify-center text-warning">
                <Zap size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Automation Rules</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Payment Confirmations</p>
                    <p className="text-slate-400 text-xs">Send WhatsApp receipt instantly after payment</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAutoSendPayment(!autoSendPayment)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${autoSendPayment ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${autoSendPayment ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-warning shadow-sm">
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Fee Reminders</p>
                    <p className="text-slate-400 text-xs">Send automated reminders to defaulters</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAutoSendReminder(!autoSendReminder)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${autoSendReminder ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${autoSendReminder ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Templates & Preview */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Message Templates</h3>
            <div className="space-y-3">
              {['Payment Success', 'Fee Reminder', 'Bus Arrival', 'Emergency Alert'].map((template) => (
                <button key={template} className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">{template}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">Approved</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-200 relative overflow-hidden">
            <div className="relative z-10">
              <MessageSquare size={32} className="mb-6 opacity-50" />
              <h3 className="text-xl font-black tracking-tight mb-2">Need Help?</h3>
              <p className="text-emerald-100 text-sm font-medium mb-6">Our integration experts can help you set up your WhatsApp Business account.</p>
              <button className="w-full bg-white text-emerald-600 py-4 rounded-2xl font-bold text-sm hover:bg-emerald-50 transition-colors">
                Contact Support
              </button>
            </div>
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSettings;

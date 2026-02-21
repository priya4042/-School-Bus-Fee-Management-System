import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { showToast, showLoading, closeSwal } from '../lib/swal';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fees');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    cutoffDay: 10,
    gracePeriod: 2,
    dailyPenalty: 50,
    maxPenalty: 500,
    strictNoSkip: true,
    enforce2FA: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('settings/fees');
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    showLoading('Syncing Global Parameters...');
    try {
      await api.post('settings/fees', settings);
      closeSwal();
      showToast('Configuration updated successfully', 'success');
    } catch (err) {
      closeSwal();
      showToast('Failed to sync settings', 'error');
    }
  };

  const handleResetDefaults = () => {
     setSettings({
        cutoffDay: 10,
        gracePeriod: 2,
        dailyPenalty: 50,
        maxPenalty: 500,
        strictNoSkip: true,
        enforce2FA: false
     });
     showToast('Parameters reset to defaults locally. Click Save to commit.', 'info');
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Core Config...</p>
      </div>
    );
  }

  const themedInputClass = "w-full px-6 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-black transition-all text-slate-800";

  return (
    <div className="max-w-5xl space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Core Configuration</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Manage Financial Rules & Fleet Policies</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm">
           <button onClick={() => setActiveTab('fees')} className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'fees' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}>Fee Engine</button>
           <button onClick={() => setActiveTab('security')} className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}>Security</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           {activeTab === 'fees' ? (
             <>
              <section className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                      <i className="fas fa-money-bill-wave"></i>
                   </div>
                   <div>
                      <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Fee Lifecycle Configuration</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Monthly Billing Schedule</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Due Cutoff (Day)</label>
                    <div className="relative">
                       <i className="fas fa-calendar-day absolute left-5 top-1/2 -translate-y-1/2 text-primary/30"></i>
                       <input 
                         type="number" 
                         value={settings.cutoffDay} 
                         onChange={(e) => setSettings({...settings, cutoffDay: parseInt(e.target.value)})}
                         className={themedInputClass + " pl-14 text-primary text-lg"} 
                       />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase ml-2">Payments are marked OVERDUE after this day.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">No-Skip Constraint</label>
                    <button 
                      onClick={() => setSettings({...settings, strictNoSkip: !settings.strictNoSkip})}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${settings.strictNoSkip ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                    >
                       <i className={`fas ${settings.strictNoSkip ? 'fa-lock' : 'fa-unlock'}`}></i>
                       <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed text-left">
                          {settings.strictNoSkip ? 'STRICT: Parents cannot pay future months if previous dues exist.' : 'LAX: Parents may settle any month in any order.'}
                       </p>
                    </button>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-12 h-12 bg-danger/10 text-danger rounded-2xl flex items-center justify-center">
                      <i className="fas fa-clock"></i>
                   </div>
                   <div>
                      <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Late Fee Calculation Engine</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Penalty Algorithms</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grace Period (Days)</label>
                    <input 
                      type="number" 
                      value={settings.gracePeriod} 
                      onChange={(e) => setSettings({...settings, gracePeriod: parseInt(e.target.value)})}
                      className={themedInputClass} 
                    />
                    <p className="text-[9px] font-bold text-slate-400 uppercase ml-2">Days allowed after due date before penalties.</p>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Daily Penalty Rate</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black">₹</span>
                      <input 
                        type="number" 
                        value={settings.dailyPenalty} 
                        onChange={(e) => setSettings({...settings, dailyPenalty: parseInt(e.target.value)})}
                        className={themedInputClass + " pl-12 text-danger"} 
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Maximum Late Fee Threshold</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black">₹</span>
                      <input 
                        type="number" 
                        value={settings.maxPenalty} 
                        onChange={(e) => setSettings({...settings, maxPenalty: parseInt(e.target.value)})}
                        className={themedInputClass + " pl-12 text-danger text-xl tracking-tighter"} 
                      />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase ml-2">The highest total late fee a student can accumulate per month.</p>
                  </div>
                </div>
              </section>
             </>
           ) : (
             <section className="bg-slate-900 rounded-[2.5rem] p-12 text-white shadow-2xl animate-in zoom-in duration-500">
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10">
                      <i className="fas fa-shield-alt text-2xl"></i>
                   </div>
                   <div>
                      <h3 className="text-2xl font-black tracking-tight">Access Control</h3>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Audit & Encryption Policies</p>
                   </div>
                </div>
                <div className="space-y-8">
                   <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                      <div>
                         <p className="font-black uppercase text-[10px] tracking-widest">Enforce 2FA for Staff</p>
                         <p className="text-[9px] font-bold text-white/40 uppercase mt-1">Drivers & Teachers require OTP login</p>
                      </div>
                      <button 
                        onClick={() => setSettings({...settings, enforce2FA: !settings.enforce2FA})}
                        className={`w-14 h-7 rounded-full relative transition-all ${settings.enforce2FA ? 'bg-success' : 'bg-slate-700'}`}
                      >
                         <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.enforce2FA ? 'right-1' : 'left-1'}`}></div>
                      </button>
                   </div>
                </div>
             </section>
           )}
        </div>

        <div className="space-y-8">
           <div className="bg-primary p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                 <i className="fas fa-save text-8xl"></i>
              </div>
              <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-white/40 mb-10">Configuration Vault</h4>
              <p className="text-sm font-bold leading-relaxed mb-10 opacity-80">
                 All system changes are logged and broadcasted to relevant stakeholders. Saving these updates will recalibrate the fee calculation engine instantly.
              </p>
              <div className="space-y-4">
                 <button 
                   onClick={handleSave}
                   className="w-full py-5 bg-white text-primary font-black uppercase text-[10px] tracking-widest rounded-2xl hover:shadow-2xl transition-all shadow-xl active:scale-[0.98]"
                 >
                    Commit Global Changes
                 </button>
                 <button 
                   onClick={handleResetDefaults}
                   className="w-full py-5 bg-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/20 transition-all"
                 >
                    Reset To Session Defaults
                 </button>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
                 <i className="fas fa-info-circle text-primary"></i>
                 Active Parameters
              </h4>
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">App Version</span>
                    <span className="text-[10px] font-black text-slate-800">2.4.0-PRO</span>
                 </div>
                 <div className="h-px bg-slate-50"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Database</span>
                    <span className="text-[10px] font-black text-success">CONNECTED</span>
                 </div>
                 <div className="h-px bg-slate-50"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Last Sync</span>
                    <span className="text-[10px] font-black text-slate-800 uppercase">{new Date().toLocaleDateString('en-GB')}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
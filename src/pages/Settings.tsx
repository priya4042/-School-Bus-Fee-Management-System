
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  Smartphone,
  CreditCard,
  Mail,
  Lock,
  User,
  ChevronRight,
  CheckCircle2,
  Save
} from 'lucide-react';
import { showToast } from '../lib/swal';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Settings saved successfully');
    }, 1500);
  };

  const tabs = [
    { name: 'General', icon: SettingsIcon, description: 'Basic application configuration' },
    { name: 'Notifications', icon: Bell, description: 'SMS & Push notification alerts' },
    { name: 'Security', icon: Shield, description: 'Access control & authentication' },
    { name: 'Billing', icon: CreditCard, description: 'Subscription & Payment methods' },
    { name: 'Backup', icon: Database, description: 'Data export & cloud sync' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">System Settings</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Configure Enterprise Environment</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-950 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-900 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 active:scale-95 active:translate-y-0 disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Save size={18} />
          )}
          Save Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full p-5 rounded-2xl text-left transition-all group flex items-center gap-4 ${
                activeTab === tab.name 
                  ? 'bg-white text-primary shadow-premium border border-slate-100' 
                  : 'text-slate-400 hover:bg-white/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                activeTab === tab.name ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
              }`}>
                <tab.icon size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-[11px] font-black uppercase tracking-tight">{tab.name}</h3>
                <p className="text-[8px] font-bold uppercase tracking-widest opacity-60 truncate">{tab.description}</p>
              </div>
              <ChevronRight size={14} className={activeTab === tab.name ? 'text-primary' : 'text-slate-200'} />
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-10">{activeTab} Configuration</h3>
            
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institution Name</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      defaultValue="BusWay Pro Academy"
                      className="w-full bg-slate-50 border-none rounded-2xl p-5 pl-12 text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="email" 
                      defaultValue="support@buswaypro.com"
                      className="w-full bg-slate-50 border-none rounded-2xl p-5 pl-12 text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Notification Preferences</h4>
                <div className="space-y-4">
                  {[
                    { label: 'SMS Alerts for Late Arrivals', icon: Smartphone },
                    { label: 'Email Receipts for Payments', icon: Mail },
                    { label: 'System Maintenance Notices', icon: SettingsIcon },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] group hover:bg-slate-100 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                          <item.icon size={18} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{item.label}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={idx !== 2} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary">
                      <Shield size={32} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black uppercase tracking-tight">Security Audit</h4>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Last scan: 2 hours ago • No threats found</p>
                    </div>
                  </div>
                  <button className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/5">
                    Run Full Scan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

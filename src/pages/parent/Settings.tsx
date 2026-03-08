
import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { Settings as SettingsIcon, User as UserIcon, Bell, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Camera, Smartphone, Globe, Mail, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Settings: React.FC<{ user: User }> = ({ user }) => {
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: <UserIcon size={20} /> },
    { id: 'notifications', name: 'Alerts', icon: <Bell size={20} /> },
    { id: 'security', name: 'Security', icon: <Shield size={20} /> },
    { id: 'billing', name: 'Billing', icon: <CreditCard size={20} /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Preferences</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage Account & System Settings</p>
        </div>
        <button 
          onClick={logout}
          className="bg-red-50 text-red-600 px-8 py-4 rounded-2xl font-bold text-sm border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Navigation</h3>
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left transition-all ${
                    activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Support Hub</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                    <HelpCircle size={18} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Help Center</span>
                </div>
                <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-colors" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center">
                    <Globe size={18} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Language</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">English</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-[3rem] p-10 shadow-premium border border-slate-100">
              <div className="flex items-center gap-8 mb-12 pb-12 border-b border-slate-50">
                <div className="relative group">
                  <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 overflow-hidden border-4 border-white shadow-xl">
                    <UserIcon size={64} />
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Camera size={18} />
                  </button>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{user.full_name}</h3>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">{user.role} Account • Member Since 2023</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                  <input type="text" defaultValue={user.full_name} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-4 ring-primary/10 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                  <input type="email" defaultValue={user.email} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-4 ring-primary/10 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Phone Number</label>
                  <input type="tel" defaultValue={user.phone_number || '+91 98765 43210'} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-4 ring-primary/10 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Admission Number</label>
                  <input type="text" defaultValue={user.admissionNumber || 'ADM-2023-001'} className="w-full px-6 py-4 rounded-2xl bg-slate-100 border border-slate-100 text-sm font-bold text-slate-400 cursor-not-allowed" disabled />
                </div>
              </div>

              <div className="mt-12 flex justify-end">
                <button className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-[3rem] p-10 shadow-premium border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-10">Alert Preferences</h3>
              <div className="space-y-6">
                {[
                  { title: 'Push Notifications', desc: 'Receive real-time alerts on your mobile device', icon: <Smartphone /> },
                  { title: 'Email Summaries', desc: 'Weekly reports of student activity and fees', icon: <Mail /> },
                  { title: 'SMS Alerts', desc: 'Critical alerts for bus delays and emergencies', icon: <MessageSquare /> },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.desc}</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-[3rem] p-10 shadow-premium border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-10">Security Settings</h3>
              <div className="space-y-8">
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Change Password</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Last updated 3 months ago</p>
                  </div>
                  <button className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm hover:bg-slate-50 transition-all">
                    Update
                  </button>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Two-Factor Authentication</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Add an extra layer of security</p>
                  </div>
                  <button className="px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-white rounded-[3rem] p-10 shadow-premium border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-10">Payment Methods</h3>
              <div className="space-y-6">
                <div className="p-8 bg-slate-950 rounded-[2rem] text-white flex items-center justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full -mr-10 -mt-10 blur-2xl"></div>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                      <div className="flex gap-1">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <div className="w-4 h-4 bg-amber-500 rounded-full -ml-2"></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mastercard •••• 4242</p>
                      <p className="text-sm font-black uppercase tracking-widest mt-1">Expires 12/25</p>
                    </div>
                  </div>
                  <button className="relative z-10 p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all">
                    <LogOut size={16} className="rotate-90" />
                  </button>
                </div>
                <button className="w-full p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center gap-3 text-slate-400 hover:bg-slate-100 hover:border-slate-300 transition-all">
                  <CreditCard size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Add New Payment Method</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

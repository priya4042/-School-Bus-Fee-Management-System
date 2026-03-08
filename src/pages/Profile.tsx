
import React from 'react';
import { User, UserRole } from '../types';
import { User as UserIcon, Mail, Phone, Shield, Camera, LogOut, MapPin, Calendar, CreditCard, Bell, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Profile: React.FC<{ user?: User }> = ({ user: propUser }) => {
  const { user: authUser, logout } = useAuthStore();
  const user = propUser || authUser;

  if (!user) return <div className="p-20 text-center">Loading Profile...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">User Profile</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Personal Identity & Account Security</p>
        </div>
        <button 
          onClick={logout}
          className="bg-red-50 text-red-600 px-8 py-4 rounded-2xl font-bold text-sm border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-premium border border-slate-100 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-slate-950 -mt-10 -skew-y-6 group-hover:skew-y-0 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="w-32 h-32 bg-white rounded-[2.5rem] p-1 shadow-2xl mx-auto mb-6">
                <div className="w-full h-full bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300">
                  <UserIcon size={64} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{user.full_name}</h2>
              <p className="text-primary font-black uppercase text-[10px] tracking-widest mt-1">{user.role} Account</p>
              
              <div className="mt-10 pt-10 border-t border-slate-50 space-y-6 text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-xs font-black text-slate-800 uppercase">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-xs font-black text-slate-800 uppercase">{user.phone_number || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Account Status</p>
                    <p className="text-xs font-black text-emerald-600 uppercase">Verified & Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-premium border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-10">Account Settings</h3>
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
                <input type="tel" defaultValue={user.phone_number || ''} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-4 ring-primary/10 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-4 ring-primary/10 outline-none" />
              </div>
            </div>
            <div className="mt-12 flex justify-end">
              <button className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
                Update Dossier
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 shadow-premium border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-10">System Preferences</h3>
            <div className="space-y-4">
              {[
                { title: 'Email Notifications', icon: <Bell />, enabled: true },
                { title: 'SMS Alerts', icon: <Phone />, enabled: false },
                { title: 'Two-Factor Auth', icon: <Shield />, enabled: true },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{item.title}</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative cursor-pointer ${item.enabled ? 'bg-primary' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${item.enabled ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

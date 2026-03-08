
import React from 'react';
import { User, UserRole } from '../types';
import { Bell, Info, AlertTriangle, CheckCircle2, Clock, Trash2, Settings, Mail, MessageSquare, Search, Filter } from 'lucide-react';

const Notifications: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Alert Center</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">System Notifications & Updates</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-bold text-sm border border-slate-100 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Settings size={18} />
            Preferences
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Filter Alerts</h3>
            <div className="space-y-2">
              <button className="w-full px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left bg-primary text-white shadow-lg shadow-primary/20">
                All Notifications
              </button>
              <button className="w-full px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left text-slate-500 hover:bg-slate-50 transition-all">
                Unread Only
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Search size={20} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search alerts..." 
                  className="bg-transparent border-none font-bold text-sm focus:ring-0 w-64"
                />
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all flex items-center gap-2">
                  <Filter size={14} />
                  Filter
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                      <Bell size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black uppercase tracking-tight text-slate-900 mb-2">Fee Payment Successful</h4>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-2xl">
                        Your payment for May 2024 has been processed successfully. Receipt ID: RCP-2024-00{i}.
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock size={12} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">2 Hours Ago</span>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest">Success</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-sm hover:bg-slate-900 hover:text-white transition-all">
                      <Trash2 size={16} />
                    </button>
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

export default Notifications;

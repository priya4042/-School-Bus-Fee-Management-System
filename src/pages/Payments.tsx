
import React from 'react';
import { User, UserRole } from '../types';
import { CreditCard, Download, Search, Filter, CheckCircle2, AlertCircle, Clock, ChevronRight, Plus } from 'lucide-react';

const Payments: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Payment Hub</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage Subscriptions & Transaction History</p>
        </div>
        <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2">
          <Plus size={20} />
          Add Payment Method
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full -mr-10 -mt-10 blur-2xl"></div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-8 relative z-10">Active Card</h3>
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-6">
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
              <div className="pt-8 border-t border-white/5">
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Cardholder Name</p>
                <p className="text-xs font-black uppercase tracking-widest">{user.full_name}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 shadow-premium border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase mb-8">Quick Stats</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Spent</span>
                <span className="text-sm font-black text-slate-900 tracking-tight">₹42,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Dues</span>
                <span className="text-sm font-black text-red-500 tracking-tight">₹4,500</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Billing</span>
                <span className="text-sm font-black text-slate-900 tracking-tight">June 01, 2024</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Recent Transactions</h3>
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search transactions..." 
                  className="bg-slate-50 border-none rounded-2xl py-3 pl-14 pr-6 text-xs font-bold focus:ring-4 ring-primary/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">School Fee - May 2024</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">TXN-987654321 • May {i}, 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 tracking-tight mb-2">₹4,500</p>
                    <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <CheckCircle2 size={10} /> Success
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-6 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
              Load More History
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;

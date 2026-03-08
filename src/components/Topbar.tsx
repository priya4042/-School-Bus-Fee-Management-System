
import React from 'react';
import { User, UserRole } from '../types';
import { Menu, Bell, Search, User as UserIcon, ShieldCheck } from 'lucide-react';

interface TopbarProps {
  user: User;
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ user, onMenuClick }) => {
  return (
    <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-8 md:px-12 relative z-20">
      <div className="flex items-center gap-4 lg:hidden">
        <button 
          onClick={onMenuClick}
          className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex-1 max-w-2xl hidden md:block">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Global Search (Students, Routes, Payments...)" 
            className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-14 text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all relative group">
          <Bell size={24} />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full group-hover:scale-125 transition-transform"></span>
        </button>
        
        <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden lg:block">
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{user.full_name}</p>
            <div className="flex items-center gap-2 justify-end">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{user.role}</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20">
            <UserIcon size={24} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

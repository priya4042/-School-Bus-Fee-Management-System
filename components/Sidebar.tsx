
import React from 'react';
import { User, UserRole } from '../types';
import { APP_NAME } from '../constants';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, activeTab, setActiveTab }) => {
  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  const isAdmin = user.role === UserRole.ADMIN || isSuperAdmin;
  const isTeacher = user.role === UserRole.TEACHER;
  const isDriver = user.role === UserRole.DRIVER;
  const isParent = user.role === UserRole.PARENT;

  const adminLinks = [
    { name: 'Dashboard', icon: 'fa-chart-pie' },
    { name: 'Students', icon: 'fa-user-graduate' },
    { name: 'Attendance', icon: 'fa-clipboard-check' },
    { name: 'Routes', icon: 'fa-route' },
    { name: 'Buses', icon: 'fa-bus' },
    { name: 'Fees', icon: 'fa-file-invoice-dollar' },
    { name: 'Reports', icon: 'fa-file-alt' },
    { name: 'Notifications', icon: 'fa-bullhorn' },
    { name: 'Audit Logs', icon: 'fa-fingerprint' },
    ...(isSuperAdmin ? [{ name: 'Admins', icon: 'fa-user-shield' }] : []),
    { name: 'Settings', icon: 'fa-cog' },
  ];

  const parentLinks = [
    { name: 'Dashboard', icon: 'fa-home' },
    { name: 'Payments', icon: 'fa-credit-card' },
    { name: 'Notifications', icon: 'fa-bell' },
    { name: 'Receipts', icon: 'fa-receipt' },
    { name: 'Profile', icon: 'fa-user' },
  ];

  const teacherLinks = [
    { name: 'Dashboard', icon: 'fa-chalkboard-teacher' },
    { name: 'Attendance', icon: 'fa-clipboard-check' },
    { name: 'Profile', icon: 'fa-user' },
  ];

  const driverLinks = [
    { name: 'Dashboard', icon: 'fa-id-card' },
    { name: 'Attendance', icon: 'fa-clipboard-check' },
    { name: 'Profile', icon: 'fa-user' },
  ];

  const links = isAdmin ? adminLinks : 
                isTeacher ? teacherLinks : 
                isDriver ? driverLinks : parentLinks;

  return (
    <div className="w-72 bg-slate-950 text-white flex flex-col hidden md:flex shrink-0 border-r border-white/5">
      <div className="p-8 flex items-center gap-4">
        <div className="bg-primary p-2.5 rounded-2xl shadow-xl shadow-primary/30">
          <i className="fas fa-bus-alt text-2xl"></i>
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tighter uppercase">{APP_NAME}</span>
          <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em]">Fleet Intelligence</span>
        </div>
      </div>

      <nav className="flex-1 mt-6 px-6 space-y-2 overflow-y-auto scrollbar-hide pb-10">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-4">Main Portal</p>
        {links.map((link) => (
          <button
            key={link.name}
            onClick={() => setActiveTab(link.name)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-left group ${
              activeTab === link.name 
                ? 'bg-primary text-white shadow-2xl shadow-primary/40' 
                : 'text-slate-500 hover:bg-white/5 hover:text-white'
            }`}
          >
            <i className={`fas ${link.icon} w-6 text-lg transition-transform group-hover:scale-110`}></i>
            <span className="font-black text-xs uppercase tracking-widest">{link.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-white/5 bg-slate-900/30">
        <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-2xl border border-white/5">
           <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Systems Connected</span>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-5 py-4 text-slate-500 hover:bg-danger/10 hover:text-danger rounded-2xl transition-all group"
        >
          <i className="fas fa-power-off w-6 text-lg transition-transform group-hover:rotate-12"></i>
          <span className="font-black text-xs uppercase tracking-widest">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

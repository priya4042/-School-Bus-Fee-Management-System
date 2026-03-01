
import React from 'react';
import { User, UserRole } from '../types';
import { APP_NAME } from '../constants';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, activeTab, setActiveTab, isOpen, onClose }) => {
  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  const isAdmin = user.role === UserRole.ADMIN || isSuperAdmin;
  const isParent = user.role === UserRole.PARENT;

  const adminLinks = [
    { name: 'Dashboard', icon: 'fa-chart-pie' },
    { name: 'Students', icon: 'fa-user-graduate' },
    { name: 'Attendance', icon: 'fa-clipboard-check' },
    { name: 'User Directory', icon: 'fa-address-book' },
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

  const getLinks = () => {
    if (isAdmin) return adminLinks;
    if (isParent) return parentLinks;
    return [];
  };

  const links = getLinks();

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-[2000] w-72 bg-slate-950 text-white flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  const handleTabClick = (name: string) => {
    setActiveTab(name);
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1999] lg:hidden" onClick={onClose}></div>}

      <div className={sidebarClasses}>
        <div className="p-8 flex items-center gap-4">
          <div className="bg-primary p-2.5 rounded-2xl shadow-xl shadow-primary/30">
            <i className="fas fa-bus-alt text-2xl text-white"></i>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter uppercase leading-none">{APP_NAME}</span>
            <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em] mt-1">Enterprise Fleet</span>
          </div>
        </div>

        <nav className="flex-1 mt-6 px-6 space-y-2 overflow-y-auto scrollbar-hide pb-10">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-4">Main Portal</p>
          {links.map((link) => (
            <button
              key={link.name}
              onClick={() => handleTabClick(link.name)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all text-left group ${
                activeTab === link.name 
                  ? 'bg-primary text-white shadow-2xl shadow-primary/40 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <i className={`fas ${link.icon} w-6 text-lg transition-transform group-hover:scale-110`}></i>
              <span className="font-bold text-xs uppercase tracking-widest">{link.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5 bg-slate-900/20">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-4 text-slate-500 hover:bg-danger/10 hover:text-danger rounded-2xl transition-all group">
            <i className="fas fa-power-off w-6 text-lg transition-transform group-hover:rotate-12"></i>
            <span className="font-bold text-xs uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

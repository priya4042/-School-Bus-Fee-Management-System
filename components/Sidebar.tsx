
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
    <div className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-primary p-2 rounded-lg">
          <i className="fas fa-bus text-xl"></i>
        </div>
        <span className="font-bold text-xl tracking-tight">{APP_NAME}</span>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
        {links.map((link) => (
          <button
            key={link.name}
            onClick={() => setActiveTab(link.name)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
              activeTab === link.name ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fas ${link.icon} w-5`}></i>
            <span className="font-medium">{link.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
        >
          <i className="fas fa-sign-out-alt w-5"></i>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

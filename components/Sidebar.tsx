
import React from 'react';
import { User, UserRole } from '../types';
import { APP_NAME } from '../constants';
import { useLanguage } from '../lib/i18n';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, activeTab, setActiveTab, isOpen, onClose }) => {
  const { t } = useLanguage();
  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  const isAdmin = user.role === UserRole.ADMIN || isSuperAdmin;
  const isParent = user.role === UserRole.PARENT;
  const parentCameraEnabled = (user as any).preferences?.camera === true;
  const parentTrackingEnabled = (user as any).preferences?.tracking === true;

  const adminLinks = [
    { name: 'Dashboard', label: t('dashboard'), icon: 'fa-chart-pie' },
    { name: 'Students', label: t('students'), icon: 'fa-user-graduate' },
    { name: 'Attendance', label: t('attendance'), icon: 'fa-clipboard-check' },
    { name: 'Buses', label: t('buses'), icon: 'fa-bus' },
    { name: 'Live Tracking', label: t('live_tracking'), icon: 'fa-location-dot' },
    { name: 'Payments', label: t('payments'), icon: 'fa-credit-card' },
    { name: 'Notifications', label: t('notifications'), icon: 'fa-bullhorn' },
    ...(isSuperAdmin ? [{ name: 'Bus admins', label: t('bus_admins'), icon: 'fa-user-shield' }] : []),
    { name: 'Settings', label: t('settings'), icon: 'fa-cog' },
    { name: 'Support', label: t('support'), icon: 'fa-headset' },
  ];

  const parentLinks = [
    { name: 'Dashboard', label: t('dashboard'), icon: 'fa-home' },
    { name: 'Student Profile', label: t('student_profile'), icon: 'fa-user-graduate' },
    { name: 'Attendance History', label: t('attendance_history'), icon: 'fa-clipboard-check' },
    { name: 'Routes', label: t('routes'), icon: 'fa-route' },
    ...(parentTrackingEnabled ? [{ name: 'Live Tracking', label: t('live_tracking'), icon: 'fa-location-dot' }] : []),
    ...(parentCameraEnabled ? [{ name: 'Bus Camera', label: t('bus_camera'), icon: 'fa-video' }] : []),
    { name: 'Payments', label: t('payments'), icon: 'fa-credit-card' },
    { name: 'Notifications', label: t('notifications'), icon: 'fa-bell' },
    { name: 'Profile', label: t('profile'), icon: 'fa-user' },
    { name: 'Settings', label: t('settings'), icon: 'fa-cog' },
    { name: 'Support', label: t('support'), icon: 'fa-headset' },
  ];

  const getLinks = () => {
    if (isAdmin) return adminLinks;
    if (isParent) return parentLinks;
    return [];
  };

  const links = getLinks();

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-[2000] w-[75vw] max-w-72 bg-slate-950 text-white flex flex-col transition-transform duration-300 lg:relative lg:w-72 lg:max-w-none lg:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  const handleTabClick = (name: string) => {
    setActiveTab(name);
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1999] lg:hidden" onClick={onClose}></div>}

      <div className={sidebarClasses} style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="px-5 py-5 lg:p-8 flex items-center gap-3">
          <div className="bg-primary p-2 lg:p-2.5 rounded-xl lg:rounded-2xl shadow-xl shadow-primary/30 flex-shrink-0">
            <i className="fas fa-bus-alt text-xl lg:text-2xl text-white"></i>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-black text-base lg:text-xl tracking-tighter uppercase leading-none truncate">{APP_NAME}</span>
            <span className="text-[7px] lg:text-[8px] font-black text-primary uppercase tracking-widest mt-1 truncate">{t('enterprise_fleet')}</span>
          </div>
        </div>

        <nav className="flex-1 mt-2 lg:mt-6 px-3 lg:px-6 space-y-1 lg:space-y-2 overflow-y-auto scrollbar-hide pb-4 lg:pb-10">
          <p className="text-[8px] lg:text-[9px] font-black text-slate-500 tracking-widest mb-2 lg:mb-4 ml-3 lg:ml-4">{t('main_portal')}</p>
          {links.map((link) => (
            <button
              key={link.name}
              onClick={() => handleTabClick(link.name)}
              className={`w-full flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-2.5 lg:py-3.5 rounded-xl lg:rounded-2xl transition-all text-left group ${
                activeTab === link.name
                  ? 'bg-primary text-white shadow-lg shadow-primary/40'
                  : 'text-slate-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <i className={`fas ${link.icon} w-5 lg:w-6 text-base lg:text-lg transition-transform group-hover:scale-110`}></i>
              <span className="font-bold text-xs lg:text-xs tracking-wider lg:tracking-widest truncate">{link.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-3 lg:px-6 py-3 lg:py-6 mt-auto border-t border-white/5 bg-slate-900/20">
          <button onClick={onLogout} className="w-full flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-3 lg:py-4 text-slate-500 hover:bg-danger/10 hover:text-danger rounded-xl lg:rounded-2xl transition-all group">
            <i className="fas fa-power-off w-5 lg:w-6 text-base lg:text-lg transition-transform group-hover:rotate-12"></i>
            <span className="font-bold text-[11px] lg:text-xs tracking-widest">{t('logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

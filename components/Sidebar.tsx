
import React, { useState } from 'react';
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

interface NavItem {
  name: string;
  label: string;
  icon: string;
  children?: { name: string; label: string; icon: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, activeTab, setActiveTab, isOpen, onClose }) => {
  const { t } = useLanguage();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  const isAdmin = user.role === UserRole.ADMIN || isSuperAdmin;
  const isParent = user.role === UserRole.PARENT;
  const parentCameraEnabled = (user as any).preferences?.camera === true;
  const parentTrackingEnabled = (user as any).preferences?.tracking === true;

  const adminLinks: NavItem[] = [
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

  const parentLinks: NavItem[] = [
    { name: 'Dashboard', label: t('dashboard'), icon: 'fa-home' },
    { name: 'Student Profile', label: t('student_profile'), icon: 'fa-user-graduate' },
    { name: 'Attendance History', label: t('attendance_history'), icon: 'fa-clipboard-check' },
    { name: 'Routes', label: t('routes'), icon: 'fa-route' },
    ...(parentTrackingEnabled ? [{ name: 'Live Tracking', label: t('live_tracking'), icon: 'fa-location-dot' }] : []),
    ...(parentCameraEnabled ? [{ name: 'Bus Camera', label: t('bus_camera'), icon: 'fa-video' }] : []),
    {
      name: 'Payments', label: t('payments'), icon: 'fa-credit-card',
      children: [
        { name: 'Fees', label: t('fee_history'), icon: 'fa-file-invoice' },
        { name: 'Receipts', label: 'Receipts', icon: 'fa-receipt' },
      ],
    },
    { name: 'Notifications', label: t('notifications'), icon: 'fa-bell' },
    {
      name: 'Profile', label: t('profile'), icon: 'fa-user',
      children: [
        { name: 'Profile', label: 'Edit Profile', icon: 'fa-user-edit' },
        { name: 'Settings', label: 'Password Reset', icon: 'fa-lock' },
        { name: 'Settings_lang', label: t('language'), icon: 'fa-globe' },
      ],
    },
    {
      name: 'Support', label: t('support'), icon: 'fa-headset',
      children: [
        { name: 'Support', label: t('submit_ticket'), icon: 'fa-ticket' },
        { name: 'Support_faq', label: t('faq'), icon: 'fa-circle-question' },
      ],
    },
  ];

  const links = isAdmin ? adminLinks : isParent ? parentLinks : [];

  const handleTabClick = (name: string) => {
    setActiveTab(name);
    if (onClose) onClose();
  };

  const toggleGroup = (name: string) => {
    setExpandedGroup(expandedGroup === name ? null : name);
  };

  const isChildActive = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some((c) => c.name === activeTab);
  };

  // Auto-expand group when its child is active
  React.useEffect(() => {
    for (const item of links) {
      if (item.children?.some((c) => c.name === activeTab)) {
        setExpandedGroup(item.name);
        return;
      }
    }
  }, [activeTab]);

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-[2000] w-[70vw] max-w-60 bg-slate-950 text-white flex flex-col transition-transform duration-300 lg:relative lg:w-60 lg:max-w-none lg:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1999] lg:hidden" onClick={onClose}></div>}

      <div className={sidebarClasses} style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Header */}
        <div className="px-4 py-4 lg:px-5 lg:py-6 flex items-center gap-2.5">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/30 flex-shrink-0">
            <i className="fas fa-bus-alt text-lg text-white"></i>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-black text-sm lg:text-base tracking-tighter uppercase leading-none truncate">{APP_NAME}</span>
            <span className="text-[6px] lg:text-[7px] font-black text-primary uppercase tracking-widest mt-0.5 truncate">{t('enterprise_fleet')}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-1 px-2 lg:px-3 space-y-0.5 overflow-y-auto scrollbar-hide pb-3">
          {links.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedGroup === item.name;
            const isActive = activeTab === item.name || isChildActive(item);

            return (
              <div key={item.name}>
                <button
                  onClick={() => {
                    if (hasChildren) {
                      toggleGroup(item.name);
                    } else {
                      handleTabClick(item.name);
                    }
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left group ${
                    isActive && !hasChildren
                      ? 'bg-primary text-white shadow-md shadow-primary/30'
                      : isActive && hasChildren
                      ? 'bg-white/5 text-white'
                      : 'text-slate-500 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <i className={`fas ${item.icon} w-4 text-sm transition-transform group-hover:scale-110`}></i>
                  <span className="font-bold text-[11px] tracking-wider truncate flex-1">{item.label}</span>
                  {hasChildren && (
                    <i className={`fas fa-chevron-right text-[8px] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${isActive ? 'text-white/60' : 'text-slate-600'}`}></i>
                  )}
                </button>

                {/* Sub-menu */}
                {hasChildren && isExpanded && (
                  <div className="ml-5 mt-0.5 mb-1 space-y-0.5 border-l border-white/10 pl-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    {item.children!.map((child) => {
                      return (
                        <button
                          key={child.name}
                          onClick={() => handleTabClick(child.name)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-left ${
                            activeTab === child.name
                              ? 'bg-primary/20 text-primary'
                              : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                          }`}
                        >
                          <i className={`fas ${child.icon} text-[9px] w-3`}></i>
                          <span className="font-bold text-[10px] tracking-wider truncate">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 lg:px-4 py-3 mt-auto border-t border-white/5">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/5 border border-transparent hover:border-red-500/20">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500 transition-all">
              <i className="fas fa-arrow-right-from-bracket text-red-400 text-[10px] group-hover:text-white transition-colors"></i>
            </div>
            <span className="font-bold text-[11px] text-slate-500 group-hover:text-red-400 tracking-wider transition-colors">{t('logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

import React from 'react';
import { User, UserRole } from '../types';
import { useLanguage } from '../lib/i18n';

interface BottomTabsProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomTabs: React.FC<BottomTabsProps> = ({ user, activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

  const parentTabs = [
    { name: 'Dashboard', label: t('dashboard'), icon: 'fa-home' },
    { name: 'Fees', label: t('payments'), icon: 'fa-credit-card' },
    { name: 'Notifications', label: t('notifications'), icon: 'fa-bell' },
    { name: 'Student Profile', label: t('student_profile'), icon: 'fa-user-graduate' },
    { name: 'Profile', label: t('profile'), icon: 'fa-user' },
  ];

  const adminTabs = [
    { name: 'Dashboard', label: t('dashboard'), icon: 'fa-chart-pie' },
    { name: 'Students', label: t('students'), icon: 'fa-user-graduate' },
    { name: 'Payments', label: t('payments'), icon: 'fa-credit-card' },
    { name: 'Notifications', label: t('notifications'), icon: 'fa-bullhorn' },
    { name: 'Settings', label: t('settings'), icon: 'fa-cog' },
  ];

  const tabs = isAdmin ? adminTabs : parentTabs;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[1400] bg-white border-t border-slate-100 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-all ${
                isActive ? 'text-primary' : 'text-slate-400'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                <i className={`fas ${tab.icon} text-lg`}></i>
                {tab.name === 'Notifications' && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
              <span className={`text-[8px] font-bold mt-1 truncate ${isActive ? 'font-black' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-5 h-0.5 bg-primary rounded-full mt-0.5"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabs;

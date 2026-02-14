
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../lib/api';

interface TopbarProps {
  user: User;
  onMenuClick?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ user, onMenuClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const getDisplayName = () => {
    if (!user) return 'User';
    return user.fullName || user.full_name || user.email?.split('@')[0] || 'User';
  };

  const displayName = getDisplayName();

  useEffect(() => {
    if (!user?.id) return;
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get(`notifications/my-alerts?user_id=${user.id}`);
        setNotifications(data);
      } catch (err) {
        setNotifications([
          { id: 1, title: "March Fee generated", created_at: "2h ago" },
          { id: 2, title: "Payment Successful", created_at: "5h ago" },
        ]);
      }
    };
    fetchNotifications();
  }, [user?.id]);

  return (
    <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-10 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3 md:gap-8 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden transition-colors"
          aria-label="Toggle Menu"
        >
          <i className="fas fa-bars text-lg md:text-xl"></i>
        </button>

        {/* Global Search - Hidden on very small screens, responsive on md+ */}
        {(user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ACCOUNTANT) && (
          <div className="hidden sm:flex relative w-full max-w-[200px] md:max-w-sm group">
            <i className="fas fa-search absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors text-sm"></i>
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full pl-10 md:pl-12 pr-4 md:pr-6 py-2 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
          >
            <i className="far fa-bell text-lg md:text-2xl"></i>
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-4 w-[280px] md:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 overflow-hidden">
              <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">Alert Center</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto scrollbar-hide divide-y divide-slate-50">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 md:p-4 hover:bg-slate-50 transition-all cursor-pointer">
                    <p className="text-xs font-bold text-slate-700">{n.title || n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{n.created_at}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer group p-1 rounded-2xl transition-all">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary text-white rounded-lg md:rounded-xl flex items-center justify-center font-black text-xs md:text-sm shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
            {displayName.charAt(0)}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-slate-800 leading-none">{displayName}</p>
            <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-black">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

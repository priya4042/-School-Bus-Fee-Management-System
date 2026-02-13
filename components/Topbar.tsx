
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../lib/api';

interface TopbarProps {
  user: User;
}

const Topbar: React.FC<TopbarProps> = ({ user }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const getDisplayName = () => {
    if (!user) return 'User';
    const name = user.fullName || user.full_name || user.email?.split('@')[0] || 'User';
    return String(name);
  };

  const displayName = getDisplayName();
  const firstName = displayName.split(' ')[0] || 'User';

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get(`/notifications/my-alerts?user_id=${user.id}`);
        setNotifications(data);
      } catch (err) {
        setNotifications([
          { id: 1, title: "March Fee generated", created_at: "2h ago" },
          { id: 2, title: "Payment Successful", created_at: "5h ago" },
          { id: 3, title: "Bus 102 Maintenance Alert", created_at: "1d ago" },
        ]);
      }
    };
    fetchNotifications();
  }, [user?.id]);

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-10 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8 flex-1">
        <div className="flex items-center md:hidden">
          <button className="p-2 text-slate-600">
            <i className="fas fa-bars text-2xl"></i>
          </button>
        </div>

        {/* Global Search - Only for Admins/Accountants */}
        {(user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ACCOUNTANT) && (
          <div className="hidden md:flex relative w-full max-w-md group">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"></i>
            <input 
              type="text" 
              placeholder="Jump to student, route, or invoice..."
              className="w-full pl-12 pr-6 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
               <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Quick Results</p>
                  <div className="space-y-2">
                     <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black">A</div>
                        <span className="text-sm font-bold text-slate-700">Alice Doe (1001)</span>
                     </div>
                     <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center text-xs font-black">R</div>
                        <span className="text-sm font-bold text-slate-700">Route North Zone</span>
                     </div>
                  </div>
               </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
          >
            <i className="far fa-bell text-2xl"></i>
            {notifications.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-4 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="font-black text-slate-800 uppercase tracking-widest text-xs">Alert Center</span>
                <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">{notifications.length} New</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide divide-y divide-slate-50">
                {notifications.length > 0 ? notifications.map((n) => (
                  <div key={n.id} className="p-5 hover:bg-slate-50 transition-all cursor-pointer group">
                    <p className="text-sm font-bold text-slate-700 leading-snug group-hover:text-primary transition-colors">{n.title || n.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <i className="far fa-clock text-[10px] text-slate-300"></i>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{n.created_at}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center">
                    <i className="fas fa-bell-slash text-4xl text-slate-100 mb-4"></i>
                    <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Clear Skies</p>
                  </div>
                )}
              </div>
              <div className="p-4 text-center border-t border-slate-100 bg-slate-50/50">
                <button className="text-[10px] font-black text-slate-500 hover:text-primary uppercase tracking-widest">View All Notifications</button>
              </div>
            </div>
          )}
        </div>
        
        <div className="h-10 w-px bg-slate-100 mx-2 hidden md:block"></div>

        <div className="flex items-center gap-4 cursor-pointer group p-1.5 hover:bg-slate-50 rounded-2xl transition-all">
          <div className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
            {displayName.charAt(0)}
          </div>
          <div className="hidden lg:block text-right">
            <p className="text-sm font-black text-slate-800 leading-none">{displayName}</p>
            <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-[0.1em] font-black">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          <i className="fas fa-chevron-down text-xs text-slate-300 group-hover:text-primary transition-colors"></i>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

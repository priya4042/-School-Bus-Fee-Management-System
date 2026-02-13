
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import api from '../lib/api';

interface TopbarProps {
  user: User;
}

const Topbar: React.FC<TopbarProps> = ({ user }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Safe name access
  const displayName = user?.fullName || user?.full_name || 'User';
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
        ]);
      }
    };
    fetchNotifications();
  }, [user?.id]);

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-10 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center md:hidden">
        <button className="p-2 text-slate-600">
          <i className="fas fa-bars text-2xl"></i>
        </button>
      </div>

      <div className="hidden md:flex flex-col">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Welcome, {firstName}</h2>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{user?.role?.replace('_', ' ')} Portal Active</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
          >
            <i className="far fa-bell text-2xl"></i>
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-danger rounded-full border-2 border-white text-[8px] font-black text-white flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-4 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <span className="font-black text-slate-800 uppercase tracking-widest text-xs">Notifications</span>
                <button className="text-[10px] text-primary font-black uppercase hover:underline">Mark all read</button>
              </div>
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                {notifications.length > 0 ? notifications.map((n) => (
                  <div key={n.id} className="p-5 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-all cursor-pointer group">
                    <p className="text-sm font-bold text-slate-700 leading-snug group-hover:text-primary transition-colors">{n.title || n.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <i className="far fa-clock text-[10px] text-slate-300"></i>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{n.created_at}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center">
                    <i className="fas fa-bell-slash text-4xl text-slate-100 mb-4"></i>
                    <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">No New Alerts</p>
                  </div>
                )}
              </div>
              <div className="p-4 text-center border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                <button className="text-[10px] font-black text-slate-500 hover:text-primary uppercase tracking-widest">View Activity Logs</button>
              </div>
            </div>
          )}
        </div>
        
        <div className="h-10 w-px bg-slate-100 mx-2"></div>

        <div className="flex items-center gap-4 cursor-pointer group p-1.5 hover:bg-slate-50 rounded-2xl transition-all">
          <div className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
            {displayName.charAt(0)}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-black text-slate-800 leading-none">{displayName}</p>
            <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-[0.1em] font-black">
              {user?.admissionNumber ? `ID: ${user.admissionNumber}` : user?.email?.split('@')[0]}
            </p>
          </div>
          <i className="fas fa-chevron-down text-xs text-slate-300 group-hover:text-primary transition-colors"></i>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

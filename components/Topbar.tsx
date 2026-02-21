import React, { useState, useEffect } from 'react';
import { User, UserRole, Notification } from '../types';
import { useAuthStore } from '../store/authStore';
import { ARRIVAL_EVENT } from '../lib/api';
import { showToast } from '../lib/swal';

interface TopbarProps {
  user: User;
  onMenuClick?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ user, onMenuClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { updateActivity } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotes = () => {
    const saved = localStorage.getItem('db_global_notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      const initial = [
        {
          id: '1',
          title: 'Monthly Bill Generated',
          message: 'March 2025 invoices are ready for distribution.',
          type: 'INFO',
          read: false,
          timestamp: '10m ago'
        }
      ];
      setNotifications(initial as any);
      localStorage.setItem('db_global_notifications', JSON.stringify(initial));
    }
  };

  useEffect(() => {
    fetchNotes();
    
    // Listen for real-time Arrival broadcasts
    const handleArrival = (e: any) => {
        const { busPlate } = e.detail;
        showToast(`Bus ${busPlate} has Reached School!`, 'success');
        fetchNotes(); // Refresh list
    };

    window.addEventListener(ARRIVAL_EVENT, handleArrival);
    return () => window.removeEventListener(ARRIVAL_EVENT, handleArrival);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleGlobalClick = () => updateActivity();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [updateActivity]);

  const getDisplayName = () => {
    if (!user) return 'User';
    return user.fullName || user.full_name || user.email?.split('@')[0] || 'User';
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-10 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <button onClick={onMenuClick} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden transition-colors">
          <i className="fas fa-bars"></i>
        </button>
        <div className="hidden md:flex items-center gap-3">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Fleet Link • Online</span>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all relative"
          >
            <i className="far fa-bell text-xl"></i>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-4 w-96 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Alert Center</span>
                <button onClick={() => {
                  const readAll = notifications.map(n => ({...n, read: true}));
                  setNotifications(readAll);
                  localStorage.setItem('db_global_notifications', JSON.stringify(readAll));
                }} className="text-[8px] font-black text-primary uppercase tracking-widest">Mark All Read</button>
              </div>
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide divide-y divide-slate-50">
                {notifications.length > 0 ? notifications.map((n) => (
                  <div key={n.id} className={`p-5 hover:bg-slate-50 transition-all cursor-pointer group ${!n.read ? 'bg-blue-50/20' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs mt-1 ${
                        n.type === 'SUCCESS' ? 'bg-green-100 text-green-600' : 
                        n.type === 'WARNING' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <i className={`fas ${n.type === 'SUCCESS' ? 'fa-check' : n.type === 'WARNING' ? 'fa-exclamation-triangle' : 'fa-info-circle'}`}></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-slate-800 group-hover:text-primary transition-colors">{n.title}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{n.message}</p>
                        <p className="text-[9px] text-slate-300 font-bold uppercase mt-2 tracking-widest">{n.timestamp}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No Alerts</div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-xs font-black text-slate-800 leading-none">{getDisplayName()}</p>
            <p className="text-[9px] text-primary font-black uppercase tracking-widest mt-1.5">{user?.role?.replace('_', ' ')}</p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-xl hover:rotate-6 transition-transform cursor-pointer">
            {getDisplayName().charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
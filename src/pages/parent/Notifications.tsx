
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { Bell, Info, AlertTriangle, CheckCircle2, Clock, Trash2, Settings, Mail, MessageSquare } from 'lucide-react';
import { apiPost } from '../../lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';
  created_at: string;
  is_read: boolean;
}

const Notifications: React.FC<{ user: User }> = ({ user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await apiPost('notifications', user.id, {}, 'GET');
        setNotifications(data || []);
      } catch (err) {
        console.error(err);
        // Mock data for demo
        setNotifications([
          { id: '1', title: 'Fee Payment Successful', message: 'Payment for May 2024 has been processed successfully.', type: 'SUCCESS', created_at: new Date().toISOString(), is_read: false },
          { id: '2', title: 'Route Change Alert', message: 'Bus Route KNG-01 will follow a temporary detour today.', type: 'WARNING', created_at: new Date(Date.now() - 86400000).toISOString(), is_read: true },
          { id: '3', title: 'Holiday Notice', message: 'School will remain closed on Friday for local festival.', type: 'INFO', created_at: new Date(Date.now() - 172800000).toISOString(), is_read: true },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await apiPost('notifications/read', id, {}, 'POST');
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiPost('notifications', id, {}, 'DELETE');
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'WARNING': return <AlertTriangle className="text-amber-500" size={20} />;
      case 'ALERT': return <Bell className="text-red-500" size={20} />;
      default: return <Info className="text-primary" size={20} />;
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.is_read);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Alert Center</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">System Notifications & Updates</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-bold text-sm border border-slate-100 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Settings size={18} />
            Preferences
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Filter Alerts</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setFilter('all')}
                className={`w-full px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left transition-all ${
                  filter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                All Notifications
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={`w-full px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left transition-all ${
                  filter === 'unread' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Unread Only
              </button>
            </div>
          </div>

          <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">Email Admin</span>
              </button>
              <button className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center">
                  <MessageSquare size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">Support Chat</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {filteredNotifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`bg-white rounded-[2.5rem] p-8 shadow-premium border transition-all group ${
                notif.is_read ? 'border-slate-100 opacity-80' : 'border-primary/20 shadow-primary/5'
              }`}
            >
              <div className="flex items-start gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  notif.is_read ? 'bg-slate-50 text-slate-300' : 'bg-primary/10'
                }`}>
                  {getTypeIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-lg font-black uppercase tracking-tight ${notif.is_read ? 'text-slate-500' : 'text-slate-900'}`}>
                      {notif.title}
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <button 
                        onClick={() => deleteNotification(notif.id)}
                        className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm font-medium leading-relaxed ${notif.is_read ? 'text-slate-400' : 'text-slate-600'}`}>
                    {notif.message}
                  </p>
                  {!notif.is_read && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="mt-6 text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:underline"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && !loading && (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-premium">
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-6">
                <Bell size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">All Caught Up</h3>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">No new notifications at this time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

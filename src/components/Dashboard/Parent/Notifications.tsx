import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CreditCard, 
  Bus as BusIcon, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Loader2,
  MoreVertical,
  Trash2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

interface NotificationsProps {
  isDarkMode: boolean;
}

export default function Notifications({ isDarkMode }: NotificationsProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/parent/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setNotifications(data);
      } else {
        toast.error(data.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard size={20} className="text-emerald-500" />;
      case 'bus_arrival': return <BusIcon size={20} className="text-amber-500" />;
      case 'alert': return <AlertCircle size={20} className="text-red-500" />;
      default: return <Info size={20} className="text-indigo-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-emerald-50 dark:bg-emerald-900/10';
      case 'bus_arrival': return 'bg-amber-50 dark:bg-amber-900/10';
      case 'alert': return 'bg-red-50 dark:bg-red-900/10';
      default: return 'bg-indigo-50 dark:bg-indigo-900/10';
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className={`p-8 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-600/10">
            <Bell size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Notifications</h3>
            <p className="text-zinc-500 text-sm">Stay updated with transport alerts and fee reminders</p>
          </div>
        </div>

        <button className="text-xs font-bold text-indigo-600 hover:underline">Mark all as read</button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 space-y-4">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto animate-spin text-indigo-500 mb-4" size={48} />
            <p className="text-zinc-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[40px]">
            <Bell size={64} className="mx-auto text-zinc-200 mb-4" />
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white">All caught up!</h4>
            <p className="text-zinc-500 max-w-xs mx-auto mt-2">You don't have any new notifications at the moment.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              className={`p-6 rounded-[32px] border flex items-start gap-6 group transition-all hover:shadow-lg ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'} ${!notif.is_read ? 'border-l-4 border-l-indigo-600' : ''}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getBgColor(notif.type)}`}>
                {getIcon(notif.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-bold truncate ${!notif.is_read ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1 shrink-0 ml-4">
                    <Clock size={12} />
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">{notif.message}</p>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, Notification } from '../types';
import { useAuthStore } from '../store/authStore';
import { ARRIVAL_EVENT, PAYMENT_EVENT } from '../lib/telemetry';
import { showToast } from '../lib/swal';
import { supabase } from '../lib/supabase';

interface TopbarProps {
  user: User;
  onMenuClick?: () => void;
  onOpenNotifications?: (notificationId?: string) => void;
  onNavigateTab?: (tab: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({ user, onMenuClick, onOpenNotifications, onNavigateTab }) => {
  const { setUser } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const mapNotification = (record: any): Notification => ({
    id: String(record.id),
    user_id: String(record.user_id),
    title: record.title,
    message: record.message,
    type: record.type,
    is_read: !!record.is_read,
    read: !!record.is_read,
    created_at: record.created_at,
    timestamp: record.created_at,
  });

  const fetchNotes = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Topbar notifications fetch failed:', error);
      return;
    }

    setNotifications((data || []).map(mapNotification));
  };

  useEffect(() => {
    fetchNotes();

    const channel = supabase
      .channel(`topbar-notifications-${user?.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload: any) => {
          if (payload?.eventType === 'INSERT' && payload.new) {
            const inserted = mapNotification(payload.new);
            setNotifications((prev) => [inserted, ...prev].slice(0, 30));
            showToast(inserted.title || 'New notification', inserted.type === 'WARNING' ? 'warning' : 'info');
          } else if (payload?.eventType === 'UPDATE' && payload.new) {
            const updated = mapNotification(payload.new);
            setNotifications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
          } else if (payload?.eventType === 'DELETE' && payload.old?.id) {
            setNotifications((prev) => prev.filter((item) => item.id !== String(payload.old.id)));
          }
        }
      )
      .subscribe();
    
    // Listen for real-time Arrival broadcasts
    const handleArrival = (e: any) => {
        const { busPlate } = e.detail;
        showToast(`Bus ${busPlate} has Reached School!`, 'success');
    };

    window.addEventListener(ARRIVAL_EVENT, handleArrival);
    
    const handlePayment = (e: any) => {
        const { studentName, amount } = e.detail;
        showToast(`Fee Received: ₹${Number(amount || 0).toLocaleString()} for ${studentName}`, 'success');
    };
    window.addEventListener(PAYMENT_EVENT, handlePayment);

    const profileChannel = supabase
      .channel(`topbar-profile-${user?.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user?.id}`,
        },
        (payload: any) => {
          if (!payload?.new) return;
          setUser({
            ...user,
            full_name: payload.new.full_name,
            fullName: payload.new.full_name,
            phone_number: payload.new.phone_number,
            phoneNumber: payload.new.phone_number,
            location: payload.new.location,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(profileChannel);
        window.removeEventListener(ARRIVAL_EVENT, handleArrival);
        window.removeEventListener(PAYMENT_EVENT, handlePayment);
    };
  }, [user?.id, user?.full_name, user?.fullName, user?.phone_number, user?.phoneNumber, user?.location, setUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpenNotification = async (notification: Notification) => {
    if (!notification.read) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id as any);

      if (!error) {
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true, is_read: true } : n));
      }
    }

    setShowNotifications(false);
    onOpenNotifications?.(String(notification.id));
  };

  const handleNavigate = (tab: string) => {
    setShowUserMenu(false);
    onNavigateTab?.(tab);
  };

  const getDisplayName = () => {
    if (!user) return 'User';
    return user.fullName || user.full_name || user.email?.split('@')[0] || 'User';
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-10 flex items-center justify-between sticky top-0 z-[1001]">
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
            <div ref={modalRef} className="absolute right-0 mt-4 w-96 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Alert Center</span>
                <button onClick={async () => {
                  const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
                  if (unreadIds.length === 0) return;
                  const { error } = await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .in('id', unreadIds as any);

                  if (!error) {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true, is_read: true })));
                  }
                }} className="text-[8px] font-black text-primary uppercase tracking-widest">Mark All Read</button>
              </div>
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide divide-y divide-slate-50">
                {notifications.length > 0 ? notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleOpenNotification(n)}
                    className={`p-5 hover:bg-slate-50 transition-all cursor-pointer group ${!n.read ? 'bg-blue-50/20' : ''}`}
                  >
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
                        <p className="text-[9px] text-slate-300 font-bold uppercase mt-2 tracking-widest">{n.timestamp ? new Date(n.timestamp).toLocaleString('en-IN') : ''}</p>
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
        
        <div ref={userMenuRef} className="flex items-center gap-3 relative">
          <div className="text-right hidden md:block">
            <p className="text-xs font-black text-slate-800 leading-none">{getDisplayName()}</p>
            <p className="text-[9px] text-primary font-black uppercase tracking-widest mt-1.5">
              {user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN ? 'Bus admin' : user?.role?.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-xl hover:rotate-6 transition-transform cursor-pointer"
          >
            {getDisplayName().charAt(0)}
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-14 md:top-16 w-56 bg-white rounded-2xl border border-slate-100 shadow-2xl p-2 z-50">
              {user?.role === UserRole.PARENT && (
                <button
                  onClick={() => handleNavigate('Profile')}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-700"
                >
                  My Profile
                </button>
              )}
              <button
                onClick={() => handleNavigate('Notifications')}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-700"
              >
                Notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
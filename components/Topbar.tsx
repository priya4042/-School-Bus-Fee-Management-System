import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, Notification } from '../types';
import { useAuthStore } from '../store/authStore';
import { ARRIVAL_EVENT, PAYMENT_EVENT } from '../lib/telemetry';
import { showToast } from '../lib/swal';
import { supabase } from '../lib/supabase';
import { formatNotificationMessage } from '../utils/notificationMessage';
import { useLanguage } from '../lib/i18n';
import { useWindowSize } from '../hooks/useWindowSize';
import FamilySwitcher from './FamilySwitcher';

interface TopbarProps {
  user: User;
  onMenuClick?: () => void;
  onOpenNotifications?: (notificationId?: string) => void;
  onNavigateTab?: (tab: string) => void;
  onLogout?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ user, onMenuClick, onOpenNotifications, onNavigateTab, onLogout }) => {
  const { setUser } = useAuthStore();
  const { lang, setLang, t } = useLanguage();
  const { isMobile, isTablet } = useWindowSize();
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
      .not('title', 'ilike', '%[CHAT]%')
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
            const isChatMessage = String(inserted.title || '').includes('[CHAT]');
            // Don't list chat messages in the alert dropdown — they live inside the SupportChat panel
            if (!isChatMessage) {
              setNotifications((prev) => [inserted, ...prev].slice(0, 30));
              showToast(inserted.title || 'New notification', inserted.type === 'WARNING' ? 'warning' : 'info');
            }
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
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-10 flex items-center justify-between sticky top-0 z-[1001]" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)', paddingBottom: '0.5rem', minHeight: 'calc(env(safe-area-inset-top, 0px) + 3.5rem)' }}>
      <div className="flex items-center gap-6">
        {/* Show menu button only on mobile/tablet */}
        {(isMobile || isTablet) && (
          <button onClick={onMenuClick} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <i className="fas fa-bars"></i>
          </button>
        )}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('global_fleet')} • {t('online')}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        {user?.role === UserRole.PARENT && user?.id && (
          <FamilySwitcher parentId={String(user.id)} />
        )}

        <div ref={modalRef} className="relative">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className={`p-3 rounded-2xl transition-all relative ${showNotifications ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-primary hover:bg-primary/5'}`}
            aria-expanded={showNotifications}
            aria-label="Toggle notifications"
          >
            <i className="far fa-bell text-xl"></i>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="fixed top-[calc(env(safe-area-inset-top,0px)+4rem)] left-3 right-3 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-80 sm:max-w-none bg-white border border-slate-100 rounded-2xl shadow-2xl z-[1100] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden"
            >
              <div className="px-3 py-2.5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 gap-2">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest truncate">{t('alert_center')}</span>
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
                }} className="text-[8px] font-black text-primary uppercase tracking-widest hover:underline flex-shrink-0">{t('mark_all_read')}</button>
              </div>
              <div className="max-h-[55vh] sm:max-h-[320px] overflow-y-auto scrollbar-hide divide-y divide-slate-50">
                {notifications.length > 0 ? notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleOpenNotification(n)}
                    className={`px-3 py-2.5 hover:bg-slate-50 transition-all cursor-pointer group ${!n.read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] flex-shrink-0 ${
                        n.type === 'SUCCESS' ? 'bg-green-100 text-green-600' :
                        n.type === 'WARNING' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <i className={`fas ${n.type === 'SUCCESS' ? 'fa-check' : n.type === 'WARNING' ? 'fa-exclamation-triangle' : 'fa-info-circle'}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-slate-800 group-hover:text-primary transition-colors truncate">{n.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-snug line-clamp-2">{formatNotificationMessage(n.message)}</p>
                        <p className="text-[8px] text-slate-300 font-bold uppercase mt-1 tracking-widest truncate">
                          {n.timestamp ? new Date(n.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>}
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">{t('no_alerts')}</div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
        
        <div ref={userMenuRef} className="flex items-center gap-2 md:gap-3 relative">
          <div className="text-right">
            <p className="text-[10px] md:text-xs font-black text-slate-800 leading-none truncate max-w-[80px] md:max-w-none">{getDisplayName().split(' ')[0]}</p>
            <p className="text-[7px] md:text-[9px] text-primary font-black uppercase tracking-widest mt-0.5 md:mt-1.5">
              {user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN ? 'Admin' : 'Parent'}
            </p>
          </div>
          <button
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-sm shadow-xl hover:scale-105 transition-transform cursor-pointer overflow-hidden border-2 border-slate-200"
          >
            {(user?.avatar_url || (user?.preferences as any)?.avatar_url) ? (
              <img
                src={user.avatar_url || (user.preferences as any)?.avatar_url}
                alt={getDisplayName()}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center">
                {getDisplayName().charAt(0)}
              </div>
            )}
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-14 md:top-16 w-56 bg-white rounded-2xl border border-slate-100 shadow-2xl p-2 z-50 max-h-[80vh] overflow-y-auto">
              {user?.role === UserRole.PARENT && (
                <button
                  onClick={() => handleNavigate('Profile')}
                  className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center gap-3"
                >
                  <i className="fas fa-user w-4 text-primary text-xs"></i>
                  {t('profile')}
                </button>
              )}
              <button
                onClick={() => handleNavigate('Settings')}
                className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center gap-3"
              >
                <i className="fas fa-cog w-4 text-primary text-xs"></i>
                {t('settings')}
              </button>
              <div className="my-1 border-t border-slate-100"></div>
              <div className="px-4 py-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('language')}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setLang('en'); setShowUserMenu(false); }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      lang === 'en'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    🇬🇧 EN
                  </button>
                  <button
                    onClick={() => { setLang('hi'); setShowUserMenu(false); }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      lang === 'hi'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    🇮🇳 हिं
                  </button>
                </div>
              </div>
              {onLogout && (
                <>
                  <div className="my-1 border-t border-slate-100"></div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-50 text-[11px] font-bold text-red-600 flex items-center gap-3"
                  >
                    <i className="fas fa-sign-out-alt w-4 text-red-600 text-xs"></i>
                    {t('logout')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
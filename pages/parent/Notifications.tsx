import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import { Bell, Info, AlertTriangle, CheckCircle2, Clock, Trash2, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/swal';
import { formatNotificationMessage } from '../../utils/notificationMessage';
import { useLanguage } from '../../lib/i18n';
import { SkeletonList } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { CollapsibleList } from '../../components/ui/CollapsibleList';
import { parseFeeReminderTag, stripFeeReminderTags } from '../../services/feeReminders';
import PullToRefresh from '../../components/PullToRefresh';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER' | 'PAYMENT_SUCCESS' | 'FEE_DUE' | 'BUS_UPDATE';
  created_at: string;
  is_read: boolean;
}

const Notifications: React.FC<{ user: User; focusNotificationId?: string; onFocusHandled?: () => void; onNavigateTab?: (tab: string) => void }> = ({ user, focusNotificationId, onFocusHandled, onNavigateTab }) => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'payment' | 'bus' | 'alert'>('all');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) console.error('Failed to load notifications:', error);
    setNotifications(data || []);
    if (showSpinner) setLoading(false);
  }, [user.id]);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel(`parent-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload?.eventType === 'INSERT' && payload.new) {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
            showToast(payload.new.title || 'New notification', payload.new.type === 'WARNING' ? 'warning' : 'info');
          } else if (payload?.eventType === 'UPDATE' && payload.new) {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
            );
          } else if (payload?.eventType === 'DELETE' && payload.old?.id) {
            setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  useEffect(() => {
    if (!focusNotificationId || loading || notifications.length === 0) return;

    setFilter('all');
    const el = document.getElementById(`notif-${focusNotificationId}`);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedId(focusNotificationId);
    onFocusHandled?.();
    const timer = setTimeout(() => setHighlightedId(null), 2200);
    return () => clearTimeout(timer);
  }, [focusNotificationId, loading, notifications, onFocusHandled]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (!error) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    }
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);
    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showToast('All notifications marked as read', 'success');
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (!error) setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT_SUCCESS': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'FEE_DUE': return <AlertTriangle className="text-amber-500" size={20} />;
      case 'BUS_UPDATE': return <Bell className="text-primary" size={20} />;
      case 'SUCCESS': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'WARNING': return <AlertTriangle className="text-amber-500" size={20} />;
      case 'DANGER': return <Bell className="text-red-500" size={20} />;
      default: return <Info className="text-primary" size={20} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const isPayment = (n: any) => n.type === 'PAYMENT_SUCCESS' || n.type === 'FEE_DUE' || /payment|fee|paid/i.test(String(n.title || ''));
  const isBus = (n: any) => n.type === 'BUS_UPDATE' || /bus|route|driver|arriv/i.test(String(n.title || ''));
  const isAlert = (n: any) => n.type === 'WARNING' || n.type === 'DANGER' || /alert|emergency|delay/i.test(String(n.title || ''));
  const filteredNotifications =
    filter === 'all'
      ? notifications
      : filter === 'unread'
        ? notifications.filter((n) => !n.is_read)
        : filter === 'payment'
          ? notifications.filter(isPayment)
          : filter === 'bus'
            ? notifications.filter(isBus)
            : notifications.filter(isAlert);

  const FILTER_OPTIONS: { id: typeof filter; label: string; icon: string }[] = [
    { id: 'all', label: t('filter_all'), icon: 'fa-inbox' },
    { id: 'unread', label: `${t('filter_unread')}${unreadCount > 0 ? ` (${unreadCount})` : ''}`, icon: 'fa-circle' },
    { id: 'payment', label: t('filter_payment'), icon: 'fa-credit-card' },
    { id: 'bus', label: t('filter_bus'), icon: 'fa-bus' },
    { id: 'alert', label: t('filter_alerts'), icon: 'fa-exclamation-triangle' },
  ];

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
        <div>
          <h1 className="text-xl md:text-4xl font-black text-slate-900 tracking-tight">{t('alert_center_title')}</h1>
          <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mt-1">
            {t('system_notifications')}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="bg-primary/10 text-primary px-4 md:px-6 py-3 md:py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 self-start md:self-auto"
          >
            <i className="fas fa-check-double"></i>
            <span>{t('mark_all')}</span>
            <span className="bg-primary text-white text-[9px] px-2 py-0.5 rounded-full animate-pulse">{unreadCount}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
        <div className="lg:col-span-1 space-y-4 lg:space-y-6">
          <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-3 md:p-6 shadow-sm border border-slate-100">
            <div className="flex lg:flex-col gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFilter(opt.id)}
                  className={`flex-shrink-0 w-auto lg:w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest text-left transition-all flex items-center gap-2 active:scale-95 ${
                    filter === opt.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <i className={`fas ${opt.icon} text-[11px] flex-shrink-0`}></i>
                  <span className="whitespace-nowrap">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <a
                href="mailto:support@school.com"
                className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
              >
                <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">Email Admin</span>
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {loading && <SkeletonList count={4} />}

          {!loading && (
          <PullToRefresh onRefresh={() => fetchNotifications(false)}>
          <CollapsibleList initialCount={5} showMoreLabel="View" className="space-y-3 md:space-y-4">
          {filteredNotifications.map((notif, idx) => {
            const reminder = parseFeeReminderTag(notif.message);
            const cleanMessage = reminder.isFeeReminder
              ? stripFeeReminderTags(notif.message)
              : formatNotificationMessage(notif.message);
            return (
            <div
              key={notif.id}
              id={`notif-${notif.id}`}
              style={{ animationDelay: `${Math.min(idx, 8) * 60}ms` }}
              className={`bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-sm border transition-all group hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${
                highlightedId === notif.id
                  ? 'border-primary ring-2 ring-primary/20 scale-[1.01]'
                  : notif.is_read
                    ? 'border-slate-100 opacity-80'
                    : 'border-primary/30 shadow-md'
              }`}
            >
              <div className="flex items-start gap-6">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0 ${
                    notif.is_read ? 'bg-slate-50' : 'bg-primary/10'
                  }`}
                >
                  {getTypeIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2 gap-4">
                    <h4
                      className={`text-base font-black uppercase tracking-tight ${
                        notif.is_read ? 'text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">
                          {new Date(notif.created_at).toLocaleDateString('en-IN')}
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
                    {cleanMessage}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {reminder.isFeeReminder && (
                      <button
                        onClick={() => {
                          markAsRead(notif.id);
                          onNavigateTab?.('Fees');
                        }}
                        className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-primary text-white shadow-md shadow-primary/20 hover:bg-blue-800 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <i className="fas fa-credit-card text-[10px]"></i>
                        Pay Now {reminder.amount ? `— ₹${reminder.amount.toLocaleString('en-IN')}` : ''}
                      </button>
                    )}
                    {!notif.is_read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:underline"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            );
          })}
          </CollapsibleList>
          </PullToRefresh>
          )}

          {!loading && filteredNotifications.length === 0 && (
            <EmptyState
              icon="fa-bell"
              tone={filter === 'unread' ? 'success' : 'neutral'}
              title={filter === 'unread' ? t('all_caught_up') : filter === 'all' ? t('no_notifications_yet') : `No ${filter} notifications`}
              message={filter === 'unread' ? t('you_have_read_everything') : t('new_alerts_realtime')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

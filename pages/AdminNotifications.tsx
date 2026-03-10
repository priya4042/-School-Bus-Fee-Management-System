import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { showToast, showAlert, showLoading, closeSwal } from '../lib/swal';

const TYPE_MAP: Record<string, string> = {
  emergency: 'DANGER',
  announcement: 'INFO',
  reminder: 'WARNING',
  update: 'INFO',
};

const TITLE_MAP: Record<string, string> = {
  emergency: 'Emergency Alert',
  announcement: 'Announcement',
  reminder: 'Fee Reminder',
  update: 'Route Update',
};

const AdminNotifications: React.FC = () => {
  const [msgType, setMsgType] = useState('announcement');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [loading, setLoading] = useState(false);
  const [recentBroadcasts, setRecentBroadcasts] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [notifRes, routesRes] = await Promise.all([
        supabase
          .from('notifications')
          .select('title, type, created_at')
          .order('created_at', { ascending: false })
          .limit(30),
        supabase.from('routes').select('id, route_name'),
      ]);

      // Deduplicate — same second = same broadcast
      const seen = new Set<string>();
      const broadcasts = (notifRes.data || []).filter(n => {
        const key = n.created_at.substring(0, 19);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 5);

      setRecentBroadcasts(broadcasts);
      setRoutes(routesRes.data || []);
    };
    fetchData();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showLoading('Broadcasting to parents...');
    try {
      let parentIds: string[] = [];

      if (target === 'all' || target === 'parents') {
        const { data } = await supabase.from('profiles').select('id').eq('role', 'PARENT');
        parentIds = (data || []).map(p => p.id);
      } else if (target.startsWith('route-')) {
        const routeId = target.replace('route-', '');
        const { data: students } = await supabase
          .from('students')
          .select('parent_id')
          .eq('route_id', routeId)
          .not('parent_id', 'is', null);
        const uniqueParentIds = [...new Set((students || []).map(s => s.parent_id).filter(Boolean))];
        parentIds = uniqueParentIds;
      }

      if (parentIds.length === 0) {
        closeSwal();
        showAlert('No Recipients', 'No parents found for the selected target.', 'warning');
        return;
      }

      const notifications = parentIds.map(userId => ({
        user_id: userId,
        title: TITLE_MAP[msgType] || 'Notification',
        message,
        type: TYPE_MAP[msgType] || 'INFO',
        is_read: false,
      }));

      const { error } = await supabase.from('notifications').insert(notifications);
      if (error) throw error;

      closeSwal();
      showToast(`Broadcast sent to ${parentIds.length} parents successfully.`, 'success');
      setMessage('');

      // Refresh recent broadcasts
      const { data: fresh } = await supabase
        .from('notifications')
        .select('title, type, created_at')
        .order('created_at', { ascending: false })
        .limit(30);
      const seen = new Set<string>();
      const updated = (fresh || []).filter(n => {
        const key = n.created_at.substring(0, 19);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 5);
      setRecentBroadcasts(updated);
    } catch (err: any) {
      closeSwal();
      showAlert('Broadcast Failed', err.message || 'Failed to send broadcast. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary bg-white font-bold text-slate-700 transition-all cursor-pointer";

  const typeColor: Record<string, string> = {
    INFO: 'text-primary',
    WARNING: 'text-amber-500',
    DANGER: 'text-red-500',
    SUCCESS: 'text-emerald-500',
  };

  return (
    <div className="max-w-5xl space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Notification Center</h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Broadcast to Parents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleBroadcast} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                  <i className="fas fa-bullhorn"></i>
                </div>
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">New Broadcast</h3>
              </div>
            </div>

            <div className="p-8 md:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 ml-1">Message Type</label>
                  <select value={msgType} onChange={(e) => setMsgType(e.target.value)} className={selectClass}>
                    <option value="emergency">🚨 Emergency Alert</option>
                    <option value="announcement">📢 Announcement</option>
                    <option value="reminder">⏰ Fee Reminder</option>
                    <option value="update">ℹ️ Route Update</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 ml-1">Target Recipients</label>
                  <select value={target} onChange={(e) => setTarget(e.target.value)} className={selectClass}>
                    <option value="all">All Parents</option>
                    <option value="parents">Parents Only</option>
                    {routes.map(r => (
                      <option key={r.id} value={`route-${r.id}`}>{r.route_name} Parents</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-primary uppercase tracking-widest mb-3 ml-1">Message</label>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-6 py-6 rounded-[2rem] bg-primary border border-primary/20 outline-none focus:ring-4 focus:ring-primary/20 focus:border-white/40 font-bold text-white placeholder-white/50 transition-all resize-none shadow-inner leading-relaxed"
                  required
                ></textarea>

                <div className="flex items-center gap-3 mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <i className={`fas ${msgType === 'emergency' ? 'fa-exclamation-triangle text-danger' : 'fa-info-circle text-primary'}`}></i>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {msgType === 'emergency' ? 'Priority: Critical — will appear as urgent for all recipients.' : 'Will appear as an in-app notification for all selected parents.'}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-white font-black uppercase text-[11px] tracking-[0.2em] px-10 py-5 rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95"
                >
                  {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                  {loading ? 'Sending...' : 'Send Broadcast'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-8 flex items-center gap-3">
              <i className="fas fa-history text-primary"></i>
              Recent Broadcasts
            </h4>
            {recentBroadcasts.length === 0 ? (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-6">No broadcasts yet</p>
            ) : (
              <div className="space-y-6">
                {recentBroadcasts.map((b, i) => (
                  <div key={i} className="pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <p className="text-xs font-black text-slate-800 tracking-tight leading-snug">{b.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(b.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-slate-200">•</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${typeColor[b.type] || 'text-primary'}`}>{b.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { showToast, showAlert, showLoading, closeSwal } from '../lib/swal';
import { useReceipts } from '../hooks/useReceipts';
import { formatNotificationMessage } from '../utils/notificationMessage';
import AuditLogs from './AuditLogs';

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

interface NameChangeRequest {
  id: string;
  parentId: string;
  currentName: string;
  requestedName: string;
  parentEmail: string;
  createdAt: string;
}

interface NameChangeReviewHistory {
  id: string;
  parentId: string;
  currentName: string;
  requestedName: string;
  parentEmail: string;
  action: 'APPROVED' | 'REJECTED';
  reviewedAt: string;
}

const extractMeta = (message: string, key: string) => {
  const match = message?.match(new RegExp(`\\[${key}:([^\\]]+)\\]`));
  return match?.[1]?.trim() || '';
};

const parseNameChangeRequest = (row: any): NameChangeRequest | null => {
  const message = String(row?.message || '');
  if (!message.includes('[PROFILE_UPDATE_REQUEST]')) return null;

  const parentId = extractMeta(message, 'PARENT_ID');
  const requestedName = extractMeta(message, 'REQUESTED_NAME');
  if (!parentId || !requestedName) return null;

  return {
    id: String(row.id),
    parentId,
    currentName: extractMeta(message, 'CURRENT_NAME') || 'N/A',
    requestedName,
    parentEmail: extractMeta(message, 'PARENT_EMAIL') || 'N/A',
    createdAt: String(row.created_at || ''),
  };
};

const parseNameChangeReviewHistory = (row: any): NameChangeReviewHistory | null => {
  const message = String(row?.message || '');
  if (!message.includes('[PROFILE_UPDATE_REVIEW]')) return null;

  const parentId = extractMeta(message, 'PARENT_ID');
  const requestedName = extractMeta(message, 'REQUESTED_NAME');
  const action = extractMeta(message, 'ACTION').toUpperCase();

  if (!parentId || !requestedName || (action !== 'APPROVED' && action !== 'REJECTED')) {
    return null;
  }

  return {
    id: String(row.id),
    parentId,
    currentName: extractMeta(message, 'CURRENT_NAME') || 'N/A',
    requestedName,
    parentEmail: extractMeta(message, 'PARENT_EMAIL') || 'N/A',
    action: action as 'APPROVED' | 'REJECTED',
    reviewedAt: String(row.created_at || ''),
  };
};

const pickStudentName = (studentsRelation: any): string | undefined => {
  if (!studentsRelation) return undefined;
  if (Array.isArray(studentsRelation)) {
    return studentsRelation[0]?.full_name || undefined;
  }
  return studentsRelation.full_name || undefined;
};

const AdminNotifications: React.FC<{ focusNotificationId?: string; onFocusHandled?: () => void }> = ({ focusNotificationId, onFocusHandled }) => {
  const [view, setView] = useState<'notifications' | 'audit'>('notifications');
  const [msgType, setMsgType] = useState('announcement');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [loading, setLoading] = useState(false);
  const [recentBroadcasts, setRecentBroadcasts] = useState<any[]>([]);
  const [paymentConfirmations, setPaymentConfirmations] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string>('');
  const [nameChangeRequests, setNameChangeRequests] = useState<NameChangeRequest[]>([]);
  const [nameChangeHistory, setNameChangeHistory] = useState<NameChangeReviewHistory[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [paymentMetaByDueId, setPaymentMetaByDueId] = useState<Record<string, { paidAt?: string; studentName?: string; month?: number; year?: number; amount?: number }>>({});
  const { downloadReceipt, downloading } = useReceipts();

  useEffect(() => {
    const loadCurrentAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentAdminId(String(data?.user?.id || ''));
    };
    loadCurrentAdmin();
  }, []);

  const extractReceiptMeta = (message: string) => {
    const dueMatch = message?.match(/\[DUE_ID:([^\]]+)\]/);
    const txnMatch = message?.match(/\[TXN:([^\]]+)\]/);
    return {
      dueId: dueMatch?.[1] || null,
      txnId: txnMatch?.[1] || null,
    };
  };

  const fetchData = async () => {
    if (!currentAdminId) return;

    const [notifRes, routesRes] = await Promise.all([
      supabase
        .from('notifications')
        .select('id, title, message, type, is_read, created_at')
        .eq('user_id', currentAdminId)
        .order('created_at', { ascending: false })
        .limit(120),
      supabase.from('routes').select('id, route_name'),
    ]);

      // Deduplicate — same second = same broadcast
      const seen = new Set<string>();
      const source = notifRes.data || [];

      const broadcasts = source.filter(n => {
        const key = n.created_at.substring(0, 19);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 5);

    const confirmations = source
      .filter(n => n.type === 'PAYMENT_SUCCESS' || n.title?.toLowerCase().includes('payment'))
      .slice(0, 10);

    const dueIds = confirmations
      .map((n) => extractReceiptMeta(String(n.message || '')).dueId)
      .filter(Boolean) as string[];

    const paymentMetaMap: Record<string, { paidAt?: string; studentName?: string; month?: number; year?: number; amount?: number }> = {};
    if (dueIds.length > 0) {
      const uniqueDueIds = [...new Set(dueIds)];
      const { data: dueRows } = await supabase
        .from('monthly_dues')
        .select('id, paid_at, month, year, total_due, amount, students(full_name)')
        .in('id', uniqueDueIds as any);

      (dueRows || []).forEach((row: any) => {
        paymentMetaMap[String(row.id)] = {
          paidAt: row.paid_at || undefined,
          studentName: pickStudentName(row?.students),
          month: row.month,
          year: row.year,
          amount: Number(row.total_due || row.amount || 0),
        };
      });
    }

      const profileRequests = source
        .filter((n) => n.is_read === false)
        .map(parseNameChangeRequest)
        .filter(Boolean)
        .slice(0, 20) as NameChangeRequest[];

      const profileHistory = source
        .map(parseNameChangeReviewHistory)
        .filter(Boolean)
        .slice(0, 20) as NameChangeReviewHistory[];

    setRecentBroadcasts(broadcasts);
    setPaymentConfirmations(confirmations);
    setNameChangeRequests(profileRequests);
    setNameChangeHistory(profileHistory);
    setRoutes(routesRes.data || []);
    setPaymentMetaByDueId(paymentMetaMap);
  };

  useEffect(() => {
    fetchData();
  }, [currentAdminId]);

  useEffect(() => {
    if (!focusNotificationId) return;

    const el = document.getElementById(`admin-notif-${focusNotificationId}`);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedId(focusNotificationId);
    onFocusHandled?.();
    const timer = setTimeout(() => setHighlightedId(null), 2200);
    return () => clearTimeout(timer);
  }, [focusNotificationId, paymentConfirmations, recentBroadcasts, onFocusHandled]);

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
        .select('id, title, message, type, is_read, created_at')
        .eq('user_id', currentAdminId)
        .order('created_at', { ascending: false })
        .limit(120);
      const seen = new Set<string>();
      const allFresh = fresh || [];
      const updated = allFresh.filter(n => {
        const key = n.created_at.substring(0, 19);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 5);
      const confirmations = allFresh
        .filter(n => n.type === 'PAYMENT_SUCCESS' || n.title?.toLowerCase().includes('payment'))
        .slice(0, 10);
      const profileRequests = allFresh
        .filter((n) => n.is_read === false)
        .map(parseNameChangeRequest)
        .filter(Boolean)
        .slice(0, 20) as NameChangeRequest[];
      const profileHistory = allFresh
        .map(parseNameChangeReviewHistory)
        .filter(Boolean)
        .slice(0, 20) as NameChangeReviewHistory[];
      setRecentBroadcasts(updated);
      setPaymentConfirmations(confirmations);
      setNameChangeRequests(profileRequests);
      setNameChangeHistory(profileHistory);
      await fetchData();
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

  const handlePaymentDetails = async (dueId: string | null, txnId: string | null, fallbackMessage: string) => {
    if (!dueId) {
      showAlert('Payment Details', formatNotificationMessage(fallbackMessage), 'info');
      return;
    }

    const { data: dueRow } = await supabase
      .from('monthly_dues')
      .select('id, paid_at, month, year, total_due, amount, payment_method, transaction_id, students(full_name)')
      .eq('id', dueId)
      .maybeSingle();

    if (!dueRow) {
      showAlert('Payment Details', formatNotificationMessage(fallbackMessage), 'info');
      return;
    }

    const paidAt = dueRow.paid_at ? new Date(dueRow.paid_at).toLocaleString('en-IN') : 'Not available';
    const amount = Number(dueRow.total_due || dueRow.amount || 0).toLocaleString('en-IN');
    const details = [
      `Student: ${pickStudentName(dueRow?.students) || 'N/A'}`,
      `Month: ${dueRow.month}/${dueRow.year}`,
      `Amount: ₹${amount}`,
      `Paid At: ${paidAt}`,
      `Transaction: ${txnId || dueRow.transaction_id || 'N/A'}`,
      `Method: ${dueRow.payment_method || 'ONLINE'}`,
    ].join('\n');

    showAlert('Payment Details', details, 'info');
  };

  const handleResolveNameRequest = async (request: NameChangeRequest, action: 'approve' | 'reject') => {
    try {
      showLoading(action === 'approve' ? 'Approving name update...' : 'Rejecting request...');

      if (action === 'approve') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ full_name: request.requestedName })
          .eq('id', request.parentId);

        if (updateError) throw updateError;

        // Keep student records aligned with approved parent profile name.
        await supabase
          .from('students')
          .update({ parent_name: request.requestedName } as any)
          .eq('parent_id', request.parentId);

        await supabase.from('notifications').insert({
          user_id: request.parentId,
          title: 'Profile Name Update Approved',
          message: `Admin confirmed your name change. Your profile name is now ${request.requestedName}.`,
          type: 'SUCCESS',
          is_read: false,
        });
      } else {
        await supabase.from('notifications').insert({
          user_id: request.parentId,
          title: 'Profile Name Update Rejected',
          message: `Your requested name update to "${request.requestedName}" was rejected. Please contact admin support if needed.`,
          type: 'WARNING',
          is_read: false,
        });
      }

      if (currentAdminId) {
        await supabase.from('notifications').insert({
          user_id: currentAdminId,
          title: 'Parent Name Request Reviewed',
          message: `[PROFILE_UPDATE_REVIEW][ACTION:${action === 'approve' ? 'APPROVED' : 'REJECTED'}][PARENT_ID:${request.parentId}][CURRENT_NAME:${request.currentName}][REQUESTED_NAME:${request.requestedName}][PARENT_EMAIL:${request.parentEmail}]`,
          type: 'INFO',
          is_read: false,
        });
      }

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', request.id as any);

      setNameChangeRequests((prev) => prev.filter((item) => item.id !== request.id));
      const resolvedAction: 'APPROVED' | 'REJECTED' = action === 'approve' ? 'APPROVED' : 'REJECTED';

      setNameChangeHistory((prev) => [
        {
          id: `local-${request.id}`,
          parentId: request.parentId,
          currentName: request.currentName,
          requestedName: request.requestedName,
          parentEmail: request.parentEmail,
          action: resolvedAction,
          reviewedAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 20));
      closeSwal();
      showToast(action === 'approve' ? 'Name updated successfully.' : 'Request rejected.', action === 'approve' ? 'success' : 'info');
    } catch (err: any) {
      closeSwal();
      showAlert('Action Failed', err?.message || 'Unable to process name update request.', 'error');
    }
  };

  return (
    <div className="max-w-5xl space-y-8 pb-10">
      {view === 'notifications' ? (
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Notification Center</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Broadcast to Parents</p>
        </div>
      ) : <div />}

      <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-fit">
        <button onClick={() => setView('notifications')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${view === 'notifications' ? 'bg-primary text-white' : 'text-slate-500'}`}>Notifications</button>
        <button onClick={() => setView('audit')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${view === 'audit' ? 'bg-primary text-white' : 'text-slate-500'}`}>Audit Logs</button>
      </div>

      {view === 'audit' ? (
        <AuditLogs />
      ) : (

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
              <i className="fas fa-user-check text-primary"></i>
              Parent Name Requests
            </h4>
            {nameChangeRequests.length === 0 ? (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-6">No pending name requests</p>
            ) : (
              <div className="space-y-6">
                {nameChangeRequests.map((item) => (
                  <div key={item.id} className="pb-6 border-b border-slate-50 last:border-0 last:pb-0 rounded-2xl px-3 py-2 -mx-3">
                    <p className="text-xs font-black text-slate-800 tracking-tight leading-snug">{item.currentName} → {item.requestedName}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-2 leading-relaxed">{item.parentEmail}</p>
                    <div className="flex items-center justify-between mt-3 gap-3">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(item.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResolveNameRequest(item, 'reject')}
                          className="text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleResolveNameRequest(item, 'approve')}
                          className="text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg bg-primary text-white hover:bg-blue-800"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-8 flex items-center gap-3">
              <i className="fas fa-clipboard-check text-primary"></i>
              Name Request History
            </h4>
            {nameChangeHistory.length === 0 ? (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-6">No reviewed requests yet</p>
            ) : (
              <div className="space-y-6">
                {nameChangeHistory.map((item) => (
                  <div key={item.id} className="pb-6 border-b border-slate-50 last:border-0 last:pb-0 rounded-2xl px-3 py-2 -mx-3">
                    <p className="text-xs font-black text-slate-800 tracking-tight leading-snug">{item.currentName} → {item.requestedName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${item.action === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {item.action}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold">{item.parentEmail}</span>
                    </div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 inline-block">
                      {new Date(item.reviewedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-8 flex items-center gap-3">
              <i className="fas fa-receipt text-primary"></i>
              Payment Confirmations
            </h4>
            {paymentConfirmations.length === 0 ? (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-6">No payment confirmations yet</p>
            ) : (
              <div className="space-y-6">
                {paymentConfirmations.map((item) => {
                  const meta = extractReceiptMeta(item.message || '');
                  const dueMeta = meta.dueId ? paymentMetaByDueId[String(meta.dueId)] : undefined;
                  const paidAtLabel = dueMeta?.paidAt
                    ? new Date(String(dueMeta.paidAt)).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : new Date(item.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                  return (
                    <div
                      id={`admin-notif-${item.id}`}
                      key={item.id}
                      onClick={() => handlePaymentDetails(meta.dueId, meta.txnId, item.message || '')}
                      className={`pb-6 border-b border-slate-50 last:border-0 last:pb-0 rounded-2xl px-3 py-2 -mx-3 cursor-pointer ${highlightedId === String(item.id) ? 'ring-2 ring-primary/20 border-primary/30' : ''}`}
                    >
                      <p className="text-xs font-black text-slate-800 tracking-tight leading-snug">{item.title}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-2 leading-relaxed">{formatNotificationMessage(item.message || '')}</p>
                      <div className="flex items-center justify-between mt-3 gap-3">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          {paidAtLabel}
                        </span>
                        {meta.dueId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadReceipt(meta.dueId as string, (meta.txnId || meta.dueId) as string, {
                                id: meta.dueId,
                                transaction_id: meta.txnId || meta.dueId,
                                month: dueMeta?.month,
                                year: dueMeta?.year,
                                amount: dueMeta?.amount,
                                total_due: dueMeta?.amount,
                                paid_at: dueMeta?.paidAt,
                                students: { full_name: dueMeta?.studentName || 'Student' },
                              });
                            }}
                            disabled={downloading === String(meta.dueId)}
                            className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline disabled:opacity-50"
                          >
                            {downloading === String(meta.dueId) ? 'Downloading...' : 'Download Receipt'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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
                  <div
                    id={`admin-notif-${b.id}`}
                    key={i}
                    className={`pb-6 border-b border-slate-50 last:border-0 last:pb-0 rounded-2xl px-3 py-2 -mx-3 ${highlightedId === String(b.id) ? 'ring-2 ring-primary/20 border-primary/30' : ''}`}
                  >
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
      )}
    </div>
  );
};

export default AdminNotifications;

import React, { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { useAuthStore } from '../store/authStore';
import { showToast, showAlert, showConfirm } from '../lib/swal';
import { fetchHolidays, addHoliday, removeHoliday, type BusHolidayRow } from '../services/busHolidays';

const Holidays: React.FC = () => {
  const { user: adminUser } = useAuthStore();
  const [rows, setRows] = useState<BusHolidayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setLoading(true);
    // Fetch a 12-month window centred on today
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().split('T')[0];
    const to = new Date(now.getFullYear(), now.getMonth() + 6, 31).toISOString().split('T')[0];
    const data = await fetchHolidays(from, to);
    setRows(data);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleAdd = async () => {
    if (!adminUser) return;
    if (!date) { showToast('Pick a date', 'warning'); return; }
    setSaving(true);
    const r = await addHoliday(date, reason, adminUser.id);
    setSaving(false);
    if (!r.ok) {
      showAlert('Could not save', r.error || 'Try again. Date may already be a holiday.', 'error');
      return;
    }
    showToast('Holiday added.', 'success');
    setShowModal(false);
    setDate('');
    setReason('');
    refresh();
  };

  const handleDelete = async (row: BusHolidayRow) => {
    const niceDate = new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const confirmed = await showConfirm('Remove holiday?', `${niceDate}${row.reason ? ` — ${row.reason}` : ''}`, 'Delete');
    if (!confirmed) return;
    const r = await removeHoliday(row.id);
    if (r.ok) { showToast('Holiday removed', 'info'); refresh(); }
    else showAlert('Failed', r.error || 'Try again.', 'error');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Bus Holidays</h1>
          <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mt-1">
            Days the bus does not run · visible to parents on attendance calendar
          </p>
        </div>
        <button
          onClick={() => { setDate(new Date().toISOString().split('T')[0]); setReason(''); setShowModal(true); }}
          className="bg-primary text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-blue-800 active:scale-95 transition-all flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <i className="fas fa-plus"></i>
          Add Holiday
        </button>
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <i className="fas fa-calendar-times text-3xl text-slate-200 mb-3"></i>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No holidays added yet</p>
            <p className="text-[10px] font-bold text-slate-400 mt-2">Add school holidays so parents see them on the attendance calendar.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto">
            {rows.map((r) => {
              const d = new Date(r.date);
              const niceDate = d.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
              const isPast = new Date(r.date) < new Date(new Date().toDateString());
              return (
                <div key={r.id} className={`p-3 md:p-4 flex items-center gap-3 ${isPast ? 'opacity-60' : ''}`}>
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-50 text-amber-700 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[8px] font-black uppercase tracking-widest">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                    <span className="text-base md:text-lg font-black leading-none">{d.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-black text-slate-800">{niceDate}</p>
                    <p className="text-[10px] font-bold text-slate-500 truncate">{r.reason || 'School holiday'}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(r)}
                    className="w-9 h-9 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center flex-shrink-0"
                  >
                    <i className="fas fa-trash-alt text-[10px]"></i>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Holiday"
        maxWidthClass="max-w-md"
        bodyClassName="p-4 md:p-8"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-4 ring-primary/10 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason (optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Diwali, Republic Day, Sunday"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-4 ring-primary/10 focus:border-primary"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={saving || !date}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <><i className="fas fa-circle-notch fa-spin"></i> Saving</> : <><i className="fas fa-check"></i> Add Holiday</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Holidays;

import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal';
import { useBuses } from '../hooks/useBuses';
import { useAuthStore } from '../store/authStore';
import { showToast, showAlert, showConfirm } from '../lib/swal';
import {
  EXPENSE_TYPE_OPTIONS,
  addBusExpense,
  fetchBusExpenses,
  deleteBusExpense,
  summarizeExpensesByMonth,
  type BusExpenseRow,
  type ExpenseType,
} from '../services/busExpenses';
import { supabase } from '../lib/supabase';

const todayStr = () => new Date().toISOString().split('T')[0];

const Expenses: React.FC = () => {
  const { user: adminUser } = useAuthStore();
  const { buses } = useBuses();
  const [rows, setRows] = useState<BusExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revenue, setRevenue] = useState(0);

  // form state
  const [busId, setBusId] = useState<string>('');
  const [expenseType, setExpenseType] = useState<ExpenseType>('fuel');
  const [amount, setAmount] = useState('');
  const [fuelLitres, setFuelLitres] = useState('');
  const [date, setDate] = useState(todayStr);
  const [notes, setNotes] = useState('');

  const refresh = async () => {
    setLoading(true);
    const { rows } = await fetchBusExpenses({ limit: 200 });
    setRows(rows);
    // also pull a quick paid-revenue summary so we can show profit
    const start = new Date();
    start.setMonth(start.getMonth() - 5);
    start.setDate(1);
    const { data } = await supabase
      .from('monthly_dues')
      .select('total_due, amount, status, paid_at')
      .eq('status', 'PAID')
      .gte('paid_at', start.toISOString());
    const rev = (data || []).reduce((s: number, d: any) => s + Number(d.total_due || d.amount || 0), 0);
    setRevenue(rev);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const summary = useMemo(() => summarizeExpensesByMonth(rows), [rows]);
  const totalExpenses = useMemo(() => rows.reduce((s, r) => s + Number(r.amount || 0), 0), [rows]);
  const totalFuelLitres = useMemo(
    () => rows.filter((r) => r.expense_type === 'fuel').reduce((s, r) => s + Number(r.fuel_litres || 0), 0),
    [rows]
  );
  const profit = revenue - totalExpenses;

  const resetForm = () => {
    setBusId('');
    setExpenseType('fuel');
    setAmount('');
    setFuelLitres('');
    setDate(todayStr());
    setNotes('');
  };

  const handleSave = async () => {
    if (!adminUser) return;
    if (!amount || Number(amount) <= 0) {
      showToast('Enter a valid amount', 'warning');
      return;
    }
    setSaving(true);
    const result = await addBusExpense({
      busId: busId || null,
      expenseType,
      amount: Number(amount),
      fuelLitres: expenseType === 'fuel' && fuelLitres ? Number(fuelLitres) : null,
      notes: notes.trim() || undefined,
      date,
      recordedBy: adminUser.id,
    });
    setSaving(false);
    if (!result.ok) {
      showAlert('Could not save', result.error || 'Try again.', 'error');
      return;
    }
    showToast('Expense recorded.', 'success');
    setShowModal(false);
    resetForm();
    refresh();
  };

  const handleDelete = async (row: BusExpenseRow) => {
    const confirmed = await showConfirm('Delete entry?', `Remove ${row.expense_type} expense of ₹${row.amount} on ${row.date}?`, 'Delete');
    if (!confirmed) return;
    const r = await deleteBusExpense(row.id);
    if (r.ok) { showToast('Entry deleted', 'info'); refresh(); }
    else showAlert('Failed', r.error || 'Try again.', 'error');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Bus Expenses</h1>
          <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mt-1">
            Fuel, maintenance, insurance & permit log
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-primary text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-blue-800 active:scale-95 transition-all flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <i className="fas fa-plus"></i>
          Add Expense
        </button>
      </div>

      {/* Profit summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 border border-slate-200 shadow-sm">
          <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue (6 mo)</p>
          <p className="text-base md:text-2xl font-black text-emerald-600 mt-1">₹{revenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 border border-slate-200 shadow-sm">
          <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Expenses</p>
          <p className="text-base md:text-2xl font-black text-red-600 mt-1">₹{totalExpenses.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 border border-slate-200 shadow-sm">
          <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Profit</p>
          <p className={`text-base md:text-2xl font-black mt-1 ${profit >= 0 ? 'text-primary' : 'text-red-600'}`}>₹{profit.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 border border-slate-200 shadow-sm">
          <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Fuel (Litres)</p>
          <p className="text-base md:text-2xl font-black text-amber-600 mt-1">{totalFuelLitres.toFixed(1)}</p>
        </div>
      </div>

      {/* Monthly summary */}
      {summary.length > 0 && (
        <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 bg-slate-50 border-b border-slate-100">
            <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Month-wise Summary</h3>
          </div>
          <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
            {summary.slice(0, 6).map((s) => {
              const monthName = new Date(s.year, s.month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
              return (
                <div key={`${s.year}-${s.month}`} className="p-3 md:p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-black text-slate-800">{monthName}</p>
                    <p className="text-[9px] font-bold text-slate-500 truncate">
                      Fuel ₹{s.byType.fuel.toLocaleString('en-IN')} · Service ₹{s.byType.service.toLocaleString('en-IN')} · Repair ₹{s.byType.repair.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm md:text-base font-black text-red-600">₹{s.totalAmount.toLocaleString('en-IN')}</p>
                    {s.totalFuelLitres > 0 && <p className="text-[8px] font-bold text-amber-600">{s.totalFuelLitres.toFixed(1)} L</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expense list */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 bg-slate-50 border-b border-slate-100">
          <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Recent Entries</h3>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <i className="fas fa-receipt text-3xl text-slate-200 mb-3"></i>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No expenses yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
            {rows.map((r) => {
              const type = EXPENSE_TYPE_OPTIONS.find((t) => t.key === r.expense_type);
              return (
                <div key={r.id} className="p-3 md:p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${type?.color || 'bg-slate-100 text-slate-600'}`}>
                    <i className={`fas ${type?.icon || 'fa-receipt'}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-black text-slate-800">
                      {type?.label || r.expense_type} {r.expense_type === 'fuel' && r.fuel_litres ? `· ${r.fuel_litres}L` : ''}
                    </p>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-500 truncate">
                      {r.buses?.bus_number || 'Unassigned'} · {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      {r.notes ? ` · ${r.notes}` : ''}
                    </p>
                  </div>
                  <p className="text-sm md:text-base font-black text-red-600 flex-shrink-0">₹{Number(r.amount).toLocaleString('en-IN')}</p>
                  <button
                    onClick={() => handleDelete(r)}
                    className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center flex-shrink-0"
                  >
                    <i className="fas fa-trash-alt text-[10px]"></i>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add expense modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Expense"
        maxWidthClass="max-w-md"
        bodyClassName="p-4 md:p-8"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {EXPENSE_TYPE_OPTIONS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setExpenseType(t.key)}
                  className={`p-2.5 rounded-xl text-center transition-all border-2 active:scale-95 ${
                    expenseType === t.key ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white'
                  }`}
                >
                  <i className={`fas ${t.icon} text-base text-slate-600 mb-1 block`}></i>
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹)</label>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-4 ring-primary/10 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={todayStr()}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-4 ring-primary/10 focus:border-primary"
              />
            </div>
          </div>

          {expenseType === 'fuel' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Litres (optional)</label>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={fuelLitres}
                onChange={(e) => setFuelLitres(e.target.value)}
                placeholder="e.g. 25.5"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-4 ring-primary/10 focus:border-primary"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bus (optional)</label>
            <select
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-4 ring-primary/10 focus:border-primary"
            >
              <option value="">— Not bus-specific —</option>
              {buses.map((b: any) => (
                <option key={b.id} value={b.id}>{b.bus_number} ({b.plate || b.vehicle_number})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes (optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. HP petrol pump, full tank"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-4 ring-primary/10 focus:border-primary resize-none"
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
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <><i className="fas fa-circle-notch fa-spin"></i> Saving</> : <><i className="fas fa-check"></i> Save Expense</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Expenses;

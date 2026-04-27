import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DueLike {
  status?: string;
  amount?: number;
  total_due?: number;
  late_fee?: number;
  paid_at?: string | null;
  due_date?: string | null;
  month?: number;
  year?: number;
}

interface SpendingSummaryProps {
  dues: DueLike[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatINR = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(n >= 1000000 ? 0 : 1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

const SpendingSummary: React.FC<SpendingSummaryProps> = ({ dues }) => {
  const stats = useMemo(() => {
    const today = new Date();
    const fyStartYear = today.getMonth() + 1 >= 4 ? today.getFullYear() : today.getFullYear() - 1;
    const fyStart = new Date(fyStartYear, 3, 1); // April 1
    const fyEnd = new Date(fyStartYear + 1, 2, 31); // March 31

    let totalPaidThisYear = 0;
    let totalDueThisYear = 0;
    let totalLateFees = 0;
    let monthsPaid = 0;
    let monthsPending = 0;

    const monthly: Record<string, { paid: number; pending: number; label: string; sortKey: number }> = {};
    for (let i = 0; i < 12; i++) {
      const month = ((3 + i) % 12) + 1;
      const year = i < 9 ? fyStartYear : fyStartYear + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      monthly[key] = {
        paid: 0,
        pending: 0,
        label: MONTH_NAMES[month - 1],
        sortKey: year * 12 + month,
      };
    }

    dues.forEach((d) => {
      const month = Number(d.month || 0);
      const year = Number(d.year || 0);
      if (!month || !year) return;

      const dueDate = d.paid_at ? new Date(d.paid_at) : new Date(year, month - 1, 1);
      if (dueDate < fyStart || dueDate > fyEnd) return;

      const total = Number(d.total_due ?? d.amount ?? 0);
      const lateFee = Number(d.late_fee ?? 0);
      const status = String(d.status || '').toUpperCase();
      const key = `${year}-${String(month).padStart(2, '0')}`;
      if (!monthly[key]) return;

      if (status === 'PAID') {
        totalPaidThisYear += total;
        totalLateFees += lateFee;
        monthsPaid += 1;
        monthly[key].paid += total;
      } else {
        totalDueThisYear += total;
        monthsPending += 1;
        monthly[key].pending += total;
      }
    });

    const chart = Object.entries(monthly)
      .map(([_, v]) => v)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((v) => ({ month: v.label, paid: v.paid, pending: v.pending }));

    return {
      totalPaidThisYear,
      totalDueThisYear,
      totalLateFees,
      monthsPaid,
      monthsPending,
      chart,
      fyLabel: `${fyStartYear} – ${fyStartYear + 1}`,
    };
  }, [dues]);

  const allZero = stats.totalPaidThisYear === 0 && stats.totalDueThisYear === 0;
  if (allZero) return null;

  return (
    <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm p-5 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-5 md:mb-6">
        <div>
          <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Spending Summary</p>
          <p className="text-base md:text-xl font-black text-slate-900 tracking-tight">FY {stats.fyLabel}</p>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <i className="fas fa-chart-line text-base md:text-lg"></i>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-5 md:mb-8">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl md:rounded-2xl p-3 md:p-4">
          <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">Paid</p>
          <p className="text-lg md:text-2xl font-black text-emerald-700 tracking-tighter mt-1">{formatINR(stats.totalPaidThisYear)}</p>
          <p className="text-[9px] font-bold text-emerald-600/70 mt-0.5">{stats.monthsPaid} month{stats.monthsPaid === 1 ? '' : 's'}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl md:rounded-2xl p-3 md:p-4">
          <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest">Due</p>
          <p className="text-lg md:text-2xl font-black text-amber-700 tracking-tighter mt-1">{formatINR(stats.totalDueThisYear)}</p>
          <p className="text-[9px] font-bold text-amber-600/70 mt-0.5">{stats.monthsPending} month{stats.monthsPending === 1 ? '' : 's'}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl md:rounded-2xl p-3 md:p-4">
          <p className="text-[8px] font-black text-red-700 uppercase tracking-widest">Late Fees</p>
          <p className="text-lg md:text-2xl font-black text-red-700 tracking-tighter mt-1">{formatINR(stats.totalLateFees)}</p>
          <p className="text-[9px] font-bold text-red-600/70 mt-0.5">Already absorbed</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl md:rounded-2xl p-3 md:p-4">
          <p className="text-[8px] font-black text-blue-700 uppercase tracking-widest">Avg / Month</p>
          <p className="text-lg md:text-2xl font-black text-blue-700 tracking-tighter mt-1">
            {formatINR(stats.monthsPaid > 0 ? stats.totalPaidThisYear / stats.monthsPaid : 0)}
          </p>
          <p className="text-[9px] font-bold text-blue-600/70 mt-0.5">Paid only</p>
        </div>
      </div>

      <div className="h-48 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.chart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
              tickFormatter={(v: number) => formatINR(v)}
              width={50}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              formatter={(value: any) => formatINR(Number(value || 0))}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 700 }}
            />
            <Bar dataKey="paid" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 mt-3 text-[9px] font-black uppercase tracking-widest">
        <span className="flex items-center gap-2 text-emerald-700">
          <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
          Paid
        </span>
        <span className="flex items-center gap-2 text-amber-700">
          <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
          Pending
        </span>
      </div>
    </div>
  );
};

export default SpendingSummary;

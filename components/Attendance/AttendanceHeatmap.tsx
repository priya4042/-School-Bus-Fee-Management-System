import React, { useMemo, useState } from 'react';

interface AttendanceRecord {
  date: string;
  status: boolean;
  type?: string;
}

interface AttendanceHeatmapProps {
  records: AttendanceRecord[];
  /** YYYY-MM-DD strings the bus did not run (e.g. school holidays). */
  holidayDates?: string[];
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const monthRange = (year: number, monthIdx: number) => {
  const first = new Date(year, monthIdx, 1);
  const last = new Date(year, monthIdx + 1, 0);
  const startWeekday = first.getDay();
  const days: (string | null)[] = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    const m = String(monthIdx + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    days.push(`${year}-${m}-${dd}`);
  }
  return { days, label: first.toLocaleString('en-IN', { month: 'long', year: 'numeric' }) };
};

const AttendanceHeatmap: React.FC<AttendanceHeatmapProps> = ({ records, holidayDates = [] }) => {
  const holidaySet = useMemo(() => new Set(holidayDates), [holidayDates]);
  const today = new Date();
  const [cursor, setCursor] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));

  // Aggregate records by date — present-only if any record for that date is true
  const byDate = useMemo(() => {
    const map: Record<string, { present: boolean; total: number }> = {};
    records.forEach((r) => {
      if (!map[r.date]) map[r.date] = { present: false, total: 0 };
      map[r.date].total += 1;
      if (r.status) map[r.date].present = true;
    });
    return map;
  }, [records]);

  const { days, label } = useMemo(() => monthRange(cursor.year, cursor.month), [cursor]);

  const goPrev = () => {
    const m = cursor.month - 1;
    if (m < 0) setCursor({ year: cursor.year - 1, month: 11 });
    else setCursor({ year: cursor.year, month: m });
  };
  const goNext = () => {
    const m = cursor.month + 1;
    if (m > 11) setCursor({ year: cursor.year + 1, month: 0 });
    else setCursor({ year: cursor.year, month: m });
  };

  const isFutureMonth =
    cursor.year > today.getFullYear() ||
    (cursor.year === today.getFullYear() && cursor.month >= today.getMonth());

  const todayKey = (() => {
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${m}-${d}`;
  })();

  return (
    <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm p-5 md:p-8">
      <div className="flex items-center justify-between mb-5 md:mb-6">
        <div>
          <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Attendance Calendar</p>
          <p className="text-base md:text-xl font-black text-slate-900 tracking-tight">{label}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Previous month"
          >
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <button
            onClick={goNext}
            disabled={isFutureMonth}
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next month"
          >
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {days.map((dayKey, i) => {
          if (!dayKey) {
            return <div key={i} className="aspect-square" />;
          }
          const entry = byDate[dayKey];
          const present = entry?.present;
          const isToday = dayKey === todayKey;
          const isFuture = dayKey > todayKey;
          const isHoliday = holidaySet.has(dayKey);

          let cellClass = 'bg-slate-50 text-slate-300';
          if (isHoliday) {
            cellClass = 'bg-amber-50 text-amber-700 border border-amber-200';
          } else if (entry) {
            cellClass = present
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : 'bg-red-100 text-red-500 border border-red-200';
          } else if (isFuture) {
            cellClass = 'bg-white border border-slate-100 text-slate-300';
          } else {
            cellClass = 'bg-slate-50 text-slate-400';
          }

          const day = Number(dayKey.split('-')[2]);

          return (
            <div
              key={i}
              className={`relative aspect-square rounded-lg md:rounded-xl flex items-center justify-center text-[10px] md:text-xs font-black tracking-tight transition-all ${cellClass} ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}`}
              title={
                isHoliday
                  ? `${dayKey} — Bus holiday`
                  : entry
                    ? `${dayKey} — ${present ? 'Present' : 'Absent'}${entry.total > 1 ? ` (${entry.total} entries)` : ''}`
                    : isFuture
                      ? `${dayKey} — Future`
                      : `${dayKey} — No record`
              }
            >
              {isHoliday ? <span className="text-[9px]">🚫</span> : day}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-5 md:mt-6 text-[9px] font-black uppercase tracking-widest">
        <span className="flex items-center gap-2 text-slate-500">
          <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
          Present
        </span>
        <span className="flex items-center gap-2 text-slate-500">
          <span className="w-3 h-3 rounded-md bg-amber-50 border border-amber-200"></span>
          Bus Off
        </span>
        <span className="flex items-center gap-2 text-slate-500">
          <span className="w-3 h-3 rounded-md bg-red-100 border border-red-200"></span>
          Absent
        </span>
        <span className="flex items-center gap-2 text-slate-500">
          <span className="w-3 h-3 rounded-md bg-slate-50 border border-slate-100"></span>
          No record
        </span>
        <span className="flex items-center gap-2 text-slate-500">
          <span className="w-3 h-3 rounded-md ring-2 ring-primary"></span>
          Today
        </span>
      </div>
    </div>
  );
};

export default AttendanceHeatmap;

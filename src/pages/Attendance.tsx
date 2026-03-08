
import React from 'react';
import { Calendar, CheckCircle2, XCircle, Search, Filter, Download } from 'lucide-react';

const Attendance: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Attendance Registry</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Daily Boarding & De-boarding Logs</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-bold text-sm border border-slate-100 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Download size={18} />
            Export Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: '420', icon: <Calendar />, color: 'text-primary' },
          { label: 'Present Today', value: '398', icon: <CheckCircle2 />, color: 'text-emerald-500' },
          { label: 'Absent', value: '22', icon: <XCircle />, color: 'text-red-500' },
          { label: 'Attendance Rate', value: '94.7%', icon: <Filter />, color: 'text-amber-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-slate-50 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search by Student Name or ID..." 
              className="bg-transparent border-none font-bold text-sm focus:ring-0 w-64"
            />
          </div>
          <div className="flex gap-4">
            <input type="date" className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 ring-primary/20" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Route</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Morning (In)</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Evening (Out)</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Student {i}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: ADM-00{i}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-700 uppercase">Route {i}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-700 uppercase">07:45 AM</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-700 uppercase">04:15 PM</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <CheckCircle2 size={10} /> Present
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;

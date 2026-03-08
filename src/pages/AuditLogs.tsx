
import React from 'react';
import { History, Search, Filter, Download, User, Shield, Clock, AlertCircle } from 'lucide-react';

const AuditLogs: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Audit Logs</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">System-wide Activity & Security Monitoring</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-bold text-sm border border-slate-100 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Download size={18} />
            Export Logs
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search by User, Action or Resource..." 
              className="bg-transparent border-none font-bold text-sm focus:ring-0 w-64"
            />
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all flex items-center gap-2">
              <Filter size={14} />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-700 uppercase">May {i}, 2024</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">10:45:32 AM</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <User size={16} />
                      </div>
                      <p className="text-xs font-black text-slate-700 uppercase">Admin User {i}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-blue-50 text-primary rounded-full text-[8px] font-black uppercase tracking-widest">
                      UPDATE_STUDENT
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-700 uppercase">StudentRecord#00{i}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">192.168.1.{i}</p>
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

export default AuditLogs;

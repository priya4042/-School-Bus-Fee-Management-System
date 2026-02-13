
import React, { useState, useEffect } from 'react';
import api from '../lib/api';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Mocking for now, in prod: const { data } = await api.get('/admin/audit-logs');
        setLogs([
          { id: 1, action: 'LATE_FEE_WAIVED', entity: 'STUDENT (Alice Doe)', user: 'Admin Sarah', date: '2024-03-24 10:45 AM', status: 'CRITICAL' },
          { id: 2, action: 'MANUAL_PAYMENT_ENTRY', entity: 'DUE (Feb 2024)', user: 'Accountant Bob', date: '2024-03-23 04:12 PM', status: 'FINANCE' },
          { id: 3, action: 'SYSTEM_SETTINGS_UPDATE', entity: 'CONFIG (Grace Period)', user: 'SuperAdmin', date: '2024-03-23 09:00 AM', status: 'SYSTEM' },
          { id: 4, action: 'STUDENT_BULK_UPLOAD', entity: 'CSV (42 Records)', user: 'Admin Sarah', date: '2024-03-22 11:30 AM', status: 'DATA' },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'bg-red-50 text-red-600 border-red-100';
      case 'FINANCE': return 'bg-green-50 text-green-600 border-green-100';
      case 'SYSTEM': return 'bg-primary/5 text-primary border-primary/10';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Audit Vault</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Immutable Transaction & Action Logs</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
           <i className="fas fa-shield-check text-success"></i>
           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Tamper-Proof Ledger</span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input type="text" placeholder="Search by action, user or entity..." className="w-full pl-12 pr-6 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary font-bold text-slate-700 bg-white" />
           </div>
           <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Export Full CSV Archive</button>
        </div>

        <div className="overflow-x-auto min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
               <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fetching Audit Stream...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-5">Action Type</th>
                  <th className="px-8 py-5">Entity Modified</th>
                  <th className="px-8 py-5">Executed By</th>
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5 text-center">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-5">
                       <span className="font-black text-slate-800 tracking-tight text-sm uppercase">{log.action.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-xs font-bold text-slate-500">{log.entity}</p>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200">
                             {log.user.charAt(0)}
                          </div>
                          <span className="text-xs font-black text-slate-700">{log.user}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.date}</p>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(log.status)}`}>
                          {log.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;

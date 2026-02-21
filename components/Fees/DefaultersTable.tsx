import React from 'react';
import { Phone, Mail, MessageSquare, AlertTriangle, Send, MoreVertical } from 'lucide-react';
import { Defaulter } from '../../types';

interface DefaultersTableProps {
  defaulters: Defaulter[];
  onSendReminder: (id: string) => void;
  onCall: (phone: string) => void;
  onWhatsApp: (phone: string, name: string) => void;
}

const DefaultersTable: React.FC<DefaultersTableProps> = ({ defaulters, onSendReminder, onCall, onWhatsApp }) => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Fee Defaulters</h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Students with pending dues for more than 7 days</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-primary/10 text-primary px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-colors">
            Export CSV
          </button>
          <button className="bg-primary text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
            Bulk Reminder
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Parent</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Month</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Overdue</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {defaulters.map((defaulter) => (
              <tr key={defaulter.studentId} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                      {defaulter.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{defaulter.studentName}</p>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{defaulter.class} - {defaulter.section}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div>
                    <p className="font-bold text-slate-700">{defaulter.parentName}</p>
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => onCall(defaulter.parentPhone)} className="text-primary hover:text-primary-dark">
                        <Phone size={14} />
                      </button>
                      <button onClick={() => onWhatsApp(defaulter.parentPhone, defaulter.studentName)} className="text-emerald-500 hover:text-emerald-600">
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {defaulter.month} {defaulter.year}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <p className="font-black text-slate-900">₹{defaulter.totalAmount.toLocaleString()}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${defaulter.daysOverdue > 30 ? 'bg-danger' : 'bg-warning'}`}></div>
                    <p className={`font-black text-xs ${defaulter.daysOverdue > 30 ? 'text-danger' : 'text-warning'}`}>
                      {defaulter.daysOverdue} Days
                    </p>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onSendReminder(defaulter.studentId)}
                      className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-colors"
                    >
                      <Send size={12} />
                      Remind
                    </button>
                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DefaultersTable;


import React from 'react';
import { FileText, Download, Search, Filter, Printer, Share2 } from 'lucide-react';

const Receipts: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Payment Receipts</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Official Transaction Documentation</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-bold text-sm border border-slate-100 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Download size={18} />
            Bulk Download
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
              placeholder="Search by Receipt ID or Student..." 
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
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">RCP-2024-00{i}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Transaction ID: TXN-987654321</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-700 uppercase">Student {i}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-700 uppercase">May {i}, 2024</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-900 tracking-tight">₹4,500</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2">
                      <button className="p-3 bg-white text-primary rounded-xl border border-slate-100 shadow-sm hover:bg-primary hover:text-white transition-all">
                        <Download size={16} />
                      </button>
                      <button className="p-3 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-sm hover:bg-slate-900 hover:text-white transition-all">
                        <Printer size={16} />
                      </button>
                      <button className="p-3 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-sm hover:bg-slate-900 hover:text-white transition-all">
                        <Share2 size={16} />
                      </button>
                    </div>
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

export default Receipts;

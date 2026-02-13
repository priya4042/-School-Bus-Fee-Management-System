
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../lib/api';

const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState('revenue');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [defaulterData, setDefaulterData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const [statsRes, defRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/reports/defaulters')
        ]);
        setRevenueData(statsRes.data.revenueTrend);
        setDefaulterData(defRes.data);
      } catch (err) {
        console.error("Failed to load reports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const handleExport = async () => {
    const start = "2024-01-01";
    const end = new Date().toISOString().split('T')[0];
    window.open(`${api.defaults.baseURL}/reports/export/csv?start_date=${start}&end_date=${end}`, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Intelligence & Analytics</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Comprehensive Financial Transparency</p>
        </div>
        <div className="flex p-1.5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm">
          <button 
            onClick={() => setActiveReport('revenue')}
            className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeReport === 'revenue' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Revenue
          </button>
          <button 
            onClick={() => setActiveReport('defaulters')}
            className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeReport === 'defaulters' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Defaulters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center">
          <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
        </div>
      ) : activeReport === 'revenue' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Monthly Revenue Stream</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e40af" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#1e40af" strokeWidth={4} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white flex flex-col justify-between">
            <h3 className="font-black text-white/50 uppercase tracking-widest text-[11px] mb-8">Export Central</h3>
            <p className="text-sm font-bold text-white/60 mb-10">Generate compliant CSV audits for accounting and school management teams.</p>
            <button 
              onClick={handleExport}
              className="w-full py-5 bg-white text-slate-900 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:bg-slate-50 transition-all"
            >
              Export FY 2024 Collection
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Student</th>
                <th className="px-8 py-5">Route</th>
                <th className="px-8 py-5">Month</th>
                <th className="px-8 py-5 text-right">Amount Overdue</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {defaulterData.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-black text-slate-800">{d.full_name}</td>
                  <td className="px-8 py-5 text-xs text-slate-500">{d.route_name}</td>
                  <td className="px-8 py-5 text-xs font-bold">{d.month}/{d.year}</td>
                  <td className="px-8 py-5 text-right font-black text-danger">₹{d.total_due}</td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Remind Parent</button>
                  </td>
                </tr>
              ))}
              {defaulterData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-300 font-black uppercase text-xs">No Overdue Payments Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;

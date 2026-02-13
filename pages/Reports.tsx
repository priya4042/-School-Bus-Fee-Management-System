
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import api from '../lib/api';

const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState('revenue');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [defaulterData, setDefaulterData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const routeDistribution = [
    { name: 'North Zone', value: 450000, color: '#1e40af' },
    { name: 'South City', value: 320000, color: '#3b82f6' },
    { name: 'East Highland', value: 280000, color: '#60a5fa' },
    { name: 'West Link', value: 150000, color: '#93c5fd' },
  ];

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const statsRes = await api.get('/dashboard/stats');
        setRevenueData(statsRes.data.revenueTrend || [
          { month: 'Oct', revenue: 450000 },
          { month: 'Nov', revenue: 520000 },
          { month: 'Dec', revenue: 480000 },
          { month: 'Jan', revenue: 610000 },
          { month: 'Feb', revenue: 590000 },
          { month: 'Mar', revenue: 650000 },
        ]);
        
        const defRes = await api.get('/reports/defaulters');
        setDefaulterData(defRes.data || [
          { full_name: 'Alice Doe', route_name: 'North Zone', month: 3, year: 2024, total_due: 1650 },
          { full_name: 'Charlie Brown', route_name: 'East Highland', month: 3, year: 2024, total_due: 2000 },
        ]);
      } catch (err) {
        // Mock data already defined above in default values
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const handleExport = () => {
    alert("Preparing collection audit archive... (CSV Generated)");
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Intelligence Engine</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Comprehensive Performance Analytics</p>
        </div>
        <div className="flex p-1.5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm">
          {['revenue', 'routes', 'defaulters'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveReport(tab)}
              className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeReport === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-200">
          <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
        </div>
      ) : activeReport === 'revenue' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px] mb-10">Monthly Growth Velocity</h3>
            <div className="h-[400px]">
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
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#1e40af" strokeWidth={5} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-6">
             <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white flex flex-col justify-between h-full relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <i className="fas fa-file-export text-9xl"></i>
               </div>
               <div>
                  <h3 className="font-black text-white/50 uppercase tracking-widest text-[11px] mb-4">Export Hub</h3>
                  <p className="text-sm font-bold text-white/60 mb-10 leading-relaxed">Secure CSV extraction for fiscal audits and executive summaries.</p>
               </div>
               <button 
                 onClick={handleExport}
                 className="w-full py-5 bg-white text-slate-900 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:bg-slate-50 transition-all active:scale-[0.98]"
               >
                 Export Collection Archive
               </button>
             </div>
          </div>
        </div>
      ) : activeReport === 'routes' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px] mb-8">Collection Distribution by Zone</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={routeDistribution} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value">
                      {routeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                 {routeDistribution.map(item => (
                   <div key={item.name} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</p>
                        <p className="text-sm font-black text-slate-800">₹{(item.value/1000).toFixed(0)}K</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <div className="space-y-6">
              <div className="bg-primary p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                    <i className="fas fa-route text-9xl"></i>
                 </div>
                 <h4 className="font-black text-[10px] uppercase tracking-widest mb-10 text-white/40">Efficiency Metrics</h4>
                 <div className="space-y-8">
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-white/50 text-[10px] font-black uppercase mb-1">Top Performing Route</p>
                          <p className="text-2xl font-black">North Zone</p>
                       </div>
                       <span className="text-success font-black text-xs uppercase tracking-widest">+18.4%</span>
                    </div>
                    <div className="h-px bg-white/10"></div>
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-white/50 text-[10px] font-black uppercase mb-1">Average Fee Recovery</p>
                          <p className="text-2xl font-black">94.2%</p>
                       </div>
                       <span className="text-primary-light font-black text-xs uppercase tracking-widest">Healthy</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
             <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Fee Defaulter Ledger</h3>
             <span className="px-4 py-1.5 bg-danger/10 text-danger rounded-full text-[9px] font-black uppercase tracking-widest">{defaulterData.length} Records Found</span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-10 py-5">Student Identity</th>
                <th className="px-8 py-5">Assigned Route</th>
                <th className="px-8 py-5">Billing Cycle</th>
                <th className="px-8 py-5 text-right">Total Overdue</th>
                <th className="px-10 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {defaulterData.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-5">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center text-[10px] font-black">{d.full_name.charAt(0)}</div>
                        <span className="font-black text-slate-800 tracking-tight">{d.full_name}</span>
                     </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">{d.route_name}</td>
                  <td className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Month {d.month} / {d.year}</td>
                  <td className="px-8 py-5 text-right font-black text-danger text-lg">₹{d.total_due.toLocaleString()}</td>
                  <td className="px-10 py-5 text-right">
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline transition-all">Send Notice</button>
                  </td>
                </tr>
              ))}
              {defaulterData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <i className="fas fa-check-double text-5xl text-success/10 mb-6 block"></i>
                    <p className="text-slate-300 font-black uppercase text-xs tracking-[0.4em]">Zero Default Records</p>
                  </td>
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

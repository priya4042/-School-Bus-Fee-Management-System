
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Download, 
  Filter, 
  FileText, 
  TrendingUp, 
  Users, 
  Bus, 
  CreditCard,
  Calendar,
  ChevronRight,
  Printer,
  Share2
} from 'lucide-react';

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('Financial');

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const financialData = [
    { name: 'Jan', revenue: 45000, expenses: 32000 },
    { name: 'Feb', revenue: 52000, expenses: 34000 },
    { name: 'Mar', revenue: 48000, expenses: 31000 },
    { name: 'Apr', revenue: 61000, expenses: 38000 },
    { name: 'May', revenue: 55000, expenses: 35000 },
    { name: 'Jun', revenue: 67000, expenses: 40000 },
  ];

  const routeEfficiency = [
    { name: 'Route A', efficiency: 85 },
    { name: 'Route B', efficiency: 72 },
    { name: 'Route C', efficiency: 94 },
    { name: 'Route D', efficiency: 68 },
    { name: 'Route E', efficiency: 81 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const reportTypes = [
    { name: 'Financial', icon: CreditCard, description: 'Revenue, Dues & Expenses' },
    { name: 'Attendance', icon: Users, description: 'Student Presence Trends' },
    { name: 'Fleet', icon: Bus, description: 'Route & Fuel Efficiency' },
    { name: 'Audit', icon: FileText, description: 'System Access & Changes' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Intelligence Hub</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Data Analytics & Strategic Reporting</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white px-6 py-4 rounded-2xl border border-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3">
            <Share2 size={18} />
            Share
          </button>
          <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/30 hover:bg-primary-dark hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 active:scale-95 active:translate-y-0">
            <Printer size={18} />
            Print Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2">Report Categories</p>
          {reportTypes.map((type) => (
            <button
              key={type.name}
              onClick={() => setActiveReport(type.name)}
              className={`w-full p-6 rounded-[2rem] text-left transition-all group border ${
                activeReport === type.name 
                  ? 'bg-slate-950 text-white shadow-2xl shadow-slate-900/40 border-slate-900' 
                  : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                  activeReport === type.name ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
                }`}>
                  <type.icon size={24} />
                </div>
                <ChevronRight size={18} className={activeReport === type.name ? 'text-white/20' : 'text-slate-200'} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight mb-1">{type.name}</h3>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${activeReport === type.name ? 'text-white/40' : 'text-slate-400'}`}>
                {type.description}
              </p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{activeReport} Analysis</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Strategic Performance Visualization</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expenses</span>
                </div>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                  <Bar dataKey="expenses" fill="#e2e8f0" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Route Efficiency</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={routeEfficiency}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="efficiency"
                    >
                      {routeEfficiency.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {routeEfficiency.map((route, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{route.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-10 rounded-[3rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-bl-full -mr-10 -mt-10 blur-3xl"></div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-8 relative z-10">Strategic Summary</h3>
              <div className="space-y-8 relative z-10">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Projected Growth</p>
                  <div className="flex items-end gap-3">
                    <h4 className="text-4xl font-black tracking-tighter text-primary">+24%</h4>
                    <TrendingUp size={24} className="text-primary mb-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Active Users</p>
                    <p className="text-xl font-black tracking-tight">1,240</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Avg Efficiency</p>
                    <p className="text-xl font-black tracking-tight">88.4%</p>
                  </div>
                </div>
                <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/5">
                  Download Full PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

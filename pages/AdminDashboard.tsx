
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import api from '../lib/api';

const AdminDashboard: React.FC = () => {
  const [view, setView] = useState<'stats' | 'monitor'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Command Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Fleet Intelligence</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Enterprise Command Center</p>
        </div>
        <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <button 
            onClick={() => setView('stats')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'stats' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setView('monitor')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'monitor' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Live Monitor
          </button>
        </div>
      </div>

      {view === 'stats' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard 
              title="Total Collection" 
              value={stats.totalCollection} 
              icon="fa-wallet" 
              color="blue"
              trend={{ value: 12.5, label: 'vs last month' }}
            />
            <DashboardCard 
              title="Active Students" 
              value={stats.activeStudents} 
              icon="fa-user-graduate" 
              color="green"
            />
            <DashboardCard 
              title="Defaulters" 
              value={stats.defaulters} 
              icon="fa-user-clock" 
              color="orange"
              trend={{ value: -5, label: 'vs last month' }}
            />
            <DashboardCard 
              title="Late Fee Collected" 
              value={stats.lateFeeCollected} 
              icon="fa-hand-holding-usd" 
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Revenue Streams</h3>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">Actual Revenue</span>
                     </div>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      />
                      <Bar dataKey="revenue" fill="#1e40af" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <i className="fas fa-tools text-8xl text-white"></i>
                 </div>
                 <h3 className="font-black text-white uppercase tracking-widest text-[10px] mb-8">Quick Operations</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl hover:bg-white/10 transition-all gap-4 border border-white/5 group">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                          <i className="fas fa-user-tie text-white"></i>
                       </div>
                       <span className="text-[8px] font-black text-white/60 uppercase tracking-widest text-center">Assign Teachers</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl hover:bg-white/10 transition-all gap-4 border border-white/5 group">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-success group-hover:scale-110 transition-all">
                          <i className="fas fa-id-card text-white"></i>
                       </div>
                       <span className="text-[8px] font-black text-white/60 uppercase tracking-widest text-center">Driver Roster</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl hover:bg-white/10 transition-all gap-4 border border-white/5 group">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-warning group-hover:scale-110 transition-all">
                          <i className="fas fa-file-invoice-dollar text-white"></i>
                       </div>
                       <span className="text-[8px] font-black text-white/60 uppercase tracking-widest text-center">Batch Fees</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl hover:bg-white/10 transition-all gap-4 border border-white/5 group">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-danger group-hover:scale-110 transition-all">
                          <i className="fas fa-shield-alt text-white"></i>
                       </div>
                       <span className="text-[8px] font-black text-white/60 uppercase tracking-widest text-center">Audit Vault</span>
                    </button>
                 </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-8">Payment Health</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.paymentHealth}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {stats.paymentHealth.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4 mt-8">
                  {stats.paymentHealth.map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                      </div>
                      <span className="text-sm font-black text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute bottom-0 right-0 p-6 opacity-10">
                    <i className="fas fa-route text-6xl"></i>
                 </div>
                 <h4 className="font-black text-[10px] uppercase tracking-widest mb-6 text-white/60">Fleet Summary</h4>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest">Active Routes</span>
                       <span className="text-xl font-black">12</span>
                    </div>
                    <div className="h-px bg-white/10"></div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest">Total Buses</span>
                       <span className="text-xl font-black">18</span>
                    </div>
                    <div className="h-px bg-white/10"></div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest">Maintenance</span>
                       <span className="text-xl font-black text-warning">02</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center p-20 bg-white rounded-[3rem] border border-slate-200">
           <i className="fas fa-satellite text-5xl text-slate-200 mb-6"></i>
           <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Live Fleet Monitoring System Active</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

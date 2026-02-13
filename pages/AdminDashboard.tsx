
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
        // Mock fallback if API not ready
        setStats({
          totalCollection: "₹12.4L",
          activeStudents: 412,
          defaulters: 18,
          lateFeeCollected: "₹4,250",
          revenueTrend: [
            { month: 'Oct', revenue: 450000 },
            { month: 'Nov', revenue: 520000 },
            { month: 'Dec', revenue: 480000 },
            { month: 'Jan', revenue: 610000 },
            { month: 'Feb', revenue: 590000 },
            { month: 'Mar', revenue: 650000 },
          ],
          paymentHealth: [
            { name: 'Paid', value: 380, color: '#22c55e' },
            { name: 'Overdue', value: 18, color: '#f59e0b' },
            { name: 'Unpaid', value: 14, color: '#ef4444' },
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const fleetStatus = [
    { id: 'B101', route: 'North Zone', students: '38/42', speed: '42 km/h', status: 'On Time', location: 'Near Sector 45' },
    { id: 'B102', route: 'South City', students: '24/30', speed: '0 km/h', status: 'Delayed', location: 'Stuck in Traffic' },
    { id: 'B103', route: 'East Highland', students: '28/45', speed: '55 km/h', status: 'On Time', location: 'Main Highway' },
  ];

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
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Command Center</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Real-time Intelligence Hub</p>
        </div>
        <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <button 
            onClick={() => setView('stats')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'stats' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setView('monitor')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'monitor' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Live Fleet
          </button>
        </div>
      </div>

      {view === 'stats' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard title="Revenue (MTD)" value={stats.totalCollection} icon="fa-wallet" color="blue" trend={{ value: 12.5, label: 'growth' }} />
            <DashboardCard title="Boarding Manifest" value={stats.activeStudents} icon="fa-user-graduate" color="green" />
            <DashboardCard title="Fee Defaulters" value={stats.defaulters} icon="fa-user-clock" color="orange" trend={{ value: -5, label: 'improvement' }} />
            <DashboardCard title="Late Penalties" value={stats.lateFeeCollected} icon="fa-hand-holding-usd" color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                   <i className="fas fa-chart-line text-[200px] text-primary"></i>
                </div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Revenue Stream (Last 6 Months)</h3>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="revenue" fill="#1e40af" radius={[8, 8, 0, 0]} barSize={42} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl">
                 <h3 className="font-black text-white uppercase tracking-widest text-[10px] mb-8">Fleet Quick Actions</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Bulk Notifications', icon: 'fa-bullhorn', color: 'bg-blue-500' },
                      { label: 'Export Ledger', icon: 'fa-file-excel', color: 'bg-green-500' },
                      { label: 'Fleet Maintenance', icon: 'fa-tools', color: 'bg-orange-500' },
                      { label: 'Security Logs', icon: 'fa-shield-alt', color: 'bg-red-500' }
                    ].map(btn => (
                      <button key={btn.label} className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl hover:bg-white/10 transition-all gap-4 border border-white/5 group">
                         <div className={`w-12 h-12 ${btn.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <i className={`fas ${btn.icon} text-white`}></i>
                         </div>
                         <span className="text-[8px] font-black text-white/70 uppercase tracking-widest text-center leading-relaxed">{btn.label}</span>
                      </button>
                    ))}
                 </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-8">Payment Health</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.paymentHealth} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
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

              <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute bottom-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                    <i className="fas fa-bus-alt text-8xl"></i>
                 </div>
                 <h4 className="font-black text-[10px] uppercase tracking-widest mb-6 text-white/50">Fleet Snapshot</h4>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest">Active Routes</span>
                       <span className="text-2xl font-black">12</span>
                    </div>
                    <div className="h-px bg-white/10"></div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest">Vehicles Ready</span>
                       <span className="text-2xl font-black">16/18</span>
                    </div>
                    <div className="h-px bg-white/10"></div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest">GPS Health</span>
                       <span className="text-sm font-black text-success uppercase">Excellent</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fleetStatus.map(bus => (
              <div key={bus.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <i className="fas fa-map-marker-alt text-6xl text-primary"></i>
                </div>
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Bus {bus.id}</div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${bus.status === 'On Time' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {bus.status}
                  </span>
                </div>
                <h4 className="text-xl font-black text-slate-800 tracking-tight">{bus.route}</h4>
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Live Location</span>
                    <span className="text-xs font-bold text-slate-700">{bus.location}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Boarded</p>
                        <p className="text-sm font-black text-slate-800">{bus.students}</p>
                     </div>
                     <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Velocity</p>
                        <p className="text-sm font-black text-slate-800">{bus.speed}</p>
                     </div>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all">
                  Open Live Map View
                </button>
              </div>
            ))}
          </div>
          <div className="bg-slate-900 rounded-[3rem] p-20 text-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i14!2i9432!3i6154!2m3!1e0!2sm!3i633116543!3m17!2sen!3sUS!5e18!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!12m3!1e12!2m1!1s1e10!4e0!5m1!5f2')] bg-cover"></div>
             <div className="relative z-10">
                <i className="fas fa-satellite text-6xl text-white/20 mb-8 block"></i>
                <h3 className="text-2xl font-black text-white mb-4">Master Telemetry Stream</h3>
                <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.4em] max-w-sm mx-auto">Initializing encrypted global fleet coordinate system...</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

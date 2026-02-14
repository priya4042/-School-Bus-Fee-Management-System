
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import api from '../lib/api';

declare const L: any;

const AdminDashboard: React.FC = () => {
  const [view, setView] = useState<'stats' | 'monitor'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Relative path: 'dashboard/stats'
        const { data } = await api.get('dashboard/stats');
        setStats(data);
      } catch (err) {
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

  useEffect(() => {
    if (view === 'monitor' && !map) {
      const leafletMap = L.map('map').setView([28.6139, 77.2090], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMap);
      
      // Mock bus markers
      const busIcon = L.divIcon({
        className: 'custom-bus-icon',
        html: '<div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl border-2 border-white"><i class="fas fa-bus text-xs"></i></div>',
        iconSize: [40, 40]
      });

      L.marker([28.6139, 77.2090], { icon: busIcon }).addTo(leafletMap).bindPopup('<b>Bus B101</b><br>Route: North Zone<br>Speed: 42km/h');
      L.marker([28.6200, 77.2200], { icon: busIcon }).addTo(leafletMap).bindPopup('<b>Bus B102</b><br>Route: South City<br>Speed: 38km/h');
      
      setMap(leafletMap);
    }
  }, [view, map]);

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
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Command Center</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Fleet & Finance Intelligence</p>
        </div>
        <div className="flex p-1.5 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <button 
            onClick={() => setView('stats')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'stats' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setView('monitor')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'monitor' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Live Monitor
          </button>
        </div>
      </div>

      {view === 'stats' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard title="Revenue (MTD)" value={stats.totalCollection} icon="fa-wallet" color="blue" trend={{ value: 12.5, label: 'growth' }} />
            <DashboardCard title="Fleet Manifest" value={stats.activeStudents} icon="fa-user-graduate" color="green" />
            <DashboardCard title="Defaulter Risk" value={stats.defaulters} icon="fa-user-clock" color="orange" trend={{ value: -5, label: 'improvement' }} />
            <DashboardCard title="Late Penalties" value={stats.lateFeeCollected} icon="fa-hand-holding-usd" color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-premium overflow-hidden">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-10">Monthly Collection Flow</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="revenue" fill="#1e40af" radius={[12, 12, 0, 0]} barSize={42} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-premium">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-8 text-center">Payment Pulse</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.paymentHealth} cx="50%" cy="50%" innerRadius={75} outerRadius={110} paddingAngle={10} dataKey="value">
                        {stats.paymentHealth.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 gap-3 mt-10">
                  {stats.paymentHealth.map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                      </div>
                      <span className="text-sm font-black text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-[700px] flex flex-col gap-6">
           <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 shadow-premium overflow-hidden relative">
              <div id="map" className="z-10"></div>
              <div className="absolute top-6 left-6 z-20 space-y-3">
                 <div className="bg-slate-900/90 backdrop-blur-md text-white p-6 rounded-3xl border border-white/10 shadow-2xl max-w-xs">
                    <h4 className="font-black text-[10px] uppercase tracking-widest mb-4 text-white/50">Active Fleet Hub</h4>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">Vehicles Online</span>
                          <span className="text-lg font-black text-success">14 / 16</span>
                       </div>
                       <div className="h-px bg-white/10"></div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">Total Boarded</span>
                          <span className="text-lg font-black text-primary-light">312 Students</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

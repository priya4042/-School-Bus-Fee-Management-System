import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import AIInsights from '../components/Dashboard/AIInsights';
import api from '../lib/api';
import { useTracking } from '../hooks/useTracking';

declare const L: any;

const AdminDashboard: React.FC = () => {
  const [view, setView] = useState<'stats' | 'monitor'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<any>(null);
  const markerRef = useRef<any>(null);
  const { location } = useTracking('b1');

  useEffect(() => {
    const fetchStats = async () => {
      try {
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
            { name: 'Paid', value: 380, color: '#1e40af' },
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

  // Update marker position on location change
  useEffect(() => {
    if (map && location && markerRef.current) {
        markerRef.current.setLatLng([location.lat, location.lng]);
        map.panTo([location.lat, location.lng]);
    }
  }, [location, map]);

  useEffect(() => {
    if (view === 'monitor' && !map) {
      setTimeout(() => {
        const leafletMap = L.map('map').setView([32.0900, 76.2600], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(leafletMap);
        
        const busIcon = L.divIcon({
          className: 'custom-bus-icon',
          html: '<div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl border-2 border-white animate-pulse"><i class="fas fa-bus text-xs"></i></div>',
          iconSize: [40, 40]
        });

        const m = L.marker([32.0900, 76.2600], { icon: busIcon }).addTo(leafletMap).bindPopup('<b>Bus KNG-01-A</b>');
        markerRef.current = m;
        setMap(leafletMap);
      }, 100);
    }
  }, [view, map]);

  if (loading || !stats) {
    return (
      <div className="h-96 flex items-center justify-center">
        <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Operations Hub</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Global Fleet Intelligence</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
          <button onClick={() => setView('stats')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'stats' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}>Analytics</button>
          <button onClick={() => setView('monitor')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'monitor' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}>Live Monitor</button>
        </div>
      </div>

      {view === 'stats' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <DashboardCard title="Revenue (MTD)" value={stats.totalCollection} icon="fa-wallet" color="blue" />
              <DashboardCard title="Total Students" value={stats.activeStudents} icon="fa-user-graduate" color="green" />
              <DashboardCard title="Active Fleet" value="1/1" icon="fa-bus" color="orange" />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-10">Monthly Revenue Growth</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -10px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="revenue" fill="#1e40af" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <AIInsights />
          </div>
        </div>
      ) : (
        <div className="h-[600px] bg-white rounded-[3rem] border border-slate-200 shadow-premium overflow-hidden relative">
          <div id="map"></div>
          {location && (
            <div className="absolute bottom-10 left-10 z-[1000] bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 text-white min-w-[200px] animate-in slide-in-from-left-4">
                <p className="text-[9px] font-black uppercase text-success tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                    Live Signal: B101
                </p>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Velocity</span>
                        <span className="text-xl font-black tracking-tighter">{Math.round(location.speed)} KM/H</span>
                    </div>
                    <div className="h-px bg-white/5"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Satellite Ref</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">GPS_32N_76E</span>
                    </div>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
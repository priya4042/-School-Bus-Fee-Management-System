import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import AIInsights from '../components/Dashboard/AIInsights';
import Modal from '../components/Modal';
import api from '../lib/api';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/swal';
import { useTracking } from '../hooks/useTracking';
import { useBuses } from '../hooks/useBuses';
import BusCameraModal from '../components/BusCameraModal';
import GoogleMap from '../components/GoogleMap';

const AdminDashboard: React.FC = () => {
  const [view, setView] = useState<'stats' | 'monitor'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const { buses } = useBuses();
  const [activeBusId, setActiveBusId] = useState<string | null>(null);
  const { location } = useTracking(activeBusId || undefined);

  useEffect(() => {
    if (buses && buses.length > 0 && !activeBusId) {
      setActiveBusId(buses[0].id);
    }
  }, [buses, activeBusId]);

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
        <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setIsCameraOpen(true)}
            className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-slate-900 text-white shadow-lg flex items-center gap-2"
          >
            <i className="fas fa-video"></i>
            Live Cam
          </button>
          <div className="w-px h-6 bg-slate-100"></div>
          <button onClick={() => setView('stats')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'stats' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}>Analytics</button>
          <button onClick={() => setView('monitor')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'monitor' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}>Live Monitor</button>
        </div>
      </div>

      <BusCameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />

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
              <div style={{ width: '100%', height: 320 }}>
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
        <div className="h-[600px] bg-white rounded-[3rem] border border-slate-200 shadow-premium overflow-hidden relative z-0">
          <GoogleMap location={location} busId={activeBusId || undefined} />
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
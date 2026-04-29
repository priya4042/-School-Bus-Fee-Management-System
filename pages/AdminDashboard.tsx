import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import AIInsights from '../components/Dashboard/AIInsights';
import { supabase } from '../lib/supabase';
import { useTracking } from '../hooks/useTracking';
import { useBuses } from '../hooks/useBuses';
import BusCameraModal from '../components/BusCameraModal';
import GoogleMap from '../components/GoogleMap';
import MiniLoader from '../components/MiniLoader';

interface AdminDashboardProps {
  onOpenDocumentation?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenDocumentation }) => {
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
        const [{ data: students }, { data: dues }, { data: buses }] = await Promise.all([
          supabase.from('students').select('id'),
          supabase.from('monthly_dues').select('total_due, status, month, year'),
          supabase.from('buses').select('id, status'),
        ]);

        const allDues = dues || [];
        const paidDues = allDues.filter(d => d.status === 'PAID');
        const totalCollection = paidDues.reduce((sum, d) => sum + Number(d.total_due || 0), 0);
        const allBuses = buses || [];
        const activeBuses = allBuses.filter(b => b.status === 'active').length;

        const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const now = new Date();
        const revenueTrend = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const rev = paidDues
            .filter(due => Number(due.year) === d.getFullYear() && Number(due.month) === d.getMonth() + 1)
            .reduce((s, due) => s + Number(due.total_due || 0), 0);
          return { month: MONTH_NAMES[d.getMonth()], revenue: rev };
        });

        setStats({
          totalCollection: totalCollection >= 100000
            ? `₹${(totalCollection / 100000).toFixed(1)}L`
            : `₹${totalCollection.toLocaleString('en-IN')}`,
          activeStudents: (students || []).length,
          defaulters: allDues.filter(d => d.status === 'OVERDUE').length,
          activeBuses: `${activeBuses}/${allBuses.length}`,
          revenueTrend,
          paymentHealth: [
            { name: 'Paid', value: paidDues.length, color: '#1e40af' },
            { name: 'Overdue', value: allDues.filter(d => d.status === 'OVERDUE').length, color: '#f59e0b' },
            { name: 'Unpaid', value: allDues.filter(d => d.status === 'PENDING').length, color: '#ef4444' },
          ],
        });
      } catch (err) {
        console.error('Failed to load stats:', err);
        setStats({ totalCollection: '₹0', activeStudents: 0, defaulters: 0, activeBuses: '0/0', revenueTrend: [], paymentHealth: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);



  if (loading || !stats) {
    return (
      <div className="h-96 flex items-center justify-center">
        <MiniLoader />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4 mb-2 md:mb-8">
        <div>
          <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tighter">Operations Hub</h2>
          <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mt-1">Global Fleet Intelligence</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto scrollbar-hide">
          <button
            onClick={onOpenDocumentation}
            className="px-3 md:px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-primary text-white shadow-lg shadow-primary/20 flex items-center gap-2 flex-shrink-0"
          >
            <i className="fas fa-book-open"></i>
            <span className="hidden sm:inline">Docs</span>
          </button>
          <button
            onClick={() => setIsCameraOpen(true)}
            className="px-3 md:px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-slate-900 text-white shadow-lg flex items-center gap-2 flex-shrink-0"
          >
            <i className="fas fa-video"></i>
            <span className="hidden sm:inline">Live Cam</span>
          </button>
          <div className="w-px h-6 bg-slate-100 flex-shrink-0"></div>
          <button onClick={() => setView('stats')} className={`px-3 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${view === 'stats' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}>Analytics</button>
          <button onClick={() => setView('monitor')} className={`px-3 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${view === 'monitor' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}><span className="hidden sm:inline">Live Monitor</span><span className="sm:hidden">Live</span></button>
        </div>
      </div>

      <BusCameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />

      {view === 'stats' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            <div className="grid grid-cols-3 gap-2 md:gap-6">
              <DashboardCard title="Revenue" value={stats.totalCollection} icon="fa-wallet" color="blue" />
              <DashboardCard title="Students" value={stats.activeStudents} icon="fa-user-graduate" color="green" />
              <DashboardCard title="Fleet" value={stats.activeBuses} icon="fa-bus" color="orange" />
            </div>

            <div className="bg-white p-3 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-4 md:mb-10">Monthly Revenue Growth</h3>
              <div style={{ width: '100%', height: 240 }} className="md:!h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenueTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -10px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="revenue" fill="#1e40af" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            <AIInsights />
          </div>
        </div>
      ) : (
        <div className="h-[400px] md:h-[600px] bg-white rounded-2xl md:rounded-[3rem] border border-slate-200 shadow-premium overflow-hidden relative z-0">
          <GoogleMap location={location} busId={activeBusId || undefined} />
          {location && (
            <div className="absolute bottom-4 left-4 right-4 md:bottom-10 md:left-10 md:right-auto z-[1000] bg-slate-900/90 backdrop-blur-xl p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 text-white md:min-w-[200px] animate-in slide-in-from-left-4">
                <p className="text-[9px] font-black uppercase text-success tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                    Live Signal: B101
                </p>
                <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Velocity</span>
                        <span className="text-lg md:text-xl font-black tracking-tighter">{Math.round(location.speed)} KM/H</span>
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
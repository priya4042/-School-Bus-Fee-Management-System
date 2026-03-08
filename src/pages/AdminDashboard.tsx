
import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';
import AIInsights from '../components/Dashboard/AIInsights';
import { api } from '../lib/api';
import { 
  Users, 
  Bus, 
  Route as RouteIcon, 
  CreditCard, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const revenueData = [
    { name: 'Jan', amount: 45000 },
    { name: 'Feb', amount: 52000 },
    { name: 'Mar', amount: 48000 },
    { name: 'Apr', amount: 61000 },
    { name: 'May', amount: 55000 },
    { name: 'Jun', amount: 67000 },
  ];

  const attendanceData = [
    { name: 'Mon', present: 145, absent: 5 },
    { name: 'Tue', present: 142, absent: 8 },
    { name: 'Wed', present: 148, absent: 2 },
    { name: 'Thu', present: 140, absent: 10 },
    { name: 'Fri', present: 138, absent: 12 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Command Center</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Enterprise Fleet Intelligence</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div className="pr-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
            <p className="text-[10px] font-black text-emerald-600 uppercase">All Systems Operational</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Students" 
          value={stats?.totalStudents || 150} 
          icon="fa-user-graduate" 
          color="blue"
          trend={{ value: 12, label: 'vs last month' }}
        />
        <DashboardCard 
          title="Active Buses" 
          value={stats?.activeBuses || 8} 
          icon="fa-bus" 
          color="green"
        />
        <DashboardCard 
          title="Revenue (MTD)" 
          value={`₹${(stats?.revenue || 85400).toLocaleString()}`} 
          icon="fa-indian-rupee-sign" 
          color="orange"
          trend={{ value: 8, label: 'growth' }}
        />
        <DashboardCard 
          title="Defaulters" 
          value={stats?.defaulters || 12} 
          icon="fa-exclamation-circle" 
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Revenue Analytics</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Financial Performance Overview</p>
              </div>
              <select className="bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-2 focus:ring-2 ring-primary/20 outline-none">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
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
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Attendance Trends</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Weekly Student Presence</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Absent</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
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
                  <Bar dataKey="present" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={30} />
                  <Bar dataKey="absent" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <AIInsights />
          
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full -mr-10 -mt-10 blur-2xl"></div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-6 relative z-10">Recent Activity</h3>
            <div className="space-y-6 relative z-10">
              {[1, 2, 3, 4].map((_, idx) => (
                <div key={idx} className="flex gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs group-hover:bg-primary/20 transition-colors">
                    <CheckCircle2 size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white/90">Fee payment received for Rahul Sharma</p>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">2 mins ago</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
              View All Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

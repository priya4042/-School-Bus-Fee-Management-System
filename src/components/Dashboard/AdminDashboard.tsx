import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, 
  Users, 
  Map as MapIcon, 
  CreditCard, 
  Settings, 
  Bell, 
  LogOut,
  Shield,
  TrendingUp,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Navigation,
  Camera,
  Video,
  Sun,
  Moon,
  Loader2,
  DollarSign,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import StudentManagement from './Admin/StudentManagement';
import BusManagement from './Admin/BusManagement';
import RouteManagement from './Admin/RouteManagement';
import PaymentManagement from './Admin/PaymentManagement';
import WaiverRequests from './Admin/WaiverRequests';
import LiveTracking from './Admin/LiveTracking';
import CameraMonitoring from './Admin/CameraMonitoring';

const stats = [
  { label: 'Active Buses', value: '3', icon: Bus, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Total Students', value: '64', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'Revenue (MTD)', value: '₹1.6L', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' },
  { label: 'Active Routes', value: '5', icon: MapIcon, color: 'text-amber-500', bg: 'bg-amber-50' },
];

const revenueData = [
  { name: 'Jan', revenue: 120000 },
  { name: 'Feb', revenue: 145000 },
  { name: 'Mar', revenue: 160000 },
  { name: 'Apr', revenue: 155000 },
  { name: 'May', revenue: 180000 },
  { name: 'Jun', revenue: 160000 },
];

const busOccupancyData = [
  { bus: 'Bus 101', students: 45 },
  { bus: 'Bus 102', students: 38 },
  { bus: 'Bus 103', students: 52 },
  { bus: 'Bus 104', students: 30 },
  { bus: 'Bus 105', students: 42 },
];

const paymentStatusData = [
  { name: 'Paid', value: 65 },
  { name: 'Pending', value: 25 },
  { name: 'Overdue', value: 10 },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalBuses: 0,
    totalRoutes: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    overdueRevenue: 0,
    revenueData: [],
    busOccupancyData: [],
    paymentStatusData: []
  });

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab]);

  const dashboardStats = [
    { label: 'Total Students', value: stats.totalStudents.toString(), icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Active Buses', value: stats.totalBuses.toString(), icon: Bus, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Revenue (MTD)', value: `₹${(stats.totalRevenue / 1000).toFixed(1)}k`, icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Pending Fees', value: `₹${(stats.pendingRevenue / 1000).toFixed(1)}k`, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/admin/login');
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'buses', label: 'Fleet', icon: Bus },
    { id: 'routes', label: 'Routes', icon: MapIcon },
    { id: 'tracking', label: 'Live Tracking', icon: Navigation },
    { id: 'camera', label: 'Surveillance', icon: Camera },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'waivers', label: 'Waiver Requests', icon: AlertCircle },
  ];

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 h-screen w-72 border-r z-50 transition-transform duration-300 md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'} flex flex-col`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">
              <Bus size={28} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tighter text-zinc-900 dark:text-white">BusWay <span className="text-emerald-500">Pro</span></h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Enterprise</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-zinc-500">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-6 space-y-1.5 mt-4 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : `hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400`
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'group-hover:text-zinc-900 dark:group-hover:text-white'} />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className={`h-20 border-b flex items-center justify-between px-6 md:px-10 shrink-0 ${isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold capitalize text-zinc-900 dark:text-white">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
              <button 
                onClick={() => setIsDarkMode(false)}
                className={`p-2 rounded-lg transition-all ${!isDarkMode ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
              >
                <Sun size={18} />
              </button>
              <button 
                onClick={() => setIsDarkMode(true)}
                className={`p-2 rounded-lg transition-all ${isDarkMode ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500'}`}
              >
                <Moon size={18} />
              </button>
            </div>
            
            <button className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 relative text-zinc-600 dark:text-zinc-400 transition-all">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
            </button>
            
            <div className="flex items-center gap-4 pl-6 border-l border-zinc-200 dark:border-zinc-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Administrator</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Super User</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-zinc-800 shadow-md">
                <img src="https://picsum.photos/seed/admin/100/100" alt="Avatar" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-10">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {dashboardStats.map((stat, i) => (
                      <div key={i} className={`p-8 rounded-3xl border transition-all hover:shadow-xl hover:-translate-y-1 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-3xl font-bold mt-2 text-zinc-900 dark:text-white">{stat.value}</h3>
                          </div>
                          <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                            <stat.icon size={28} />
                          </div>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-xs text-emerald-500 font-bold">
                          <TrendingUp size={16} />
                          <span>+12.5% growth</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Revenue Performance</h3>
                        <TrendingUp className="text-emerald-500" size={20} />
                      </div>
                      <div className="h-80" style={{ minHeight: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} key={`revenue-${isDarkMode}`}>
                          <AreaChart data={stats.revenueData && stats.revenueData.length > 0 ? stats.revenueData : revenueData}>
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#333' : '#eee'} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: isDarkMode ? '#18181b' : '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Bus Occupancy</h3>
                        <Bus className="text-indigo-500" size={20} />
                      </div>
                      <div className="h-80" style={{ minHeight: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} key={`occupancy-${isDarkMode}`}>
                          <BarChart data={stats.busOccupancyData && stats.busOccupancyData.length > 0 ? stats.busOccupancyData : busOccupancyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#333' : '#eee'} />
                            <XAxis dataKey="bus" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                            <Tooltip 
                              cursor={{fill: isDarkMode ? '#27272a' : '#f8fafc'}}
                              contentStyle={{ backgroundColor: isDarkMode ? '#18181b' : '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="students" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className={`p-8 rounded-3xl border lg:col-span-1 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
                      <h3 className="text-xl font-bold mb-8">Payment Distribution</h3>
                      <div className="h-64" style={{ minHeight: '256px' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} key={`distribution-${isDarkMode}`}>
                          <PieChart>
                            <Pie
                              data={stats.paymentStatusData && stats.paymentStatusData.length > 0 ? stats.paymentStatusData : paymentStatusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {paymentStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col gap-3 mt-6">
                        {(stats.paymentStatusData && stats.paymentStatusData.length > 0 ? stats.paymentStatusData : paymentStatusData).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx]}} />
                              <span className="text-sm font-medium text-zinc-500">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`p-8 rounded-3xl border lg:col-span-2 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Recent Activity</h3>
                        <Activity className="text-emerald-500" size={20} />
                      </div>
                      <div className="space-y-6">
                        {[
                          { title: 'New student registered: Admission #105', time: '12 mins ago', type: 'success' },
                          { title: 'Payment received: ₹2,500 from Parent ID #42', time: '45 mins ago', type: 'success' },
                          { title: 'Bus 102 reported delay: 15 mins', time: '1 hour ago', type: 'warning' },
                          { title: 'Camera stream offline: Bus 204', time: '3 hours ago', type: 'error' },
                        ].map((activity, idx) => (
                          <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-4">
                              <div className={`w-2.5 h-2.5 rounded-full ${
                                activity.type === 'warning' ? 'bg-amber-500' : 
                                activity.type === 'success' ? 'bg-emerald-500' : 
                                activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                              }`} />
                              <p className="text-sm font-bold">{activity.title}</p>
                            </div>
                            <span className="text-xs text-zinc-400 font-medium">{activity.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'students' && <StudentManagement isDarkMode={isDarkMode} />}
              {activeTab === 'buses' && <BusManagement isDarkMode={isDarkMode} />}
              {activeTab === 'routes' && <RouteManagement isDarkMode={isDarkMode} />}
              {activeTab === 'tracking' && <LiveTracking isDarkMode={isDarkMode} />}
              {activeTab === 'camera' && <CameraMonitoring isDarkMode={isDarkMode} />}
              {activeTab === 'payments' && <PaymentManagement isDarkMode={isDarkMode} />}
              {activeTab === 'waivers' && <WaiverRequests isDarkMode={isDarkMode} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

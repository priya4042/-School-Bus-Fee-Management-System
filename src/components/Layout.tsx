
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Bus, 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  BarChart3, 
  Route as RouteIcon, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  User,
  ShieldCheck,
  MapPin,
  Video,
  BellRing,
  HelpCircle,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';

const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const adminMenuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Attendance', path: '/attendance', icon: History },
    { name: 'User Directory', path: '/directory', icon: Users },
    { name: 'Routes', path: '/routes', icon: RouteIcon },
    { name: 'Buses', path: '/buses', icon: Bus },
    { name: 'Fees', path: '/fees', icon: CreditCard },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Notifications', path: '/admin-notifications', icon: Bell },
    { name: 'Audit Logs', path: '/audit-logs', icon: History },
    { name: 'Admin Management', path: '/admin-management', icon: ShieldCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const parentMenuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Student Profile', path: '/parent/profile', icon: User },
    { name: 'Fee History', path: '/parent/fees', icon: History },
    { name: 'Boarding Points', path: '/parent/locations', icon: MapPin },
    { name: 'Live Vision', path: '/parent/camera', icon: Video },
    { name: 'Alerts', path: '/parent/notifications', icon: BellRing },
    { name: 'Support', path: '/parent/support', icon: HelpCircle },
    { name: 'Settings', path: '/parent/settings', icon: Settings },
  ];

  const menuItems = (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) 
    ? adminMenuItems.filter(item => item.name !== 'Admin Management' || user.role === UserRole.SUPER_ADMIN)
    : parentMenuItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 320 : 100 }}
        className="bg-slate-950 text-white flex flex-col relative z-30 shadow-2xl"
      >
        <div className="p-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <Bus size={28} className="text-white" />
            </div>
            {isSidebarOpen && (
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-black tracking-tighter uppercase"
              >
                BusWay Pro
              </motion.h1>
            )}
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all group relative ${
                  isActive 
                    ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={24} className={isActive ? 'text-white' : 'group-hover:text-primary transition-colors'} />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[11px] font-black uppercase tracking-widest"
                  >
                    {item.name}
                  </motion.span>
                )}
                {isActive && isSidebarOpen && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className={`p-6 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col gap-6 ${!isSidebarOpen && 'items-center'}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <User size={24} />
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-tight truncate">{user?.full_name || 'User'}</p>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest truncate">{user?.role || 'Role'}</p>
                </div>
              )}
            </div>
            <button 
              onClick={handleLogout}
              className={`flex items-center gap-4 p-4 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all group ${!isSidebarOpen && 'justify-center'}`}
            >
              <LogOut size={20} />
              {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-12 relative z-20">
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Global Search (Students, Routes, Payments...)" 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-14 text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all placeholder:text-slate-300"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400">⌘</span>
                <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400">K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all relative group">
              <Bell size={24} />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full group-hover:scale-125 transition-transform"></span>
            </button>
            <div className="h-10 w-px bg-slate-100"></div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{user?.full_name}</p>
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{user?.role}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20">
                <ShieldCheck size={24} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-12 scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;


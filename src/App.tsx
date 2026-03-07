
import React, { useState, useEffect } from 'react';
import { UserRole, User } from './types.ts';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import ParentDashboard from './pages/ParentDashboard.tsx';
import Students from './pages/Students.tsx';
import Fees from './pages/Fees.tsx';
import Reports from './pages/Reports.tsx';
import Routes from './pages/Routes.tsx';
import Buses from './pages/Buses.tsx';
import Settings from './pages/Settings.tsx';
import Receipts from './pages/Receipts.tsx';
import Profile from './pages/Profile.tsx';
import Attendance from './pages/Attendance.tsx';
import Payments from './pages/Payments.tsx';
import AdminNotifications from './pages/AdminNotifications.tsx';
import Notifications from './pages/Notifications.tsx';
import AuditLogs from './pages/AuditLogs.tsx';
import AdminManagement from './pages/AdminManagement.tsx';
import UserDirectory from './pages/UserDirectory.tsx';
import Sidebar from './components/Sidebar.tsx';
import Topbar from './components/Topbar.tsx';
import { useAuthStore } from './store/authStore.ts';
import { isSupabaseConfigured } from './lib/supabase.ts';

import Privacy from './pages/Privacy.tsx';
import Terms from './pages/Terms.tsx';
import ForgotPassword from './pages/ForgotPassword.tsx';

const App: React.FC = () => {
  const { user, init, logout, loading, initialized } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerRole, setRegisterRole] = useState<UserRole | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle URL routes for Privacy/Terms/ForgotPassword
  const path = window.location.pathname;
  if (path === '/privacy') return <Privacy />;
  if (path === '/terms') return <Terms />;
  if (path === '/forgot-password') return <ForgotPassword />;

  useEffect(() => {
    if (isSupabaseConfigured) {
      init();
    }
  }, [init]);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-danger/10 text-danger rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase mb-4">Configuration Required</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed mb-8">
            Supabase environment variables are missing. Please configure <code className="text-primary">VITE_SUPABASE_URL</code> and <code className="text-primary">VITE_SUPABASE_ANON_KEY</code> in your environment.
          </p>
          <div className="bg-black/40 rounded-2xl p-4 text-left border border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Instructions:</p>
            <ul className="text-[10px] text-slate-400 space-y-2 font-bold uppercase tracking-tight">
              <li>1. Open Vercel Dashboard</li>
              <li>2. Go to Project Settings &gt; Environment Variables</li>
              <li>3. Add the required keys</li>
              <li>4. Redeploy the application</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Initializing School Bus WayPro Hub</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (isRegistering) {
      return <Register onRegister={() => {}} onBackToLogin={() => setIsRegistering(false)} initialRole={registerRole} />;
    }
    return <Login onLogin={() => {}} onGoToRegister={(role) => { setRegisterRole(role); setIsRegistering(true); }} />;
  }

  const renderContent = () => {
    const role = user.role;
    if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
      switch (activeTab) {
        case 'Dashboard': return <AdminDashboard />;
        case 'Students': return <Students />;
        case 'Routes': return <Routes />;
        case 'Buses': return <Buses />;
        case 'Fees': return <Fees />;
        case 'Reports': return <Reports />;
        case 'Settings': return <Settings />;
        case 'Attendance': return <Attendance />;
        case 'Notifications': return <AdminNotifications />;
        case 'Audit Logs': return <AuditLogs />;
        case 'Bus admins': return <AdminManagement />;
        case 'User Directory': return <UserDirectory />;
        default: return <AdminDashboard />;
      }
    } 
    
    if (role === UserRole.PARENT) {
      switch (activeTab) {
        case 'Dashboard': return <ParentDashboard user={user} />;
        case 'Payments': return <Payments user={user} />;
        case 'Receipts': return <Receipts user={user} />;
        case 'Notifications': return <Notifications user={user} />;
        case 'Profile': return <Profile user={user} />;
        default: return <ParentDashboard user={user} />;
      }
    }

    return <AdminDashboard />;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar 
        user={user} 
        onLogout={logout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="p-4 md:p-8 flex-1 overflow-auto bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;


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

import Privacy from './pages/Privacy.tsx';
import Terms from './pages/Terms.tsx';

const App: React.FC = () => {
  const { user, init, logout, loading, initialized } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerRole, setRegisterRole] = useState<UserRole | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle URL routes for Privacy/Terms
  const path = window.location.pathname;
  if (path === '/privacy') return <Privacy />;
  if (path === '/terms') return <Terms />;

  useEffect(() => {
    init();
  }, [init]);

  if (!initialized || (loading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Establishing Secure Cloud Tunnel</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (isRegistering) {
      return <Register onRegister={() => init()} onBackToLogin={() => setIsRegistering(false)} initialRole={registerRole} />;
    }
    return <Login onLogin={() => init()} onGoToRegister={(role) => { setRegisterRole(role); setIsRegistering(true); }} />;
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
        case 'Admins': return <AdminManagement />;
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

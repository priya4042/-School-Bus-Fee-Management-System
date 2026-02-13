
import React, { useState, useEffect } from 'react';
import { UserRole, User } from './types';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AccountantDashboard from './pages/AccountantDashboard';
import Students from './pages/Students';
import Fees from './pages/Fees';
import Reports from './pages/Reports';
import Routes from './pages/Routes';
import Buses from './pages/Buses';
import Settings from './pages/Settings';
import Receipts from './pages/Receipts';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import Payments from './pages/Payments';
import AdminNotifications from './pages/AdminNotifications';
import Notifications from './pages/Notifications';
import AuditLogs from './pages/AuditLogs';
import AdminManagement from './pages/AdminManagement';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { useAuthStore } from './store/authStore';

const App: React.FC = () => {
  const { user, setUser, logout, loading, setLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerRole, setRegisterRole] = useState<UserRole | undefined>();

  useEffect(() => {
    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(err => {
          console.error('ServiceWorker registration failed: ', err);
        });
      });
    }

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Normalize name property
        if (parsed.full_name && !parsed.fullName) {
          parsed.fullName = parsed.full_name;
        }
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse saved user", e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, [setUser, setLoading]);

  const handleLogin = (userData: User) => {
    // Normalize before saving
    if (userData.full_name && !userData.fullName) {
      userData.fullName = userData.full_name;
    }
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setActiveTab('Dashboard');
    setIsRegistering(false);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setActiveTab('Dashboard');
  };

  const handleGoToRegister = (role?: UserRole) => {
    setRegisterRole(role);
    setIsRegistering(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Initializing BusWay Pro</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (isRegistering) {
      return <Register onRegister={handleLogin} onBackToLogin={() => setIsRegistering(false)} initialRole={registerRole} />;
    }
    return <Login onLogin={handleLogin} onGoToRegister={handleGoToRegister} />;
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

    if (role === UserRole.TEACHER) {
      switch (activeTab) {
        case 'Dashboard': return <TeacherDashboard user={user} />;
        case 'Attendance': return <Attendance />;
        case 'Profile': return <Profile user={user} />;
        default: return <TeacherDashboard user={user} />;
      }
    }

    if (role === UserRole.DRIVER) {
      switch (activeTab) {
        case 'Dashboard': return <DriverDashboard user={user} />;
        case 'Attendance': return <Attendance />;
        case 'Profile': return <Profile user={user} />;
        default: return <DriverDashboard user={user} />;
      }
    }

    if (role === UserRole.ACCOUNTANT) {
      switch (activeTab) {
        case 'Dashboard': return <AccountantDashboard />;
        case 'Reports': return <Reports />;
        case 'Fees': return <Fees />;
        default: return <AccountantDashboard />;
      }
    }

    return <div className="p-8 text-center text-slate-500">Access Denied</div>;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 selection:bg-primary/10">
      <Sidebar user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} />
        <main className="p-4 md:p-8 flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

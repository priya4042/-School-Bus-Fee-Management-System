
import React, { useState, useEffect } from 'react';
import { UserRole, User } from './types';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ParentDashboard from './pages/ParentDashboard';
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
import UserDirectory from './pages/UserDirectory';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { useAuthStore } from './store/authStore';
import { isSupabaseConfigured } from './lib/supabase';

import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ForgotPassword from './pages/ForgotPassword';

import BoardingLocations from './pages/parent/BoardingLocations';
import BusCamera from './pages/parent/BusCamera';

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
    // Initialize auth store regardless of Supabase config to allow UI to render
    init();
  }, [init]);

  // Supabase configuration check removed to allow app to render


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
        case 'Boarding Points': return <BoardingLocations user={user} />;
        case 'Bus Camera': return <BusCamera user={user} />;
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

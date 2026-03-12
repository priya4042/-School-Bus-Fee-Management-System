
import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
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
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import AdminPayments from './pages/AdminPayments';
import AdminNotifications from './pages/AdminNotifications';
import Notifications from './pages/Notifications';
import AuditLogs from './pages/AuditLogs';
import AdminManagement from './pages/AdminManagement';
import UserDirectory from './pages/UserDirectory';
import Permissions from './pages/Permissions';
import LiveTracking from './pages/LiveTracking';
import BusCameraAdmin from './pages/BusCameraAdmin';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { useAuthStore } from './store/authStore';
import { isSupabaseConfigured } from './lib/supabase';

import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ForgotPassword from './pages/ForgotPassword';

import BoardingLocations from './pages/parent/BoardingLocations';
import BusCamera from './pages/parent/BusCamera';
import FeeHistory from './pages/parent/FeeHistory';
import ParentNotifications from './pages/parent/Notifications';
import ParentSettings from './pages/parent/Settings';
import StudentProfile from './pages/parent/StudentProfile';
import Support from './pages/parent/Support';
import AttendanceHistory from './pages/parent/AttendanceHistory';
import ParentRoutes from './pages/parent/Routes';
import ParentLiveTracking from './pages/parent/LiveTracking';

const App: React.FC = () => {
  const { user, init, logout, loading, initialized } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | undefined>(undefined);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerRole, setRegisterRole] = useState<UserRole | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Initialize auth store regardless of Supabase config to allow UI to render
    init();
  }, [init]);

  const renderContent = () => {
    const role = user?.role;
    if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
      switch (activeTab) {
        case 'Dashboard': return <AdminDashboard />;
        case 'Students': return <Students />;
        case 'Routes': return <Routes />;
        case 'Buses': return <Buses />;
        case 'Fees': return <Fees />;
        case 'Payments': return <AdminPayments />;
        case 'Reports': return <Reports />;
        case 'Settings': return <Settings />;
        case 'Attendance': return <Attendance />;
        case 'Notifications': return <AdminNotifications focusNotificationId={selectedNotificationId} onFocusHandled={() => setSelectedNotificationId(undefined)} />;
        case 'Audit Logs': return <AuditLogs />;
        case 'Bus admins': return <AdminManagement />;
        case 'User Directory': return <UserDirectory />;
        case 'Permissions': return <Permissions />;
        case 'Live Tracking': return <LiveTracking />;
        case 'Bus Camera': return <BusCameraAdmin />;
        default: return <AdminDashboard />;
      }
    } 
    
    if (role === UserRole.PARENT) {
      switch (activeTab) {
        case 'Dashboard': return <ParentDashboard user={user!} />;
        case 'Attendance History': return <AttendanceHistory user={user!} />;
        case 'Live Tracking': return <ParentLiveTracking user={user!} />;
        case 'Routes': return <ParentRoutes user={user!} />;
        case 'Boarding Points': return <BoardingLocations user={user!} />;
        case 'Bus Camera': return (user as any).preferences?.camera === true ? <BusCamera user={user!} /> : <ParentDashboard user={user!} />;
        case 'Payments': return <FeeHistory user={user!} />;
        case 'Fees': return <FeeHistory user={user!} />;
        case 'Notifications': return <ParentNotifications user={user!} focusNotificationId={selectedNotificationId} onFocusHandled={() => setSelectedNotificationId(undefined)} />;
        case 'Receipts': return <FeeHistory user={user!} />;
        case 'Profile': return <Profile user={user!} />;
        case 'Settings': return <ParentSettings user={user!} />;
        case 'Student Profile': return <StudentProfile user={user!} />;
        case 'Support': return <Support user={user!} />;
        default: return <ParentDashboard user={user!} />;
      }
    }

    return <AdminDashboard />;
  };

  return (
    <BrowserRouter>
      {(() => {
        // Handle URL routes for Privacy/Terms/ForgotPassword inside BrowserRouter context
        const path = window.location.pathname;
        if (path === '/privacy') return <Privacy />;
        if (path === '/terms') return <Terms />;
        if (path === '/forgot-password') return <ForgotPassword />;

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
              <Topbar
                user={user}
                onMenuClick={() => setIsSidebarOpen(true)}
                onOpenNotifications={(notificationId) => {
                  setSelectedNotificationId(notificationId);
                  setActiveTab('Notifications');
                }}
              />
              <main className="p-4 md:p-8 flex-1 overflow-auto bg-slate-50">
                <div className="max-w-7xl mx-auto">
                  {renderContent()}
                </div>
              </main>
            </div>
          </div>
        );
      })()}
    </BrowserRouter>
  );
};

export default App;

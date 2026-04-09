
import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { UserRole, User } from './types';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ParentDashboard from './pages/ParentDashboard';
import Students from './pages/Students';
import Reports from './pages/Reports';
import Routes from './pages/Routes';
import Buses from './pages/Buses';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import AdminPayments from './pages/AdminPayments';
import AdminNotifications from './pages/AdminNotifications';
import AuditLogs from './pages/AuditLogs';
import AdminManagement from './pages/AdminManagement';
import UserDirectory from './pages/UserDirectory';
import LiveTracking from './pages/LiveTracking';
import Documentation from './pages/Documentation';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import SupportChat from './components/SupportChat';
import AppLoader from './components/AppLoader';
import BottomTabs from './components/BottomTabs';
import { useAuthStore } from './store/authStore';
import { isSupabaseConfigured } from './lib/supabase';

import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ForgotPassword from './pages/ForgotPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import DataProtection from './pages/DataProtection';
import CookiePolicy from './pages/CookiePolicy';
import HelpSupport from './pages/HelpSupport';
import ContactUs from './pages/ContactUs';
import RefundPolicy from './pages/RefundPolicy';
import ShippingPolicy from './pages/ShippingPolicy';

import BusCamera from './pages/parent/BusCamera';
import FeeHistory from './pages/parent/FeeHistory';
import ParentNotifications from './pages/parent/Notifications';
import ParentSettings from './pages/parent/Settings';
import StudentProfile from './pages/parent/StudentProfile';
import Support from './pages/parent/Support';
import Receipts from './pages/Receipts';
import AttendanceHistory from './pages/parent/AttendanceHistory';
import ParentRoutes from './pages/parent/Routes';
import ParentLiveTracking from './pages/parent/LiveTracking';

const getAllowedTabs = (user?: User | null) => {
  const role = user?.role;
  if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
    return [
      'Dashboard',
      'Students',
      'Buses',
      'Payments',
      'Settings',
      'Attendance',
      'Notifications',
      'Bus admins',
      'Live Tracking',
      'Documentation',
      'Support',
    ];
  }

  if (role === UserRole.PARENT) {
    const trackingEnabled = (user as any)?.preferences?.tracking === true;
    const cameraEnabled = (user as any)?.preferences?.camera === true;
    return [
      'Dashboard',
      'Attendance History',
      'Routes',
      ...(trackingEnabled ? ['Live Tracking'] : []),
      ...(cameraEnabled ? ['Bus Camera'] : []),
      'Payments',
      'Fees',
      'Notifications',
      'Receipts',
      'Profile',
      'Settings',
      'Settings_lang',
      'Student Profile',
      'Support',
      'Support_faq',
    ];
  }

  return ['Dashboard'];
};

const getTabStorageKey = (user?: User | null) => {
  if (!user?.id || !user?.role) return '';
  return `sbwp_active_tab_${user.role}_${user.id}`;
};

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

  useEffect(() => {
    if (!user?.id || !user?.role) return;
    setActiveTab('Dashboard');
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!user?.id || !user?.role || !activeTab) return;
    const allowedTabs = getAllowedTabs(user);
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab('Dashboard');
      return;
    }
    const key = getTabStorageKey(user);
    if (key) {
      window.localStorage.setItem(key, activeTab);
    }
  }, [activeTab, user?.id, user?.role]);

  const renderContent = () => {
    const role = user?.role;
    if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
      switch (activeTab) {
        case 'Dashboard': return <AdminDashboard onOpenDocumentation={() => setActiveTab('Documentation')} />;
        case 'Students': return <Students />;
        case 'Routes': return <Buses />;
        case 'Buses': return <Buses />;
        case 'Payments': return <AdminPayments />;
        case 'Reports': return <AdminPayments />;
        case 'Settings': return <Settings />;
        case 'Attendance': return <Attendance />;
        case 'Notifications': return <AdminNotifications focusNotificationId={selectedNotificationId} onFocusHandled={() => setSelectedNotificationId(undefined)} />;
        case 'Audit Logs': return <AdminNotifications focusNotificationId={selectedNotificationId} onFocusHandled={() => setSelectedNotificationId(undefined)} />;
        case 'Bus admins': return <AdminManagement />;
        case 'User Directory': return <Settings />;
        case 'Live Tracking': return <LiveTracking />;
        case 'Documentation': return <Documentation />;
        case 'Support': return <Support user={user!} onOpenDocumentation={() => setActiveTab('Documentation')} />;
        default: return <AdminDashboard onOpenDocumentation={() => setActiveTab('Documentation')} />;
      }
    } 
    
    if (role === UserRole.PARENT) {
      const trackingEnabled = (user as any)?.preferences?.tracking === true;
      switch (activeTab) {
        case 'Dashboard': return <ParentDashboard user={user!} />;
        case 'Attendance History': return <AttendanceHistory user={user!} />;
        case 'Live Tracking': return trackingEnabled ? <ParentLiveTracking user={user!} /> : <ParentDashboard user={user!} />;
        case 'Routes': return <ParentRoutes user={user!} />;
        case 'Bus Camera': return (user as any).preferences?.camera === true ? <BusCamera user={user!} /> : <ParentDashboard user={user!} />;
        case 'Payments': return <FeeHistory user={user!} />;
        case 'Fees': return <FeeHistory user={user!} />;
        case 'Notifications': return <ParentNotifications user={user!} focusNotificationId={selectedNotificationId} onFocusHandled={() => setSelectedNotificationId(undefined)} />;
        case 'Receipts': return <Receipts user={user!} />;
        case 'Profile': return <ParentSettings user={user!} section="profile" />;
        case 'Settings': return <ParentSettings user={user!} section="security" />;
        case 'Settings_lang': return <ParentSettings user={user!} section="language" />;
        case 'Student Profile': return <StudentProfile user={user!} />;
        case 'Support': return <Support user={user!} section="ticket" />;
        case 'Support_faq': return <Support user={user!} section="faq" />;
        default: return <ParentDashboard user={user!} />;
      }
    }

    return <AdminDashboard onOpenDocumentation={() => setActiveTab('Documentation')} />;
  };

  return (
    <BrowserRouter>
      {(() => {
        // Handle URL routes for Privacy/Terms/ForgotPassword inside BrowserRouter context
        const path = window.location.pathname;
        if (path === '/privacy') return <PrivacyPolicy />;
        if (path === '/terms') return <Terms />;
        if (path === '/privacy-policy') return <PrivacyPolicy />;
        if (path === '/terms-of-service') return <TermsOfService />;
        if (path === '/data-protection') return <DataProtection />;
        if (path === '/cookie-policy') return <CookiePolicy />;
        if (path === '/help-support') return <HelpSupport />;
        if (path === '/contact-us') return <ContactUs />;
        if (path === '/refund-policy') return <RefundPolicy />;
        if (path === '/shipping-policy') return <ShippingPolicy />;
        if (path === '/forgot-password') return <ForgotPassword />;

        if (!initialized) {
          return <AppLoader />;
        }

        if (!user) {
          if (isRegistering) {
            return <Register onRegister={() => {}} onBackToLogin={() => setIsRegistering(false)} initialRole={registerRole} />;
          }
          return <Login onLogin={() => {}} onGoToRegister={(role) => { setRegisterRole(role); setIsRegistering(true); }} />;
        }

        return (
          <div className="flex min-h-screen min-h-[100dvh] bg-slate-50 font-sans">
            {/* Sidebar: hidden on mobile, visible on lg+ */}
            <div className="hidden lg:block">
              <Sidebar
                user={user}
                onLogout={logout}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
              />
            </div>
            {/* Mobile sidebar overlay (only when hamburger clicked) */}
            {isSidebarOpen && (
              <div className="lg:hidden">
                <Sidebar
                  user={user}
                  onLogout={logout}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isOpen={isSidebarOpen}
                  onClose={() => setIsSidebarOpen(false)}
                />
              </div>
            )}
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar
                user={user}
                onMenuClick={() => setIsSidebarOpen(true)}
                onNavigateTab={setActiveTab}
                onOpenNotifications={(notificationId) => {
                  setSelectedNotificationId(notificationId);
                  setActiveTab('Notifications');
                }}
              />
              <main className="p-3 md:p-8 flex-1 overflow-auto bg-slate-50 pb-20 lg:pb-8">
                <div className="max-w-7xl mx-auto">
                  {renderContent()}
                </div>
              </main>
            </div>
            {/* Bottom tabs: visible on mobile only */}
            <BottomTabs user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
            <SupportChat user={user} />
          </div>
        );
      })()}
    </BrowserRouter>
  );
};

export default App;

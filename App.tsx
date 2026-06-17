
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { UserRole, User } from './types';
// EAGER imports — these are needed instantly on app boot (auth, the two
// landing dashboards). Keeping them eager means there's no flash-of-suspense
// on the very first screen the user sees.
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ParentDashboard from './pages/ParentDashboard';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import SupportChat from './components/SupportChat';
import AppLoader from './components/AppLoader';
import BottomTabs from './components/BottomTabs';
import { useAuthStore } from './store/authStore';
import { isSupabaseConfigured } from './lib/supabase';
import { applyPlatformClass, usePlatform } from './lib/platform';
import { initNativeBridge } from './lib/nativeBridge';
import { initPushNotifications } from './services/pushNotifications';
import { maybePromptForRating } from './services/appRating';
import OnboardingTutorial from './components/OnboardingTutorial';
import { useWindowSize } from './hooks/useWindowSize';

applyPlatformClass();

// LAZY imports — every page below is only loaded when the user actually
// navigates to it. Cuts the initial bundle by ~40-50% and trims first-paint
// time by ~300-500ms. Each chunk is downloaded on demand on first visit and
// cached by the browser thereafter.
const Students = lazy(() => import('./pages/Students'));
const Reports = lazy(() => import('./pages/Reports'));
const Routes = lazy(() => import('./pages/Routes'));
const Buses = lazy(() => import('./pages/Buses'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const Attendance = lazy(() => import('./pages/Attendance'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Holidays = lazy(() => import('./pages/Holidays'));
const AdminNotifications = lazy(() => import('./pages/AdminNotifications'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const AdminManagement = lazy(() => import('./pages/AdminManagement'));
const UserDirectory = lazy(() => import('./pages/UserDirectory'));
const LiveTracking = lazy(() => import('./pages/LiveTracking'));
const Documentation = lazy(() => import('./pages/Documentation'));
const PaymentSettings = lazy(() => import('./pages/PaymentSettings'));

const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const DataProtection = lazy(() => import('./pages/DataProtection'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const HelpSupport = lazy(() => import('./pages/HelpSupport'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const Services = lazy(() => import('./pages/Services'));
const AboutUs = lazy(() => import('./pages/AboutUs'));

const BusCamera = lazy(() => import('./pages/parent/BusCamera'));
const FeeHistory = lazy(() => import('./pages/parent/FeeHistory'));
const ParentNotifications = lazy(() => import('./pages/parent/Notifications'));
const ParentSettings = lazy(() => import('./pages/parent/Settings'));
const StudentProfile = lazy(() => import('./pages/parent/StudentProfile'));
const Support = lazy(() => import('./pages/parent/Support'));
const Receipts = lazy(() => import('./pages/Receipts'));
const AttendanceHistory = lazy(() => import('./pages/parent/AttendanceHistory'));
const ParentRoutes = lazy(() => import('./pages/parent/Routes'));
const ParentLiveTracking = lazy(() => import('./pages/parent/LiveTracking'));

const getAllowedTabs = (user?: User | null) => {
  const role = user?.role;
  if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
    return [
      'Dashboard',
      'Students',
      'Buses',
      'Payments',
      'Payment Settings',
      'Settings',
      'Attendance',
      'Expenses',
      'Holidays',
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
  const { isMobile, isTablet, isDesktop, screenSize } = useWindowSize();
  const platformInfo = usePlatform();

  useEffect(() => {
    // Initialize auth store regardless of Supabase config to allow UI to render
    init();
    initNativeBridge();
  }, [init]);

  useEffect(() => {
    // Close sidebar when screen becomes desktop
    if (isDesktop && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isDesktop, isSidebarOpen]);

  useEffect(() => {
    if (!user?.id || !user?.role) return;
    setActiveTab('Dashboard');
    // Once a user is logged in: register for FCM (no-op until Firebase config
    // file is dropped in) and maybe prompt for a Play Store rating after a
    // few good moments + 7-day age.
    initPushNotifications(String(user.id)).catch(() => { /* non-fatal */ });
    maybePromptForRating().catch(() => { /* non-fatal */ });
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
        case 'Payment Settings': return <PaymentSettings />;
        case 'Settings': return <Settings />;
        case 'Attendance': return <Attendance />;
        case 'Expenses': return <Expenses />;
        case 'Holidays': return <Holidays />;
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
        case 'Notifications': return <ParentNotifications user={user!} focusNotificationId={selectedNotificationId} onFocusHandled={() => setSelectedNotificationId(undefined)} onNavigateTab={setActiveTab} />;
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
        if (path === '/services') return <Services />;
        if (path === '/about' || path === '/about-us') return <AboutUs />;
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
          <div className="flex flex-col min-h-screen min-h-[100dvh] bg-slate-50 font-sans">
            {/* Topbar spans full width across all breakpoints */}
            <Topbar
              user={user}
              onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
              onNavigateTab={setActiveTab}
              onOpenNotifications={(notificationId) => {
                setSelectedNotificationId(notificationId);
                setActiveTab('Notifications');
              }}
              onLogout={logout}
            />

            {/* Main layout: Sidebar + Content */}
            <div className="flex flex-1 min-w-0 min-h-0">
              {/* Desktop Sidebar: visible on lg+ screens (1024px+) */}
              {isDesktop && !platformInfo.isNative && (
                <Sidebar
                  user={user}
                  onLogout={logout}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isOpen={true}
                  onClose={() => {}}
                />
              )}

              {/* Mobile Sidebar Overlay: only on mobile/tablet when hamburger is clicked */}
              {(isMobile || isTablet) && isSidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1999] lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
              )}
              
              {(isMobile || isTablet) && (
                <Sidebar
                  user={user}
                  onLogout={logout}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isOpen={isSidebarOpen}
                  onClose={() => setIsSidebarOpen(false)}
                />
              )}

              {/* Main Content Area */}
              <main
                className="p-3 md:p-8 flex-1 overflow-auto bg-slate-50 lg:pb-8"
                style={{
                  paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
                  paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
                  // Tall, fixed clearance — does not rely on vh (unreliable on Android
                  // Capacitor) or safe-area-inset-bottom alone (often 0 on Android)
                  paddingBottom: (isMobile || isTablet)
                    ? 'calc(env(safe-area-inset-bottom, 0px) + 16rem)'
                    : undefined,
                }}
              >
                <div className="max-w-7xl mx-auto">
                  {/* Suspense fallback shows MiniLoader while a lazy page chunk
                      streams in. Without this React throws on first navigation
                      to any lazy() page. */}
                  <Suspense fallback={<AppLoader />}>
                    {renderContent()}
                  </Suspense>
                  {/* Belt-and-suspenders: a real DOM spacer that physically sits at the end
                      of every page so even short pages keep content above the bottom nav. */}
                  {(isMobile || isTablet) && (
                    <div
                      aria-hidden="true"
                      style={{ height: 'calc(env(safe-area-inset-bottom, 0px) + 8rem)' }}
                    />
                  )}
                </div>
              </main>
            </div>

            {/* Bottom tabs: visible on mobile/tablet only */}
            {(isMobile || isTablet) && <BottomTabs user={user} activeTab={activeTab} setActiveTab={setActiveTab} />}
            <SupportChat user={user} />
            <OnboardingTutorial role={user.role === UserRole.PARENT ? 'parent' : 'admin'} />
          </div>
        );
      })()}
    </BrowserRouter>
  );
};

export default App;

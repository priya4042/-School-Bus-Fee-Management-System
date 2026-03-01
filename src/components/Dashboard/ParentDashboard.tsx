import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  CreditCard, 
  Bell, 
  MessageSquare, 
  Video, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Bus as BusIcon,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

// Sub-components
import StudentProfile from './Parent/StudentProfile';
import LiveTracking from './Parent/LiveTracking';
import CameraMonitoring from './Parent/CameraMonitoring';
import FeeManagement from './Parent/FeeManagement';
import SupportChat from './Parent/SupportChat';
import Notifications from './Parent/Notifications';

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentData();
    // Check system theme
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const fetchStudentData = async () => {
    try {
      const response = await fetch('/api/parent/student-details', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStudentData(data);
      } else {
        toast.error(data.error || 'Failed to fetch student data');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const sidebarItems = [
    { id: 'profile', label: 'Student Profile', icon: User },
    { id: 'tracking', label: 'Live Tracking', icon: MapPin },
    { id: 'camera', label: 'Bus Camera', icon: Video },
    { id: 'fees', label: 'Fee Management', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'support', label: 'Support Chat', icon: MessageSquare },
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (!studentData) {
      return (
        <div className="text-center py-20">
          <Shield size={64} className="mx-auto text-zinc-300 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">No Student Linked</h2>
          <p className="text-zinc-500">Please contact the school admin to link your child to this account.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'profile': return <StudentProfile student={studentData} isDarkMode={isDarkMode} />;
      case 'tracking': return <LiveTracking student={studentData} isDarkMode={isDarkMode} />;
      case 'camera': return <CameraMonitoring student={studentData} isDarkMode={isDarkMode} />;
      case 'fees': return <FeeManagement student={studentData} isDarkMode={isDarkMode} />;
      case 'notifications': return <Notifications isDarkMode={isDarkMode} />;
      case 'support': return <SupportChat isDarkMode={isDarkMode} />;
      default: return <StudentProfile student={studentData} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}
        border-r flex flex-col
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <BusIcon size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">BusWay Pro</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Parent Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all
                ${activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}
              `}
            >
              <item.icon size={20} />
              {item.label}
              {activeTab === item.id && (
                <motion.div layoutId="activeTab" className="ml-auto">
                  <ChevronRight size={16} />
                </motion.div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className={`h-20 border-b flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md ${isDarkMode ? 'bg-black/80 border-zinc-800' : 'bg-white/80 border-zinc-200'}`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold">{studentData?.full_name || 'Parent'}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Admission: {studentData?.admission_number}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
              <img src={`https://picsum.photos/seed/${studentData?.id}/100/100`} alt="Profile" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

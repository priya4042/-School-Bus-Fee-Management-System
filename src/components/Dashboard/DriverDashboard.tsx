import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, 
  Users, 
  MapPin, 
  LogOut, 
  Moon, 
  Sun, 
  CheckCircle2, 
  XCircle, 
  Navigation,
  Loader2,
  RefreshCw,
  Phone,
  UserCheck,
  UserMinus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [isLoading, setIsLoading] = useState(true);
  const [busData, setBusData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark');
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/driver/assigned-bus', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setBusData(data.bus);
        setStudents(data.students);
      } else {
        toast.error(data.error || 'Failed to fetch data');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mock Location Update
  useEffect(() => {
    if (!busData) return;

    const updateLocation = async (lat: number, lng: number) => {
      try {
        await fetch('/api/driver/location', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            busId: busData.id,
            latitude: lat,
            longitude: lng
          })
        });
      } catch (err) {
        console.error('Location update failed');
      }
    };

    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => updateLocation(pos.coords.latitude, pos.coords.longitude),
          () => {
            // Fallback for demo: slightly move mock location
            const mockLat = 28.6139 + (Math.random() - 0.5) * 0.01;
            const mockLng = 77.2090 + (Math.random() - 0.5) * 0.01;
            updateLocation(mockLat, mockLng);
          }
        );
      }
    }, 10000); // Every 10s

    return () => clearInterval(interval);
  }, [busData]);

  const handleAttendance = async (studentId: string, type: 'pickup' | 'drop', status: 'present' | 'absent') => {
    try {
      const response = await fetch('/api/driver/attendance', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, type, status })
      });
      
      if (response.ok) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} marked: ${status}`);
        // Update local state to show feedback
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, [`last_${type}`]: status } : s));
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to mark attendance');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/driver/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
              <Bus size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Driver Dashboard</h1>
              <p className="text-xs text-zinc-500 font-medium">Bus {busData?.bus_number} • {busData?.routes?.route_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all text-zinc-500"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={handleLogout}
              className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all text-red-500"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Route Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                <Navigation size={20} />
              </div>
              <h3 className="font-bold">Active Route</h3>
            </div>
            <p className="text-2xl font-bold">{busData?.routes?.route_name || 'N/A'}</p>
            <p className="text-sm text-zinc-500 mt-1">{busData?.routes?.start_point} → {busData?.routes?.end_point}</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                <Users size={20} />
              </div>
              <h3 className="font-bold">Students</h3>
            </div>
            <p className="text-2xl font-bold">{students.length}</p>
            <p className="text-sm text-zinc-500 mt-1">Assigned to this bus</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                <MapPin size={20} />
              </div>
              <h3 className="font-bold">GPS Status</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-2xl font-bold">Active</p>
            </div>
            <p className="text-sm text-zinc-500 mt-1">Broadcasting live location</p>
          </div>
        </div>

        {/* Student List & Attendance */}
        <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Student Attendance</h2>
            <button 
              onClick={fetchData}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {students.map((student) => (
              <div key={student.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-50 dark:hover:bg-black/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 overflow-hidden shadow-sm">
                    <img 
                      src={`https://picsum.photos/seed/${student.id}/100/100`} 
                      alt={student.full_name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">{student.full_name}</h4>
                    <p className="text-sm text-zinc-500 font-medium">{student.boarding_point}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Class {student.grade}-{student.section}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 text-center">Pickup</p>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleAttendance(student.id, 'pickup', 'present')}
                        className={`p-3 rounded-2xl transition-all active:scale-95 ${student.last_pickup === 'present' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'}`}
                        title="Mark Present"
                      >
                        <UserCheck size={20} />
                      </button>
                      <button 
                        onClick={() => handleAttendance(student.id, 'pickup', 'absent')}
                        className={`p-3 rounded-2xl transition-all active:scale-95 ${student.last_pickup === 'absent' ? 'bg-red-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'}`}
                        title="Mark Absent"
                      >
                        <UserMinus size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="w-px h-12 bg-zinc-100 dark:bg-zinc-800 hidden md:block" />

                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 text-center">Drop</p>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleAttendance(student.id, 'drop', 'present')}
                        className={`p-3 rounded-2xl transition-all active:scale-95 ${student.last_drop === 'present' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'}`}
                        title="Mark Dropped"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                      <button 
                        onClick={() => handleAttendance(student.id, 'drop', 'absent')}
                        className={`p-3 rounded-2xl transition-all active:scale-95 ${student.last_drop === 'absent' ? 'bg-red-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'}`}
                        title="Mark Not Dropped"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  </div>

                  <a 
                    href={`tel:${student.parent_phone}`}
                    className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all active:scale-95"
                    title="Call Parent"
                  >
                    <Phone size={20} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

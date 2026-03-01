import React, { useState } from 'react';
import { 
  User, 
  Bus as BusIcon, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Calendar,
  Clock,
  Navigation,
  XCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

interface StudentProfileProps {
  student: any;
  isDarkMode: boolean;
}

export default function StudentProfile({ student, isDarkMode }: StudentProfileProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestedPoint, setRequestedPoint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = [
    { label: 'Grade', value: student.grade || 'N/A', icon: User, color: 'text-blue-500' },
    { label: 'Section', value: student.section || 'N/A', icon: ShieldCheck, color: 'text-emerald-500' },
    { label: 'Bus Number', value: student.buses?.bus_number || 'Unassigned', icon: BusIcon, color: 'text-amber-500' },
    { label: 'Route', value: student.routes?.route_name || 'Unassigned', icon: Navigation, color: 'text-indigo-500' },
  ];

  const handleBoardingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/parent/boarding-point/request', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          studentId: student.id,
          requestedPoint,
          currentPoint: student.boarding_point
        })
      });
      
      if (response.ok) {
        toast.success('Request submitted for admin approval');
        setIsModalOpen(false);
        setRequestedPoint('');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <div className={`p-8 rounded-3xl border relative overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 overflow-hidden shadow-xl shadow-indigo-600/10">
            <img 
              src={`https://picsum.photos/seed/${student.id}/200/200`} 
              alt={student.full_name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">{student.full_name}</h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${student.status === 'active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-100 text-red-600 dark:bg-red-900/20'}`}>
                {student.status === 'active' ? 'Transport Active' : 'Transport Suspended'}
              </span>
            </div>
            <p className="text-zinc-500 font-medium mb-6">Admission Number: {student.admission_number}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-black/40 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                  <stat.icon size={16} className={`${stat.color} mb-2`} />
                  <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">{stat.label}</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transport Details */}
        <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'} col-span-2`}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <BusIcon size={20} />
            </div>
            <h3 className="text-xl font-bold">Transport Information</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shadow-sm">
                  <Navigation size={20} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Boarding Point</p>
                  <p className="font-bold">{student.boarding_point || 'Not Set'}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-indigo-600 text-xs font-bold hover:underline"
              >
                Change Point
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-2">Bus Model</p>
                <p className="font-bold">{student.buses?.model || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-2">Route Path</p>
                <p className="font-bold">{student.routes?.start_point} → {student.routes?.end_point}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Boarding Point Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}
            >
              <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Change Boarding Point</h3>
                  <p className="text-zinc-500 text-sm mt-1">Request a new pickup/drop location.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all">
                  <XCircle size={28} className="text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleBoardingRequest} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">New Boarding Point</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                      required
                      value={requestedPoint}
                      onChange={(e) => setRequestedPoint(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      placeholder="e.g. Sector 15, Main Gate"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    <strong>Note:</strong> Boarding point changes require school admin approval and may affect your monthly transport fee.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Submit Request"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

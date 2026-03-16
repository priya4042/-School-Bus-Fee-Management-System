import React, { useState, useEffect } from 'react';
import { User, MonthlyDue, PaymentStatus, Student } from '../types';
import { MONTHS } from '../constants';
import { usePayments } from '../hooks/usePayments';
import PaymentPortal from '../components/PaymentPortal';
import { useTracking } from '../hooks/useTracking';
import { isMonthPayable, calculateCurrentLedger } from '../utils/feeCalculator';
import BusCameraModal from '../components/BusCameraModal';
import BoardingLocationPicker from '../components/Location/BoardingLocationPicker';
import { useReceipts } from '../hooks/useReceipts';
import { showToast } from '../lib/swal';
import GoogleMap from '../components/GoogleMap';
import { supabase } from '../lib/supabase';

const ParentDashboard: React.FC<{ user: User }> = ({ user }) => {
  const { paymentState, openPortal, closePortal, initiateRazorpay } = usePayments();
  const { downloadReceipt } = useReceipts();
  const [familyStudents, setFamilyStudents] = useState<Student[]>([]);
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showFutureScheduled, setShowFutureScheduled] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { location, hasArrived } = useTracking(selectedStudent?.bus_id || undefined);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('parent_id', user.id);
        if (studentsError) throw studentsError;
        const family = studentsData || [];
        setFamilyStudents(family);
        if (family.length > 0) setSelectedStudent(family[0]);

        if (family.length > 0) {
          const studentIds = family.map((s: Student) => s.id);
          const { data: duesData, error: duesError } = await supabase
            .from('monthly_dues')
            .select('*')
            .in('student_id', studentIds)
            .order('year', { ascending: true })
            .order('month', { ascending: true });
          if (duesError) throw duesError;
          setDues(duesData || []);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [user, paymentState.step]);



  if (loading) return (
     <div className="p-20 text-center">
        <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
     </div>
  );

  if (!selectedStudent && !loading) return (
     <div className="p-20 text-center bg-white rounded-3xl shadow-sm">
        <i className="fas fa-user-graduate text-slate-300 text-6xl mb-4"></i>
        <h2 className="text-xl font-bold text-slate-700">No Students Found</h2>
        <p className="text-slate-500 mt-2">Please contact the Bus Administrator to link your child's account.</p>
     </div>
  );

  const now = new Date();
  const currentPeriod = now.getFullYear() * 12 + (now.getMonth() + 1);
  const toPeriod = (due: MonthlyDue) => Number(due.year || 0) * 12 + Number(due.month || 0);
  const isMonthStarted = (due: MonthlyDue) => toPeriod(due) <= currentPeriod;
  const selectedStudentAllDues = dues
    .filter((d) => String(d.student_id) === String(selectedStudent.id))
    .sort((a, b) => toPeriod(a) - toPeriod(b));

  const selectedFirstUnpaidDue = selectedStudentAllDues.find(
    (d) => d.status !== PaymentStatus.PAID && isMonthStarted(d)
  ) || null;

  const studentDues = selectedStudentAllDues.filter(
    (d) => d.status === PaymentStatus.PAID || String(d.id) === String(selectedFirstUnpaidDue?.id || '')
  );

  const futureScheduledDues = selectedStudentAllDues.filter(
    (d) => d.status !== PaymentStatus.PAID && String(d.id) !== String(selectedFirstUnpaidDue?.id || '')
  );

  // Use feeCalculator for all outstanding calculations
  const totalFamilyDue = familyStudents.reduce((acc, s) => {
    const studentDuesAll = dues
      .filter((d) => String(d.student_id) === String(s.id))
      .sort((a, b) => toPeriod(a) - toPeriod(b));
    const firstUnpaidDue = studentDuesAll.find(
      (d) => d.status !== PaymentStatus.PAID && isMonthStarted(d)
    );
    if (!firstUnpaidDue) return acc;
    return acc + calculateCurrentLedger(firstUnpaidDue).total;
  }, 0);

  const handleLocationSave = (data: any) => {
    console.log('Boarding point saved:', data);
    showToast('Boarding point updated successfully', 'success');
    setIsPickerOpen(false);
  };

  return (
    <div className="space-y-6">
      <PaymentPortal 
        state={paymentState} 
        onClose={closePortal} 
        onInitiateRazorpay={initiateRazorpay}
      />

      <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-slate-200 shadow-premium flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute -right-10 md:-right-20 -top-10 md:-top-20 opacity-5 transition-transform duration-1000 group-hover:rotate-12">
           <i className="fas fa-bus text-[150px] md:text-[300px] text-primary"></i>
        </div>
        <div className="flex items-center gap-4 md:gap-8 relative z-10 w-full sm:w-auto">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-primary/5 text-primary rounded-2xl md:rounded-[2rem] flex items-center justify-center text-2xl md:text-4xl border border-primary/10">
            <i className="fas fa-home-user"></i>
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Family Hub</h2>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">
                 {familyStudents.length} Students Registered
              </p>
            </div>
          </div>
        </div>
        <div className="text-center md:text-right relative z-10 w-full sm:w-auto">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consolidated Dues</p>
          <p className={`text-3xl md:text-5xl font-black tracking-tighter ${totalFamilyDue > 0 ? 'text-danger' : 'text-success'}`}>
             ₹{Number(totalFamilyDue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl md:rounded-[2rem] border border-slate-200/50 w-full md:w-max">
        {familyStudents.map(s => (
          <button 
            key={s.id}
            onClick={() => setSelectedStudent(s)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-4 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all ${
              selectedStudent.id === s.id 
                ? 'bg-primary text-white shadow-xl shadow-primary/30' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
            }`}
          >
            {s.full_name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <div className="bg-slate-950 rounded-3xl md:rounded-[3.5rem] shadow-2xl overflow-hidden border-8 md:border-[12px] border-white/5 relative h-[400px] md:h-[600px] group z-0">
              <div className={`absolute inset-0 transition-opacity duration-1000 ${trackingActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {trackingActive && <GoogleMap location={location} busId={selectedStudent?.bus_id} />}
              </div>
              
              {!trackingActive && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-6 z-10">
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-white/5 rounded-[2rem] md:rounded-[3rem] flex items-center justify-center text-white/10 border border-white/10 group-hover:scale-110 transition-transform">
                        <i className="fas fa-satellite text-4xl md:text-6xl"></i>
                    </div>
                    <div>
                       <h3 className="text-xl md:text-3xl font-black text-white tracking-tight mb-2">Live Monitor</h3>
                       <p className="text-white/30 font-black uppercase text-[8px] md:text-[10px] tracking-[0.4em] max-w-[250px] mx-auto">
                          {(user as any).preferences?.tracking === true
                            ? 'Connect to encrypted satellite stream'
                            : 'Tracking access not enabled — contact Bus Administrator'}
                       </p>
                    </div>
                    {(user as any).preferences?.tracking === true ? (
                      <button
                         onClick={() => setTrackingActive(true)}
                         className="bg-primary text-white px-8 md:px-12 py-3 md:py-5 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[11px] tracking-widest shadow-2xl hover:scale-105 transition-all shadow-primary/20 active:scale-95"
                      >
                         Establish Uplink
                      </button>
                    ) : (
                      <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-white/40 uppercase tracking-widest">
                        Access Restricted
                      </div>
                    )}
                 </div>
              )}

              {trackingActive && (
                 <div className="absolute top-4 left-4 z-20 flex flex-col sm:flex-row gap-2">
                    <div className="bg-black/80 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/10 text-white flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full animate-pulse ${hasArrived ? 'bg-blue-500' : 'bg-success'}`}></div>
                       <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                        {hasArrived ? 'Bus at Campus • Final Stop' : 'Bus KNG-01-A • Live Telemetry'}
                       </span>
                    </div>
                    <button 
                       onClick={() => setIsPickerOpen(true)}
                       className="bg-white text-slate-900 px-4 py-3 rounded-xl border border-slate-200 font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                       <i className="fas fa-map-marker-alt"></i>
                       Set Boarding
                    </button>
                    <button 
                       onClick={() => setIsCameraOpen(true)}
                       className="bg-slate-900/80 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/10 font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                    >
                       <i className="fas fa-video"></i>
                       Live Cam
                    </button>
                    <button 
                       onClick={() => setTrackingActive(false)}
                       className="bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/10 font-black text-[9px] uppercase tracking-widest hover:bg-white/20 transition-all"
                    >
                       Disconnect
                    </button>
                 </div>
              )}
           </div>
        </div>

        <BusCameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />

        <div className="bg-white rounded-3xl md:rounded-[3rem] border border-slate-200 shadow-premium overflow-hidden">
          <div className="p-6 md:p-10 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
             <div>
                <h3 className="font-black text-[9px] md:text-[11px] uppercase tracking-widest text-slate-400 mb-1">Fee Manifest</h3>
                <p className="text-[10px] md:text-xs font-black text-slate-800 uppercase">{selectedStudent.full_name}</p>
             </div>
             <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <i className="fas fa-file-invoice"></i>
             </div>
          </div>
          <div className="divide-y divide-slate-50">
            {studentDues.map(due => {
              const isPaid = due.status === PaymentStatus.PAID;
              const isLocked = !isPaid && !isMonthPayable(due, studentDues);
              const isOverdue = !isPaid && new Date() > new Date(due.due_date);

              return (
                <div key={due.id} className={`p-6 md:p-8 flex items-center justify-between group transition-all ${isLocked ? 'opacity-30 grayscale' : 'hover:bg-slate-50'}`}>
                  <div>
                    <p className="font-black text-slate-800 text-xs md:text-sm uppercase tracking-tight">{MONTHS[due.month-1]} {due.year}</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest border w-max ${isPaid ? 'bg-success/10 text-success border-success/10' : isLocked ? 'bg-slate-100 text-slate-400' : isOverdue ? 'bg-danger/10 text-danger border-danger/10' : 'bg-blue-50 text-primary border-blue-100'}`}>
                         {isLocked ? 'Locked' : due.status}
                      </span>
                      {due.late_fee > 0 && !isPaid && (
                        <p className="text-[7px] text-danger font-black uppercase mt-1 tracking-widest animate-pulse">
                          ₹{due.late_fee} Late Fee Applied
                        </p>
                      )}
                      {!isPaid && <p className="text-[7px] text-slate-400 font-bold uppercase mt-1">Fine cutoff: {due.last_date}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-sm md:text-lg font-black text-slate-800 tracking-tighter mb-2">₹{Number(due.total_due || 0).toLocaleString()}</p>
                     {isPaid ? (
                        <div className="flex flex-col items-end gap-2">
                           <i className="fas fa-check-circle text-success text-lg"></i>
                           <button
                             onClick={() => downloadReceipt(due.id, due.transaction_id || due.id, due)}
                             className="text-[7px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                           >
                             <i className="fas fa-download"></i>
                             Receipt
                           </button>
                        </div>
                     ) : (
                       <button 
                         disabled={isLocked}
                         onClick={() => {
                         const childIndex = familyStudents.findIndex(s => s.id === selectedStudent.id) + 1;
                         const ordinal = childIndex === 1 ? '1st' : childIndex === 2 ? '2nd' : childIndex === 3 ? '3rd' : `${childIndex}th`;
                         openPortal(due.id, due.total_due, `${selectedStudent.full_name} (${ordinal} Child)`);
                       }}
                         className={`px-4 md:px-6 py-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg md:rounded-xl transition-all ${isLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-800 shadow-xl shadow-primary/20'}`}
                       >
                         {isLocked ? 'Wait: Clear Prior' : 'Pay Now'}
                       </button>
                     )}
                  </div>
                </div>
              );
            })}
            {studentDues.length === 0 && (
              <div className="p-20 text-center">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No fee records found</p>
              </div>
            )}

            {futureScheduledDues.length > 0 && (
              <div className="p-6 md:p-8 bg-slate-50/60">
                <button
                  onClick={() => setShowFutureScheduled((prev) => !prev)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all"
                >
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-600">
                    Future Scheduled ({futureScheduledDues.length})
                  </span>
                  <i className={`fas ${showFutureScheduled ? 'fa-chevron-up' : 'fa-chevron-down'} text-slate-400 text-xs`}></i>
                </button>

                {showFutureScheduled && (
                  <div className="mt-3 space-y-2">
                    {futureScheduledDues.map((due) => (
                      <div key={`future-${due.id}`} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                            {MONTHS[(due.month || 1) - 1]} {due.year}
                          </p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Scheduled • locked until prior dues are cleared
                          </p>
                        </div>
                        <p className="text-sm font-black text-slate-600 tracking-tight">
                          ₹{Number(due.total_due || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
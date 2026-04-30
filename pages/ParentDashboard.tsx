import React, { useState, useEffect } from 'react';
import { User, MonthlyDue, PaymentStatus, Student } from '../types';
import { MONTHS } from '../constants';
import { usePayments } from '../hooks/usePayments';
import PaymentPortal from '../components/PaymentPortal';
import { useTracking } from '../hooks/useTracking';
import { isMonthPayable, calculateCurrentLedger, buildPaymentBundle } from '../utils/feeCalculator';
import BusCameraModal from '../components/BusCameraModal';
import BoardingLocationPicker from '../components/Location/BoardingLocationPicker';
import { useReceipts } from '../hooks/useReceipts';
import { showToast } from '../lib/swal';
import GoogleMap from '../components/GoogleMap';
import { supabase } from '../lib/supabase';
import MiniLoader from '../components/MiniLoader';
import { useLanguage } from '../lib/i18n';
import { checkAndCreateUpcomingDueReminders } from '../services/feeReminders';
import { markChildAbsent, submitPickupSwapRequest, getLatestBusStatusForParent, BUS_STATUS_OPTIONS, type ParsedBusStatus } from '../services/parentActions';
import Modal from '../components/Modal';
import { showAlert, showConfirm } from '../lib/swal';

const ParentDashboard: React.FC<{ user: User }> = ({ user }) => {
  const { t } = useLanguage();
  const { paymentState, openPortal, closePortal, initiatePayU, initiateRazorpay, initiateUpiIntent, confirmUpiPayment } = usePayments();
  const { downloadReceipt, downloading, downloadFeePaidCertificate } = useReceipts();
  const [familyStudents, setFamilyStudents] = useState<Student[]>([]);
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showFutureScheduled, setShowFutureScheduled] = useState(false);
  const [loading, setLoading] = useState(true);

  // New parent actions: Mark Absent + Pickup Swap + Bus Status banner
  const [busStatus, setBusStatus] = useState<ParsedBusStatus | null>(null);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [absentReason, setAbsentReason] = useState<'sick' | 'leave' | 'family' | 'other'>('sick');
  const [absentNotes, setAbsentNotes] = useState('');
  const [savingAbsent, setSavingAbsent] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapDate, setSwapDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default tomorrow
    return d.toISOString().split('T')[0];
  });
  const [swapLocation, setSwapLocation] = useState('');
  const [swapNotes, setSwapNotes] = useState('');
  const [savingSwap, setSavingSwap] = useState(false);

  const handleMarkAbsent = async () => {
    if (!selectedStudent) return;
    setSavingAbsent(true);
    try {
      const result = await markChildAbsent({
        studentId: selectedStudent.id,
        parentId: user.id,
        reason: absentReason,
        notes: absentNotes.trim() || undefined,
      });
      if (!result.ok) {
        showAlert('Could not mark absent', result.error || 'Try again.', 'error');
        return;
      }
      showToast(`${selectedStudent.full_name} marked absent for today. Admin notified.`, 'success');
      setShowAbsentModal(false);
      setAbsentNotes('');
    } finally {
      setSavingAbsent(false);
    }
  };

  const handleSubmitSwap = async () => {
    if (!selectedStudent) return;
    if (!swapLocation.trim()) {
      showToast('Please enter the new pickup location.', 'warning');
      return;
    }
    setSavingSwap(true);
    try {
      const result = await submitPickupSwapRequest({
        studentId: selectedStudent.id,
        parentId: user.id,
        forDate: swapDate,
        newLocation: swapLocation.trim(),
        notes: swapNotes.trim() || undefined,
      });
      if (!result.ok) {
        showAlert('Could not send request', result.error || 'Try again.', 'error');
        return;
      }
      showToast('Pickup change request sent to admin.', 'success');
      setShowSwapModal(false);
      setSwapLocation('');
      setSwapNotes('');
    } finally {
      setSavingSwap(false);
    }
  };

  // Pay every unpaid due across all the family's children in one bundle
  const handlePayAllSiblings = async () => {
    const unpaidDues = dues.filter((d: any) => d.status !== PaymentStatus.PAID);
    if (unpaidDues.length === 0) {
      showToast('Everything is already paid up.', 'info');
      return;
    }
    const total = unpaidDues.reduce((sum, d: any) => sum + Number(d.total_due || d.amount || 0), 0);
    const confirmed = await showConfirm(
      'Pay for all children?',
      `Pay ₹${total.toLocaleString('en-IN')} for ${unpaidDues.length} unpaid month${unpaidDues.length === 1 ? '' : 's'} across ${familyStudents.length} child${familyStudents.length === 1 ? '' : 'ren'}?`,
      'Pay Now'
    );
    if (!confirmed) return;
    // Pick the earliest unpaid due as the "anchor" so the portal opens on it
    const anchor = unpaidDues.sort((a: any, b: any) => (a.year * 12 + a.month) - (b.year * 12 + b.month))[0] as any;
    const bundle = buildPaymentBundle(anchor, unpaidDues as any);
    openPortal(
      anchor.id,
      bundle.amount || total,
      `Family Bundle (${familyStudents.length} children)`,
      bundle.dueIds,
      bundle as any,
    );
  };

  // Issue Fee-Paid Certificate for the current Indian academic year
  const handleDownloadCertificate = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const fyStart = month >= 4 ? now.getFullYear() : now.getFullYear() - 1;
    const parentName = user.fullName || user.full_name || undefined;
    downloadFeePaidCertificate(user.id, { startYear: fyStart, endYear: fyStart + 1 }, parentName);
  };
  
  const { location, hasArrived } = useTracking(selectedStudent?.bus_id || undefined);

  // Poll latest bus-status banner whenever the selected child changes
  useEffect(() => {
    let active = true;
    const poll = async () => {
      if (!selectedStudent?.bus_id) { setBusStatus(null); return; }
      const latest = await getLatestBusStatusForParent(user.id, String(selectedStudent.bus_id));
      if (active) setBusStatus(latest);
    };
    poll();
    const interval = setInterval(poll, 30000); // refresh every 30s
    return () => { active = false; clearInterval(interval); };
  }, [selectedStudent?.bus_id, user.id]);

  useEffect(() => {
    // Fire-and-forget: scan upcoming dues and create reminder notifications.
    // Idempotent — won't spam if a reminder for the same due already exists.
    checkAndCreateUpcomingDueReminders(user.id).catch(() => { /* non-fatal */ });

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
     <div className="p-8 md:p-20 text-center">
        <MiniLoader />
     </div>
  );

  if (!selectedStudent && !loading) return (
     <div className="p-8 md:p-20 text-center bg-white rounded-3xl shadow-sm">
        <i className="fas fa-user-graduate text-slate-300 text-6xl mb-4"></i>
        <h2 className="text-xl font-bold text-slate-700">{t('no_students')}</h2>
        <p className="text-slate-500 mt-2">{t('link_child')}</p>
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
    <div className="space-y-4 md:space-y-6">
      <PaymentPortal
        state={paymentState}
        onClose={closePortal}
        onInitiateRazorpay={initiateRazorpay}
        onInitiatePayU={initiatePayU}
        onInitiateUpi={initiateUpiIntent}
        onConfirmUpi={confirmUpiPayment}
      />

      <div className="bg-white p-4 md:p-10 rounded-2xl md:rounded-[3rem] border border-slate-200 shadow-premium relative overflow-hidden group">
        <div className="absolute -right-10 md:-right-20 -top-10 md:-top-20 opacity-5 transition-transform duration-1000 group-hover:rotate-12 pointer-events-none">
           <i className="fas fa-bus text-[120px] md:text-[300px] text-primary"></i>
        </div>

        {/* Top row — Family Hub title + Consolidated Dues label */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-5 min-w-0">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-primary/5 text-primary rounded-xl md:rounded-2xl flex items-center justify-center text-sm md:text-2xl border border-primary/10 flex-shrink-0">
              <i className="fas fa-home-user"></i>
            </div>
            <h2 className="text-base md:text-3xl font-black text-slate-800 tracking-tight md:tracking-tighter truncate">{t('family_hub_title')}</h2>
          </div>
          <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest flex-shrink-0">
            {t('consolidated_dues')}
          </p>
        </div>

        {/* Bottom row — students count + amount */}
        <div className="relative z-10 flex items-end justify-between gap-3 mt-3 md:mt-4">
          <p className="text-[9px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest min-w-0 truncate">
            {familyStudents.length} {t('students_registered')}
          </p>
          <p className={`text-xl md:text-5xl font-black tracking-tighter flex-shrink-0 ${totalFamilyDue > 0 ? 'text-danger' : 'text-success'}`}>
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

      {/* Bus status banner — only shows when admin has pushed a status today */}
      {busStatus?.isBusStatus && busStatus.status && (() => {
        const opt = BUS_STATUS_OPTIONS.find((o) => o.key === busStatus.status);
        return (
          <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl border flex items-center gap-3 ${opt?.color || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
            <span className="text-2xl flex-shrink-0">{opt?.emoji || '🚌'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Today&apos;s Bus Status</p>
              <p className="text-sm md:text-base font-black truncate">{busStatus.cleanMessage || opt?.label}</p>
            </div>
          </div>
        );
      })()}

      {/* Parent quick-actions row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <button
          onClick={() => setShowAbsentModal(true)}
          disabled={!selectedStudent}
          className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
        >
          <i className="fas fa-user-minus text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Mark Absent</span>
        </button>
        <button
          onClick={() => setShowSwapModal(true)}
          disabled={!selectedStudent}
          className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
        >
          <i className="fas fa-map-pin text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Pickup Swap</span>
        </button>
        <button
          onClick={handlePayAllSiblings}
          disabled={familyStudents.length < 2}
          className="p-3 bg-primary text-white border border-primary rounded-xl active:scale-95 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          <i className="fas fa-money-bill-wave text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Pay All Children</span>
        </button>
        <button
          onClick={handleDownloadCertificate}
          disabled={downloading === 'fee-paid-certificate'}
          className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-60"
        >
          {downloading === 'fee-paid-certificate' ? (
            <i className="fas fa-circle-notch fa-spin text-lg"></i>
          ) : (
            <i className="fas fa-certificate text-lg"></i>
          )}
          <span className="text-[9px] font-black uppercase tracking-widest">Fee Certificate</span>
        </button>
      </div>

      <div className={`grid grid-cols-1 ${(user as any).preferences?.tracking === true ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-4 md:gap-6`}>
        {(user as any).preferences?.tracking === true && (
        <div className="lg:col-span-2">
           <div className="bg-slate-950 rounded-2xl md:rounded-[3.5rem] shadow-2xl overflow-hidden border-2 md:border-[12px] border-white/5 relative h-[250px] md:h-[600px] group z-0">
              <div className={`absolute inset-0 transition-opacity duration-1000 ${trackingActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {trackingActive && <GoogleMap location={location} busId={selectedStudent?.bus_id} />}
              </div>
              
              {!trackingActive && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-6 z-10">
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-white/5 rounded-[2rem] md:rounded-[3rem] flex items-center justify-center text-white/10 border border-white/10 group-hover:scale-110 transition-transform">
                        <i className="fas fa-satellite text-4xl md:text-6xl"></i>
                    </div>
                    <div>
                       <h3 className="text-xl md:text-3xl font-black text-white tracking-tight mb-2">{t('live_monitor')}</h3>
                       <p className="text-white/30 font-black uppercase text-[8px] md:text-[10px] tracking-[0.4em] max-w-[250px] mx-auto">
                          {(user as any).preferences?.tracking === true
                            ? t('encrypted_stream')
                            : t('tracking_not_enabled')}
                       </p>
                    </div>
                    {(user as any).preferences?.tracking === true ? (
                      <button
                         onClick={() => setTrackingActive(true)}
                         className="bg-primary text-white px-8 md:px-12 py-3 md:py-5 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[11px] tracking-widest shadow-2xl hover:scale-105 transition-all shadow-primary/20 active:scale-95"
                      >
                         {t('establish_uplink')}
                      </button>
                    ) : (
                      <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-white/40 uppercase tracking-widest">
                        {t('access_restricted')}
                      </div>
                    )}
                 </div>
              )}

              {trackingActive && (
                 <div className="absolute top-3 left-3 right-3 md:top-4 md:left-4 md:right-auto z-20 flex flex-col md:flex-row gap-2">
                    <div className="bg-black/80 backdrop-blur-xl px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-white/10 text-white flex items-center gap-2 md:gap-3">
                       <div className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${hasArrived ? 'bg-blue-500' : 'bg-success'}`}></div>
                       <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest leading-none truncate">
                        {hasArrived ? t('bus_at_school') : `Bus KNG-01-A • ${t('live_telemetry')}`}
                       </span>
                    </div>
                    <div className="grid grid-cols-3 md:flex gap-2">
                      <button
                         onClick={() => setIsPickerOpen(true)}
                         className="bg-white text-slate-900 px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-slate-200 font-black text-[8px] md:text-[9px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      >
                         <i className="fas fa-map-marker-alt"></i>
                         <span className="truncate">{t('set_boarding')}</span>
                      </button>
                      <button
                         onClick={() => setIsCameraOpen(true)}
                         className="bg-slate-900/80 backdrop-blur-md text-white px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-white/10 font-black text-[8px] md:text-[9px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      >
                         <i className="fas fa-video"></i>
                         <span className="truncate">{t('live_cam')}</span>
                      </button>
                      <button
                         onClick={() => setTrackingActive(false)}
                         className="bg-white/10 backdrop-blur-md text-white px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-white/10 font-black text-[8px] md:text-[9px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center active:scale-95"
                      >
                         <span className="truncate">{t('disconnect')}</span>
                      </button>
                    </div>
                 </div>
              )}
           </div>
        </div>
        )}

        <BusCameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />

        <div className="bg-white rounded-2xl md:rounded-[3rem] border border-slate-200 shadow-premium overflow-hidden">
          <div className="p-4 md:p-10 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
             <div className="min-w-0">
                <h3 className="font-black text-[9px] md:text-[11px] uppercase tracking-widest text-slate-400 mb-0.5 md:mb-1">Fee Manifest</h3>
                <p className="text-[10px] md:text-xs font-black text-slate-800 uppercase truncate">{selectedStudent.full_name}</p>
             </div>
             <div className="w-9 h-9 md:w-10 md:h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fas fa-file-invoice text-sm md:text-base"></i>
             </div>
          </div>
          <div className="divide-y divide-slate-50">
            {studentDues.map(due => {
              const isPaid = due.status === PaymentStatus.PAID;
              const isLocked = !isPaid && !isMonthPayable(due, studentDues);
              const isOverdue = !isPaid && new Date() > new Date(due.due_date);

              return (
                <div key={due.id} className={`p-4 md:p-8 flex items-center justify-between gap-3 group transition-all ${isLocked ? 'opacity-30 grayscale' : 'hover:bg-slate-50'}`}>
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
                             disabled={downloading === String(due.id)}
                             className="text-[7px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1 disabled:opacity-60"
                           >
                             {downloading === String(due.id) ? (
                               <><i className="fas fa-circle-notch fa-spin"></i> Downloading…</>
                             ) : (
                               <><i className="fas fa-download"></i> Receipt</>
                             )}
                           </button>
                        </div>
                     ) : (
                       <button 
                         disabled={isLocked}
                         onClick={() => {
                         const payBundle = buildPaymentBundle(due, selectedStudentAllDues);
                         const childIndex = familyStudents.findIndex(s => s.id === selectedStudent.id) + 1;
                         const ordinal = childIndex === 1 ? '1st' : childIndex === 2 ? '2nd' : childIndex === 3 ? '3rd' : `${childIndex}th`;
                         openPortal(due.id, payBundle.amount || Number(due.total_due || due.amount || 0), `${selectedStudent.full_name} (${ordinal} Child)`, payBundle.dueIds, payBundle);
                       }}
                         className={`px-4 md:px-6 py-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg md:rounded-xl transition-all ${isLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-800 shadow-xl shadow-primary/20'}`}
                       >
                         {isLocked ? t('wait_clear_prior') : t('pay_now_short')}
                       </button>
                     )}
                  </div>
                </div>
              );
            })}
            {studentDues.length === 0 && (
              <div className="p-8 md:p-20 text-center">
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
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-black text-slate-600 tracking-tight">
                            ₹{Number(due.total_due || 0).toLocaleString('en-IN')}
                          </p>
                          <button
                            onClick={() => {
                              const payBundle = buildPaymentBundle(due, selectedStudentAllDues);
                              const childIndex = familyStudents.findIndex(s => s.id === selectedStudent.id) + 1;
                              const ordinal = childIndex === 1 ? '1st' : childIndex === 2 ? '2nd' : childIndex === 3 ? '3rd' : `${childIndex}th`;
                              openPortal(due.id, payBundle.amount || Number(due.total_due || due.amount || 0), `${selectedStudent.full_name} (${ordinal} Child)`, payBundle.dueIds, payBundle);
                            }}
                            className="px-3 py-2 rounded-lg bg-primary text-white text-[8px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all"
                          >
                            Pay
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mark Absent modal */}
      <Modal
        isOpen={showAbsentModal}
        onClose={() => setShowAbsentModal(false)}
        title={`Mark ${selectedStudent?.full_name || 'child'} absent today`}
        maxWidthClass="max-w-md"
        bodyClassName="p-4 md:p-8"
      >
        <div className="space-y-4">
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
            Today&apos;s pickup and drop will be marked as absent. Admin will be notified so the driver doesn&apos;t wait at the stop.
          </p>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: 'sick', label: '🤒 Sick' },
                { key: 'leave', label: '🌴 Leave' },
                { key: 'family', label: '👨‍👩‍👧 Family' },
                { key: 'other', label: '✏️ Other' },
              ] as const).map((r) => (
                <button
                  key={r.key}
                  onClick={() => setAbsentReason(r.key)}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                    absentReason === r.key ? 'bg-primary text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes (optional)</label>
            <textarea
              rows={2}
              value={absentNotes}
              onChange={(e) => setAbsentNotes(e.target.value)}
              placeholder="e.g. fever, will return tomorrow"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-4 ring-primary/10 focus:border-primary resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowAbsentModal(false)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkAbsent}
              disabled={savingAbsent}
              className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-amber-600/20 hover:bg-amber-700 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {savingAbsent ? <><i className="fas fa-circle-notch fa-spin"></i> Saving</> : <><i className="fas fa-check"></i> Confirm Absence</>}
            </button>
          </div>
        </div>
      </Modal>

      {/* Pickup Swap modal */}
      <Modal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        title={`Request pickup change`}
        maxWidthClass="max-w-md"
        bodyClassName="p-4 md:p-8"
      >
        <div className="space-y-4">
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
            Need a one-time different pickup spot for {selectedStudent?.full_name || 'your child'}? Admin will review and confirm.
          </p>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">For Date</label>
            <input
              type="date"
              value={swapDate}
              onChange={(e) => setSwapDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-4 ring-primary/10 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Pickup Location</label>
            <input
              type="text"
              value={swapLocation}
              onChange={(e) => setSwapLocation(e.target.value)}
              placeholder="e.g. Grandma's house, Sector 12 main gate"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-4 ring-primary/10 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes (optional)</label>
            <textarea
              rows={2}
              value={swapNotes}
              onChange={(e) => setSwapNotes(e.target.value)}
              placeholder="any landmark / preferred time"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-4 ring-primary/10 focus:border-primary resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowSwapModal(false)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitSwap}
              disabled={savingSwap || !swapLocation.trim()}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {savingSwap ? <><i className="fas fa-circle-notch fa-spin"></i> Sending</> : <><i className="fas fa-paper-plane"></i> Send Request</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ParentDashboard;
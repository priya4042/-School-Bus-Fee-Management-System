import React, { useEffect, useMemo, useState } from 'react';
import { User } from '../../types';
import { supabase } from '../../lib/supabase';
import { useTracking } from '../../hooks/useTracking';
import GoogleMap from '../../components/GoogleMap';
import MiniLoader from '../../components/MiniLoader';

interface TrackingStudent {
  id: string;
  full_name: string;
  bus_id?: string;
  route_id?: string;
  routes?: {
    route_name?: string;
  } | null;
  buses?: {
    bus_number?: string;
    plate?: string;
  } | null;
}

const ParentLiveTracking: React.FC<{ user: User }> = ({ user }) => {
  const [students, setStudents] = useState<TrackingStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const trackingEnabled = (user as any).preferences?.tracking === true;
  const cameraEnabled = (user as any).preferences?.camera === true;

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('students')
          .select('id, full_name, bus_id, route_id, routes(route_name), buses(bus_number, plate)')
          .eq('parent_id', user.id)
          .order('full_name', { ascending: true });

        if (error) throw error;

        const list = (data || []) as TrackingStudent[];
        setStudents(list);
        if (list.length > 0) setSelectedStudentId(String(list[0].id));
      } catch (err) {
        console.error('Failed to load live tracking context:', err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user.id]);

  const selectedStudent = useMemo(
    () => students.find((student) => String(student.id) === String(selectedStudentId)) || null,
    [students, selectedStudentId]
  );

  const { location, hasArrived } = useTracking(selectedStudent?.bus_id || undefined);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <MiniLoader />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-location-dot text-3xl text-slate-300"></i>
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">No Children Linked</h3>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Contact bus admin to link child profiles.</p>
      </div>
    );
  }

  const speed = location?.speed != null ? Math.round(Number(location.speed)) : null;
  const isMoving = (speed ?? 0) > 1;
  const busLabel =
    (selectedStudent as any)?.buses?.plate ||
    (selectedStudent as any)?.buses?.bus_number ||
    'Bus';
  const routeLabel = (selectedStudent as any)?.routes?.route_name || 'Route not assigned';

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-4xl font-black text-slate-900 tracking-tight">Live Tracking</h1>
          <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mt-1">Track only your children buses in real time</p>
        </div>

        {students.length > 1 && (
          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50 overflow-x-auto scrollbar-hide">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(String(student.id))}
                className={`px-4 md:px-5 py-2.5 md:py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex-shrink-0 active:scale-95 ${
                  String(selectedStudentId) === String(student.id)
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {student.full_name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {!trackingEnabled ? (
        <div className="py-16 md:py-24 text-center bg-white rounded-2xl md:rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-lock text-3xl text-slate-300"></i>
          </div>
          <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Tracking Access Not Enabled</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 px-6">Please contact bus admin to enable live tracking.</p>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-2xl md:rounded-[3rem] overflow-hidden border border-slate-800 h-[400px] md:h-[600px] relative animate-in fade-in zoom-in-95 duration-500">
          <GoogleMap location={location} busId={selectedStudent?.bus_id} />

          {/* Top status pill */}
          <div className="absolute top-3 left-3 right-3 md:top-4 md:left-4 md:right-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-3 animate-in slide-in-from-top-2 duration-500">
            <div className="bg-black/80 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/10 text-white flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${hasArrived ? 'bg-blue-400' : isMoving ? 'bg-success animate-pulse' : 'bg-amber-400'}`}></span>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest leading-none truncate">
                  {selectedStudent?.full_name || 'Student'}
                </p>
                <p className="text-[9px] font-bold text-white/60 mt-1 uppercase tracking-widest truncate">
                  {hasArrived ? 'Bus reached school' : routeLabel}
                </p>
              </div>
            </div>

            {cameraEnabled && (
              <div className="bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest flex-shrink-0">
                <i className="fas fa-video mr-2"></i>Camera Live
              </div>
            )}
          </div>

          {/* Bottom-sheet telemetry card */}
          <div className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-6 md:right-auto md:max-w-sm bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-5 text-white shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isMoving ? 'bg-success animate-pulse' : 'bg-slate-500'}`}></div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/60">
                  {hasArrived ? 'Arrived' : isMoving ? 'En Route' : 'Stationary'}
                </p>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 truncate">{busLabel}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Speed</p>
                <p className="text-xl md:text-2xl font-black tracking-tighter mt-1">
                  {speed != null ? speed : '—'}
                  <span className="text-[9px] font-bold text-white/50 ml-1">km/h</span>
                </p>
              </div>
              <div>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Status</p>
                <p className="text-base md:text-lg font-black tracking-tight mt-1.5">
                  {hasArrived ? 'At School' : isMoving ? 'Moving' : 'Idle'}
                </p>
              </div>
              <div>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Updated</p>
                <p className="text-base md:text-lg font-black tracking-tight mt-1.5">
                  {location ? 'Now' : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentLiveTracking;

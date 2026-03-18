import React, { useEffect, useMemo, useState } from 'react';
import { User } from '../../types';
import { supabase } from '../../lib/supabase';
import { useTracking } from '../../hooks/useTracking';
import GoogleMap from '../../components/GoogleMap';

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
          .select('id, full_name, bus_id, route_id, routes(route_name), buses(bus_number, vehicle_number)')
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
        <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-location-dot text-3xl text-slate-300"></i>
        </div>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Children Linked</h3>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Contact bus admin to link child profiles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Live Tracking</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Track only your children buses in real time</p>
        </div>

        {students.length > 1 && (
          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(String(student.id))}
                className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
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
        <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-lock text-3xl text-slate-300"></i>
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tracking Access Not Enabled</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Please contact bus admin to enable live tracking.</p>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-[3rem] overflow-hidden border border-slate-800 h-[600px] relative">
          <GoogleMap location={location} busId={selectedStudent?.bus_id} />

          <div className="absolute top-4 left-4 right-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="bg-black/80 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/10 text-white">
              <p className="text-[9px] font-black uppercase tracking-widest leading-none">
                {selectedStudent?.full_name || 'Student'} • {(selectedStudent as any)?.routes?.route_name || 'Route not assigned'}
              </p>
              <p className="text-[9px] font-bold text-white/70 mt-1 uppercase tracking-widest">
                {hasArrived
                  ? 'Bus reached school'
                  : `${(selectedStudent as any)?.buses?.vehicle_number || (selectedStudent as any)?.buses?.plate || (selectedStudent as any)?.buses?.bus_number || 'Bus'} live telemetry`}
              </p>
            </div>

            {cameraEnabled && (
              <div className="bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest">
                Bus Camera Enabled
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentLiveTracking;

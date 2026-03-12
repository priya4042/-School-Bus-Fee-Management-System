import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { supabase } from '../../lib/supabase';

interface ParentRouteStudent {
  id: string;
  full_name: string;
  admission_number: string;
  route_id?: string;
  routes?: {
    route_name?: string;
    code?: string;
    start_point?: string;
    end_point?: string;
  } | null;
  buses?: {
    bus_number?: string;
    plate?: string;
  } | null;
}

const ParentRoutes: React.FC<{ user: User }> = ({ user }) => {
  const [students, setStudents] = useState<ParentRouteStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildRoutes = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('students')
          .select('id, full_name, admission_number, route_id, routes(route_name, code, start_point, end_point), buses(bus_number, plate)')
          .eq('parent_id', user.id)
          .order('full_name', { ascending: true });

        if (error) throw error;
        setStudents((data || []) as ParentRouteStudent[]);
      } catch (err) {
        console.error('Failed to load parent routes:', err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChildRoutes();
  }, [user.id]);

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
          <i className="fas fa-route text-3xl text-slate-300"></i>
        </div>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Child Routes Found</h3>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Contact bus admin to assign routes to your children.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Child Route Details</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Only routes assigned to your children are shown</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {students.map((student: any) => {
          const route = student.routes;
          const bus = student.buses;

          return (
            <div key={student.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-5">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Student</p>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{student.full_name}</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admission #{student.admission_number}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Route Name</p>
                  <p className="text-sm font-black text-slate-800 uppercase">{route?.route_name || 'Not Assigned'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Start</p>
                    <p className="text-xs font-bold text-slate-700">{route?.start_point || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">End</p>
                    <p className="text-xs font-bold text-slate-700">{route?.end_point || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Bus</p>
                    <p className="text-xs font-bold text-slate-700 uppercase">{bus?.bus_number || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Plate</p>
                    <p className="text-xs font-bold text-slate-700 uppercase">{bus?.plate || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParentRoutes;

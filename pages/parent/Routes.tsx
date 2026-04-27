import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { supabase } from '../../lib/supabase';
import MiniLoader from '../../components/MiniLoader';
import { useLanguage } from '../../lib/i18n';

interface ParentRouteStudent {
  id: string;
  full_name: string;
  admission_number: string;
  boarding_point?: string;
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
          .select('id, full_name, admission_number, boarding_point, route_id, routes(route_name, code, start_point, end_point), buses(bus_number, plate)')
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
        <MiniLoader />
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
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-xl md:text-4xl font-black text-slate-900 tracking-tight">Child Route Details</h1>
        <p className="text-slate-500 font-bold text-[9px] md:text-[10px] tracking-widest mt-1">Only routes assigned to your children are shown</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {students.map((student: any, idx: number) => {
          const route = student.routes;
          const bus = student.buses;

          // Build a stop sequence with safe fallbacks
          const stops = [
            { label: 'Start', value: route?.start_point || 'N/A', icon: 'fa-flag', accent: 'bg-emerald-500' },
            { label: 'Boarding Point', value: student.boarding_point || 'Not Set', icon: 'fa-map-pin', accent: 'bg-primary', highlight: true },
            { label: 'End', value: route?.end_point || 'N/A', icon: 'fa-school', accent: 'bg-amber-500' },
          ];

          return (
            <div
              key={student.id}
              style={{ animationDelay: `${idx * 80}ms` }}
              className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm p-5 md:p-8 space-y-4 md:space-y-5 animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-lg flex-shrink-0">
                  {student.full_name?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-black text-slate-400 tracking-widest">Student</p>
                  <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight truncate">{student.full_name}</h3>
                  <p className="text-[9px] font-bold text-slate-400 tracking-widest">Admission #{student.admission_number}</p>
                </div>
                {route?.code && (
                  <span className="text-[9px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                    {route.code}
                  </span>
                )}
              </div>

              <div className="p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 tracking-widest mb-1">Route Name</p>
                <p className="text-sm font-black text-slate-800">{route?.route_name || 'Not Assigned'}</p>
              </div>

              {/* Vertical timeline of stops */}
              <div className="relative pl-7 space-y-4">
                <div className="absolute left-[10px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-emerald-500 via-primary to-amber-500"></div>
                {stops.map((stop, i) => (
                  <div
                    key={i}
                    className={`relative flex items-start gap-3 group ${stop.highlight ? '' : ''}`}
                  >
                    <span className={`absolute -left-7 top-1 w-5 h-5 rounded-full ${stop.accent} flex items-center justify-center text-white text-[8px] shadow-md ${stop.highlight ? 'ring-4 ring-primary/20 animate-pulse' : ''}`}>
                      <i className={`fas ${stop.icon}`}></i>
                    </span>
                    <div className={`flex-1 p-3 rounded-xl border ${stop.highlight ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-100'} transition-all group-hover:translate-x-1`}>
                      <p className={`text-[8px] font-black tracking-widest uppercase ${stop.highlight ? 'text-primary' : 'text-slate-400'}`}>
                        {stop.label}
                      </p>
                      <p className={`text-xs font-bold mt-0.5 ${stop.highlight ? 'text-blue-900' : 'text-slate-700'}`}>
                        {stop.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 md:gap-3 pt-1">
                <div className="p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 tracking-widest mb-1">Bus</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{bus?.bus_number || 'N/A'}</p>
                </div>
                <div className="p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 tracking-widest mb-1">Plate</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{bus?.plate || 'N/A'}</p>
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

import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Check, X, Shield, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/swal';

const Permissions: React.FC = () => {
  const [parents, setParents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [parentsRes, studentsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'PARENT').order('full_name'),
      supabase.from('students').select('id, full_name, admission_number, parent_id'),
    ]);
    setParents(parentsRes.data || []);
    setStudents(studentsRes.data || []);
    setLoading(false);
  };

  const updatePermission = async (parentId: string, key: 'camera' | 'tracking', value: boolean) => {
    setSaving(`${parentId}-${key}`);
    const parent = parents.find(p => p.id === parentId);
    const newPrefs = { ...(parent?.preferences || {}), [key]: value };
    const { error } = await supabase.from('profiles').update({ preferences: newPrefs }).eq('id', parentId);
    if (error) {
      showToast('Failed to update permission', 'error');
    } else {
      setParents(prev => prev.map(p => p.id === parentId ? { ...p, preferences: newPrefs } : p));
      showToast(`${key === 'camera' ? 'Camera' : 'Tracking'} ${value ? 'enabled' : 'disabled'} for ${parent?.full_name}`, 'success');
    }
    setSaving(null);
  };

  const grantAll = async (key: 'camera' | 'tracking') => {
    for (const parent of parents) {
      const newPrefs = { ...(parent.preferences || {}), [key]: true };
      await supabase.from('profiles').update({ preferences: newPrefs }).eq('id', parent.id);
    }
    setParents(prev => prev.map(p => ({ ...p, preferences: { ...(p.preferences || {}), [key]: true } })));
    showToast(`${key === 'camera' ? 'Camera' : 'Tracking'} enabled for all parents`, 'success');
  };

  const revokeAll = async (key: 'camera' | 'tracking') => {
    for (const parent of parents) {
      const newPrefs = { ...(parent.preferences || {}), [key]: false };
      await supabase.from('profiles').update({ preferences: newPrefs }).eq('id', parent.id);
    }
    setParents(prev => prev.map(p => ({ ...p, preferences: { ...(p.preferences || {}), [key]: false } })));
    showToast(`${key === 'camera' ? 'Camera' : 'Tracking'} revoked for all parents`, 'success');
  };

  const getStudentsForParent = (parentId: string) =>
    students.filter(s => s.parent_id === parentId);

  const cameraCount = parents.filter(p => p.preferences?.camera === true).length;
  const trackingCount = parents.filter(p => p.preferences?.tracking === true).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Access Control</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
            Camera & Live Tracking Permissions Per Parent
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl border border-slate-200 text-slate-500 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <p className="text-2xl font-black text-slate-900">{parents.length}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Parents</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <p className="text-2xl font-black text-primary">{cameraCount}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Camera Access</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <p className="text-2xl font-black text-emerald-600">{trackingCount}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Tracking Access</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <p className="text-2xl font-black text-slate-900">{students.length}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Linked Students</p>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex flex-wrap gap-3">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-center">Bulk:</span>
        <button onClick={() => grantAll('camera')} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2">
          <Camera size={12} /> Enable Camera — All
        </button>
        <button onClick={() => revokeAll('camera')} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all flex items-center gap-2">
          <Camera size={12} /> Revoke Camera — All
        </button>
        <button onClick={() => grantAll('tracking')} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2">
          <MapPin size={12} /> Enable Tracking — All
        </button>
        <button onClick={() => revokeAll('tracking')} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all flex items-center gap-2">
          <MapPin size={12} /> Revoke Tracking — All
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center">
          <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
        </div>
      ) : parents.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <Shield size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-black text-slate-900">No Parents Registered</h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">
            Parents must register through the portal first
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] items-center p-6 border-b border-slate-50 bg-slate-50/50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent / Students</span>
            <div className="w-32 text-center flex items-center justify-center gap-2">
              <Camera size={12} className="text-primary" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Camera</span>
            </div>
            <div className="w-32 text-center flex items-center justify-center gap-2">
              <MapPin size={12} className="text-emerald-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking</span>
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {parents.map((parent) => {
              const childStudents = getStudentsForParent(parent.id);
              const cameraEnabled = parent.preferences?.camera === true;
              const trackingEnabled = parent.preferences?.tracking === true;

              return (
                <div key={parent.id} className="grid grid-cols-[1fr_auto_auto] items-center p-6 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{parent.full_name || 'Unknown'}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {parent.phone_number || parent.email}
                    </p>
                    {childStudents.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {childStudents.map(s => (
                          <span key={s.id} className="text-[8px] font-black uppercase tracking-widest bg-primary/5 text-primary px-2 py-1 rounded-lg">
                            {s.full_name} • #{s.admission_number}
                          </span>
                        ))}
                      </div>
                    )}
                    {childStudents.length === 0 && (
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1 block">No student linked</span>
                    )}
                  </div>

                  {/* Camera toggle */}
                  <div className="w-32 flex justify-center">
                    <button
                      disabled={saving === `${parent.id}-camera`}
                      onClick={() => updatePermission(parent.id, 'camera', !cameraEnabled)}
                      className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none ${cameraEnabled ? 'bg-primary' : 'bg-slate-200'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 flex items-center justify-center ${cameraEnabled ? 'translate-x-7' : ''}`}>
                        {saving === `${parent.id}-camera`
                          ? <i className="fas fa-circle-notch fa-spin text-primary text-[8px]"></i>
                          : cameraEnabled
                            ? <Check size={10} className="text-primary" />
                            : <X size={10} className="text-slate-400" />
                        }
                      </span>
                    </button>
                  </div>

                  {/* Tracking toggle */}
                  <div className="w-32 flex justify-center">
                    <button
                      disabled={saving === `${parent.id}-tracking`}
                      onClick={() => updatePermission(parent.id, 'tracking', !trackingEnabled)}
                      className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none ${trackingEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 flex items-center justify-center ${trackingEnabled ? 'translate-x-7' : ''}`}>
                        {saving === `${parent.id}-tracking`
                          ? <i className="fas fa-circle-notch fa-spin text-emerald-500 text-[8px]"></i>
                          : trackingEnabled
                            ? <Check size={10} className="text-emerald-500" />
                            : <X size={10} className="text-slate-400" />
                        }
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;

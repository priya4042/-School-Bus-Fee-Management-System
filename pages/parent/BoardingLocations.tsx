import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Star, CheckCircle2, AlertCircle, Navigation } from 'lucide-react';
import BoardingLocationPicker from '../../components/Location/BoardingLocationPicker';
import { User } from '../../types';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/swal';

interface BoardingLocation {
  id: string;
  location_name: string;
  address: string;
  latitude: number;
  longitude: number;
  landmark: string;
  special_instructions: string;
  is_primary: boolean;
}

const BOARDING_TABLES = ['boarding_points', 'boarding_locations'] as const;

const normalizeLocation = (row: any): BoardingLocation => ({
  id: String(row?.id || ''),
  location_name: String(row?.location_name || row?.name || row?.label || 'Boarding Point'),
  address: String(row?.address || row?.location_address || ''),
  latitude: Number(row?.latitude ?? row?.lat ?? 0),
  longitude: Number(row?.longitude ?? row?.lng ?? 0),
  landmark: String(row?.landmark || row?.nearby_landmark || ''),
  special_instructions: String(row?.special_instructions || row?.instructions || ''),
  is_primary: Boolean(row?.is_primary ?? row?.primary ?? false),
});

const isMissingOrDenied = (error: any) => {
  if (!error) return false;
  const status = error?.status;
  const code = error?.code;
  const message = String(error?.message || '').toLowerCase();
  return (
    status === 404 ||
    code === 'PGRST205' ||
    code === '42P01' ||
    code === '42501' ||
    message.includes('not found') ||
    message.includes('does not exist') ||
    message.includes('permission denied') ||
    message.includes('row-level security')
  );
};

const BoardingLocations: React.FC<{ user: User }> = ({ user }) => {
  const [locations, setLocations] = useState<BoardingLocation[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const { data: studentData, error } = await supabase
        .from('students')
        .select('id, full_name')
        .eq('parent_id', user.id)
        .order('full_name', { ascending: true });

      if (error) throw error;

      setStudents(studentData || []);
      if (studentData && studentData.length > 0) {
        const firstStudentId = String(studentData[0].id);
        setSelectedStudent(firstStudentId);
        await fetchLocations(firstStudentId);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load student list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async (studentId: string) => {
    try {
      let loaded = false;
      let hasUnexpectedError = false;

      for (const table of BOARDING_TABLES) {
        let data: any[] | null = null;
        let error: any = null;

        const preferredQuery = supabase
          .from(table)
          .select('id, location_name, address, latitude, longitude, landmark, special_instructions, is_primary')
          .eq('student_id', studentId);

        ({ data, error } = table === 'boarding_locations'
          ? await preferredQuery.eq('is_active', true).order('created_at', { ascending: false })
          : await preferredQuery.order('id', { ascending: false }));

        if (error && error.status === 400) {
          const fallbackQuery = supabase
            .from(table)
            .select('*')
            .eq('student_id', studentId);

          ({ data, error } = table === 'boarding_locations'
            ? await fallbackQuery.eq('is_active', true).order('created_at', { ascending: false })
            : await fallbackQuery.order('id', { ascending: false }));
        }

        if (!error) {
          setLocations((data || []).map(normalizeLocation));
          loaded = true;
          break;
        }

        if (!isMissingOrDenied(error)) {
          console.error('Boarding locations query error:', error);
          hasUnexpectedError = true;
          break;
        }
      }

      if (!loaded) {
        setLocations([]);
        if (hasUnexpectedError) {
          showToast('Failed to load boarding points', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      setLocations([]);
      showToast('Failed to load boarding points', 'error');
    }
  };

  const handleSaveLocation = async (data: any) => {
    try {
      if (!selectedStudent) {
        throw new Error('No student selected');
      }

      const payload = {
        ...data,
        student_id: selectedStudent,
      };

      let saved = false;
      for (const table of BOARDING_TABLES) {
        const insertPayload = table === 'boarding_locations'
          ? { ...payload, is_active: true }
          : payload;

        const { error } = await supabase.from(table).insert(insertPayload);
        if (!error) {
          saved = true;
          break;
        }

        if (!isMissingOrDenied(error)) {
          throw error;
        }
      }

      if (!saved) {
        throw new Error('Unable to save boarding point with current table configuration.');
      }

      fetchLocations(selectedStudent);
      setIsAdding(false);
      showToast('Boarding point saved successfully', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to save location. Please try again.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      let removed = false;
      for (const table of BOARDING_TABLES) {
        const { error } = table === 'boarding_locations'
          ? await supabase.from(table).update({ is_active: false }).eq('id', id)
          : await supabase.from(table).delete().eq('id', id);

        if (!error) {
          removed = true;
          break;
        }

        if (!isMissingOrDenied(error)) {
          throw error;
        }
      }

      if (!removed) {
        throw new Error('Unable to remove boarding point with current table configuration.');
      }

      fetchLocations(selectedStudent);
      showToast('Boarding point removed', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to delete location. Please try again.', 'error');
    }
  };


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Boarding Points</h1>
          <p className="text-slate-500 font-medium mt-2">Manage pickup and drop locations for your children</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Location
        </button>
      </div>

      {students.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => {
                const studentId = String(student.id);
                setSelectedStudent(studentId);
                fetchLocations(studentId);
              }}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                selectedStudent === String(student.id) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              {student.full_name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-slate-100 group hover:border-primary/20 transition-all flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <MapPin size={28} />
              </div>
              <div className="flex gap-2">
                {loc.is_primary && (
                  <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                    <Star size={8} fill="currentColor" /> Primary
                  </span>
                )}
                <button 
                  onClick={() => handleDelete(loc.id)}
                  className="p-2 text-slate-300 hover:text-danger transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{loc.location_name}</h3>
            <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2">{loc.address}</p>

            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-3 text-slate-400">
                <Navigation size={14} />
                <span className="text-xs font-mono">
                  {Number.isFinite(loc.latitude) && Number.isFinite(loc.longitude)
                    ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
                    : 'Coordinates unavailable'}
                </span>
              </div>
              {loc.landmark && (
                <div className="flex items-center gap-3 text-slate-400">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-xs font-medium">Near {loc.landmark}</span>
                </div>
              )}
            </div>

            <button className="w-full bg-slate-50 text-slate-600 py-4 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
              View on Map
            </button>
          </div>
        ))}

        {locations.length === 0 && !loading && (
          <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-6 shadow-sm">
              <MapPin size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Boarding Points Found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">Add your home or pickup location to help the driver find you easily.</p>
          </div>
        )}
      </div>

      {isAdding && (
        <BoardingLocationPicker 
          onSave={handleSaveLocation}
          onClose={() => setIsAdding(false)}
        />
      )}
    </div>
  );
};

export default BoardingLocations;

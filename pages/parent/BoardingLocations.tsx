import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Star, CheckCircle2, AlertCircle, Navigation } from 'lucide-react';
import BoardingLocationPicker from '../../components/Location/BoardingLocationPicker';
import axios from 'axios';
import { User } from '../../types';

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

const BoardingLocations: React.FC<{ user: User }> = ({ user }) => {
  const [locations, setLocations] = useState<BoardingLocation[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const studentRes = await axios.get('/api/v1/students/parent');
      setStudents(studentRes.data);
      if (studentRes.data.length > 0) {
        setSelectedStudent(studentRes.data[0].id);
        fetchLocations(studentRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async (studentId: string) => {
    try {
      const res = await axios.get(`/api/v1/students/${studentId}/boarding`);
      setLocations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveLocation = async (data: any) => {
    try {
      await axios.post(`/api/v1/students/${selectedStudent}/boarding`, data);
      fetchLocations(selectedStudent);
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/v1/boarding/${id}`);
      fetchLocations(selectedStudent);
    } catch (err) {
      console.error(err);
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
                setSelectedStudent(student.id);
                fetchLocations(student.id);
              }}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                selectedStudent === student.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
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
                <span className="text-xs font-mono">{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</span>
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

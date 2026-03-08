
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Student } from '../types';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  GraduationCap,
  Phone,
  MapPin,
  Bus,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Modal from '../components/Modal';
import { showToast, showConfirm } from '../lib/swal';

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('students');
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm('Delete Student?', 'This action cannot be undone.');
    if (confirmed) {
      try {
        await api.delete(`students/${id}`);
        showToast('Student deleted successfully');
        fetchStudents();
      } catch (err) {
        showToast('Failed to delete student', 'error');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Student Registry</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage Enrollment & Logistics</p>
        </div>
        <button 
          onClick={() => { setSelectedStudent(null); setIsModalOpen(true); }}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/30 hover:bg-primary-dark hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 active:scale-95 active:translate-y-0"
        >
          <UserPlus size={18} />
          Enroll New Student
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center px-6 py-4 focus-within:ring-4 ring-primary/10 transition-all">
          <Search size={20} className="text-slate-400 mr-4" />
          <input 
            type="text" 
            placeholder="Search by name or admission number..." 
            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 placeholder:text-slate-300 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-white px-6 py-4 rounded-2xl border border-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3">
          <Filter size={18} />
          Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 animate-pulse h-64"></div>
          ))
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map(student => (
            <div key={student.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-700"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <GraduationCap size={32} />
                </div>
                <div className="flex gap-2">
                  <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                    student.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    {student.status}
                  </span>
                  <button className="p-2 text-slate-300 hover:text-primary transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1 group-hover:text-primary transition-colors">{student.full_name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">ID: {student.admission_number} • {student.grade} - {student.section}</p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors">
                    <Bus size={14} />
                  </div>
                  <span className="text-xs font-bold">{student.route_name || 'No Route Assigned'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors">
                    <MapPin size={14} />
                  </div>
                  <span className="text-xs font-bold truncate">{student.boarding_point || 'No Boarding Point'}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-50 relative z-10">
                <button 
                  onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }}
                  className="flex-1 py-3 bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm hover:shadow-lg active:scale-95"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => handleDelete(student.id)}
                  className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-lg active:scale-95"
                >
                  <XCircle size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-6 shadow-sm">
              <GraduationCap size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Students Found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">Try adjusting your search or enroll a new student to get started.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedStudent ? 'Edit Student' : 'Enroll Student'}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input type="text" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission No</label>
              <input type="text" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" placeholder="ADM-001" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade</label>
              <input type="text" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" placeholder="10th" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Section</label>
              <input type="text" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" placeholder="A" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Fee (₹)</label>
            <input type="number" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" placeholder="1500" />
          </div>
          <button className="w-full py-5 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all mt-4">
            {selectedStudent ? 'Update Profile' : 'Complete Enrollment'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Students;

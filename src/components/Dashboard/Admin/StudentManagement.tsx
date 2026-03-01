import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  UserPlus, 
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  admission_number: string;
  full_name: string;
  grade: string;
  section: string;
  bus_id: string | null;
  route_id: string | null;
  monthly_fee: number;
  status: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  boarding_point?: string;
  buses?: { bus_number: string };
  routes?: { route_name: string };
}

export default function StudentManagement({ isDarkMode }: { isDarkMode: boolean }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    admissionNumber: '',
    fullName: '',
    grade: '',
    section: '',
    busId: '',
    routeId: '',
    monthlyFee: '',
    parentPhone: '',
    parentEmail: '',
    parentName: '',
    boardingPoint: ''
  });

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const [studentsRes, busesRes, routesRes] = await Promise.all([
        fetch('/api/admin/students', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/admin/buses', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/admin/routes', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      ]);
      
      const studentsData = await studentsRes.json();
      const busesData = await busesRes.json();
      const routesData = await routesRes.json();

      if (studentsRes.ok) setStudents(studentsData || []);
      if (busesRes.ok) setBuses(busesData || []);
      if (routesRes.ok) setRoutes(routesData || []);
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      admissionNumber: student.admission_number,
      fullName: student.full_name,
      grade: student.grade,
      section: student.section,
      busId: student.bus_id || '',
      routeId: student.route_id || '',
      monthlyFee: student.monthly_fee.toString(),
      parentPhone: student.parent_phone || '',
      parentEmail: student.parent_email || '',
      parentName: student.parent_name || '',
      boardingPoint: student.boarding_point || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      const response = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        toast.success('Student deleted successfully');
        fetchStudents();
      } else {
        toast.error('Failed to delete student');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = editingStudent ? `/api/admin/students/${editingStudent.id}` : '/api/admin/students';
      const method = editingStudent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(editingStudent ? 'Student updated successfully' : 'Student added successfully');
        setIsModalOpen(false);
        setEditingStudent(null);
        fetchStudents();
        setFormData({
          admissionNumber: '',
          fullName: '',
          grade: '',
          section: '',
          busId: '',
          routeId: '',
          monthlyFee: '',
          parentPhone: '',
          parentEmail: '',
          parentName: '',
          boardingPoint: ''
        });
      } else {
        toast.error(data.error || 'Failed to save student');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.admission_number.includes(searchQuery);
    const matchesGrade = filterGrade === 'all' || s.grade === filterGrade;
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    
    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Student Directory</h2>
          <p className="text-zinc-500 text-sm">Manage student records and bus assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchStudents}
            className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <UserPlus size={20} />
            Add New Student
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder="Search by name or admission number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="pl-12 pr-8 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white appearance-none"
            >
              <option value="all">All Grades</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
              <option value="6">Grade 6</option>
              <option value="7">Grade 7</option>
              <option value="8">Grade 8</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-zinc-800 bg-zinc-800/50' : 'border-zinc-100 bg-zinc-50/50'}`}>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Student</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Admission #</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Class</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Bus/Route</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Fee Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-emerald-500 mb-2" size={32} />
                    <p className="text-zinc-500">Loading students...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No students found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold">
                          {student.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white">{student.full_name}</p>
                          <p className="text-xs text-zinc-500">Parent: Not Linked</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-zinc-600 dark:text-zinc-400">
                      {student.admission_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {student.grade} - {student.section}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                          {student.buses?.bus_number || 'Unassigned'}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {student.routes?.route_name || 'No Route'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 size={12} />
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(student)}
                          className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h3>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingStudent(null);
                  }} 
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
                >
                  <XCircle size={24} className="text-zinc-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Info */}
                  <div className="col-span-full border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Student Information</h4>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Admission Number</label>
                    <input 
                      required
                      value={formData.admissionNumber}
                      onChange={(e) => setFormData({...formData, admissionNumber: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
                      placeholder="e.g. ADM2024001"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Full Name</label>
                    <input 
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Grade/Class</label>
                    <input 
                      required
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
                      placeholder="e.g. 10th"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Section</label>
                    <input 
                      required
                      value={formData.section}
                      onChange={(e) => setFormData({...formData, section: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
                      placeholder="e.g. A"
                    />
                  </div>

                  {/* Parent Info */}
                  <div className="col-span-full border-b border-zinc-100 dark:border-zinc-800 pb-2 mt-4">
                    <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Parent Information</h4>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Parent Name</label>
                    <input 
                      required
                      value={formData.parentName}
                      onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
                      placeholder="e.g. Robert Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Parent Phone</label>
                    <input 
                      required
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
                      placeholder="e.g. +919876543210"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Parent Email</label>
                    <input 
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
                      placeholder="e.g. parent@example.com"
                    />
                  </div>

                  {/* Transport Info */}
                  <div className="col-span-full border-b border-zinc-100 dark:border-zinc-800 pb-2 mt-4">
                    <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Transport Information</h4>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Assigned Bus</label>
                    <select 
                      value={formData.busId}
                      onChange={(e) => setFormData({...formData, busId: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
                    >
                      <option value="">Select Bus</option>
                      {buses.map(b => <option key={b.id} value={b.id}>{b.bus_number}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Assigned Route</label>
                    <select 
                      value={formData.routeId}
                      onChange={(e) => setFormData({...formData, routeId: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
                    >
                      <option value="">Select Route</option>
                      {routes.map(r => <option key={r.id} value={r.id}>{r.route_name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Boarding Point</label>
                    <input 
                      value={formData.boardingPoint}
                      onChange={(e) => setFormData({...formData, boardingPoint: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
                      placeholder="e.g. Main Gate"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Monthly Fee (₹)</label>
                    <input 
                      required
                      type="number"
                      value={formData.monthlyFee}
                      onChange={(e) => setFormData({...formData, monthlyFee: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
                      placeholder="e.g. 2500"
                    />
                  </div>
                </div>
                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Save Student"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  User, 
  Phone, 
  Mail, 
  Bus as BusIcon, 
  Edit2, 
  Trash2, 
  Loader2,
  XCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

interface Driver {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  role: string;
  assigned_bus?: string;
}

export default function DriverManagement({ isDarkMode }: { isDarkMode: boolean }) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: ''
  });

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/drivers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setDrivers(data);
      } else {
        setDrivers([]);
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;
    try {
      const response = await fetch(`/api/admin/drivers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        toast.success('Driver deleted');
        fetchDrivers();
      }
    } catch (err) {
      toast.error('Failed to delete driver');
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingId(driver.id);
    setFormData({
      fullName: driver.full_name,
      phoneNumber: driver.phone_number,
      email: driver.email,
      password: '' // Don't show password
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = editingId ? `/api/admin/drivers/${editingId}` : '/api/admin/drivers';
      const method = editingId ? 'PUT' : 'POST';
      
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
        toast.success(editingId ? 'Driver updated' : 'Driver registered');
        setIsModalOpen(false);
        setEditingId(null);
        fetchDrivers();
        setFormData({ fullName: '', phoneNumber: '', email: '', password: '' });
      } else {
        toast.error(data.error || 'Failed to save driver');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Driver Directory</h2>
          <p className="text-zinc-500 text-sm">Manage driver accounts and bus assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDrivers}
            className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Plus size={20} />
            Register New Driver
          </button>
        </div>
      </div>

      {/* Driver List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="mx-auto animate-spin text-indigo-500 mb-4" size={48} />
            <p className="text-zinc-500">Loading driver records...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
            <User size={48} className="mx-auto text-zinc-300 mb-4" />
            <p className="text-zinc-500">No drivers registered yet.</p>
          </div>
        ) : (
          drivers.map((driver) => (
            <div 
              key={driver.id}
              className={`p-6 rounded-3xl border flex items-center gap-6 group transition-all hover:shadow-lg ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}
            >
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 overflow-hidden">
                <img src={`https://picsum.photos/seed/${driver.id}/200/200`} alt={driver.full_name} referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate">{driver.full_name}</h3>
                  <ShieldCheck size={16} className="text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Phone size={14} />
                    <span>{driver.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Mail size={14} />
                    <span className="truncate">{driver.email}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                    <BusIcon size={12} />
                    {driver.assigned_bus || 'Unassigned'}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(driver)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(driver.id)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {editingId ? 'Edit Driver' : 'Register Driver'}
                </h3>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                  }} 
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
                >
                  <XCircle size={24} className="text-zinc-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Full Name</label>
                  <input 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-white"
                    placeholder="e.g. Rajesh Kumar"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Phone Number</label>
                  <input 
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-white"
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Email Address</label>
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-white"
                    placeholder="e.g. rajesh@busway.pro"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                    {editingId ? 'New Password (leave blank to keep current)' : 'Initial Password'}
                  </label>
                  <input 
                    required={!editingId}
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingId(null);
                    }}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : (editingId ? "Update Driver" : "Register Driver")}
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

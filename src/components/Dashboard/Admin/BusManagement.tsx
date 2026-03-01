import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Bus as BusIcon, 
  Edit2, 
  Trash2, 
  Loader2,
  XCircle,
  Settings,
  Shield,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

interface Bus {
  id: string;
  bus_number: string;
  model: string;
  capacity: number;
  status: string;
  route_id: string | null;
  routes?: { route_name: string };
}

export default function BusManagement({ isDarkMode }: { isDarkMode: boolean }) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    busNumber: '',
    model: '',
    capacity: '',
    status: 'active',
    routeId: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [busesRes, routesRes] = await Promise.all([
        fetch('/api/admin/buses', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/admin/routes', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      ]);
      
      if (busesRes.ok) setBuses(await busesRes.json() || []);
      if (routesRes.ok) setRoutes(await routesRes.json() || []);
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bus?')) return;
    try {
      const response = await fetch(`/api/admin/buses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        toast.success('Bus deleted');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to delete bus');
    }
  };

  const handleEdit = (bus: Bus) => {
    setEditingId(bus.id);
    setFormData({
      busNumber: bus.bus_number,
      model: bus.model || '',
      capacity: bus.capacity.toString(),
      status: bus.status || 'active',
      routeId: bus.route_id || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = editingId ? `/api/admin/buses/${editingId}` : '/api/admin/buses';
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
        toast.success(editingId ? 'Bus updated' : 'Bus added');
        setIsModalOpen(false);
        setEditingId(null);
        fetchData();
        setFormData({ busNumber: '', model: '', capacity: '', status: 'active', routeId: '' });
      } else {
        toast.error(data.error || 'Failed to save bus');
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
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Fleet Management</h2>
          <p className="text-zinc-500 text-sm">Monitor and manage your vehicle fleet</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus size={20} />
            Add New Bus
          </button>
        </div>
      </div>

      {/* Bus Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="mx-auto animate-spin text-blue-500 mb-4" size={48} />
            <p className="text-zinc-500">Loading fleet data...</p>
          </div>
        ) : buses.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
            <BusIcon size={48} className="mx-auto text-zinc-300 mb-4" />
            <p className="text-zinc-500">No buses registered yet.</p>
          </div>
        ) : (
          buses.map((bus) => (
            <motion.div 
              key={bus.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border transition-all hover:shadow-xl group ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${bus.status === 'active' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-amber-500 shadow-amber-500/20'}`}>
                  <BusIcon size={28} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(bus)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(bus.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{bus.bus_number}</h3>
                  <p className="text-sm text-zinc-500">{bus.model}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{bus.capacity} Seats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Route 101</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${bus.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {bus.status}
                  </span>
                  <button className="text-xs font-bold text-blue-600 hover:underline">View Live</button>
                </div>
              </div>
            </motion.div>
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
                  {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
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
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Bus Number</label>
                  <input 
                    required
                    value={formData.busNumber}
                    onChange={(e) => setFormData({...formData, busNumber: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-zinc-900 dark:text-white"
                    placeholder="e.g. MH-12-AB-1234"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Model / Type</label>
                  <input 
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-zinc-900 dark:text-white"
                    placeholder="e.g. Tata Starbus 25-Seater"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Capacity</label>
                  <input 
                    required
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-zinc-900 dark:text-white"
                    placeholder="e.g. 25"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Assign Route</label>
                  <select
                    value={formData.routeId}
                    onChange={(e) => setFormData({...formData, routeId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-zinc-900 dark:text-white appearance-none"
                  >
                    <option value="">Select Route</option>
                    {routes.map(route => (
                      <option key={route.id} value={route.id}>{route.route_name}</option>
                    ))}
                  </select>
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
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : (editingId ? "Update Bus" : "Add Bus")}
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

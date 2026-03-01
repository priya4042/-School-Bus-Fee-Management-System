import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  Navigation, 
  Edit2, 
  Trash2, 
  Loader2,
  XCircle,
  Clock,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

interface Route {
  id: string;
  route_name: string;
  start_point: string;
  end_point: string;
  stops?: any[];
}

export default function RouteManagement({ isDarkMode }: { isDarkMode: boolean }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    routeName: '',
    startPoint: '',
    endPoint: '',
    stops: []
  });

  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/routes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setRoutes(data || []);
      } else {
        setRoutes([]);
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      const response = await fetch(`/api/admin/routes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        toast.success('Route deleted');
        fetchRoutes();
      }
    } catch (err) {
      toast.error('Failed to delete route');
    }
  };

  const handleEdit = (route: Route) => {
    setEditingId(route.id);
    setFormData({
      routeName: route.route_name,
      startPoint: route.start_point,
      endPoint: route.end_point,
      stops: route.stops || []
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = editingId ? `/api/admin/routes/${editingId}` : '/api/admin/routes';
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
        toast.success(editingId ? 'Route updated' : 'Route created');
        setIsModalOpen(false);
        setEditingId(null);
        fetchRoutes();
        setFormData({ routeName: '', startPoint: '', endPoint: '', stops: [] });
      } else {
        toast.error(data.error || 'Failed to save route');
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
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Route Planning</h2>
          <p className="text-zinc-500 text-sm">Define bus routes and pickup points</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchRoutes}
            className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95"
          >
            <Plus size={20} />
            Create New Route
          </button>
        </div>
      </div>

      {/* Route List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto animate-spin text-purple-500 mb-4" size={48} />
            <p className="text-zinc-500">Loading routes...</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
            <Navigation size={48} className="mx-auto text-zinc-300 mb-4" />
            <p className="text-zinc-500">No routes defined yet.</p>
          </div>
        ) : (
          routes.map((route) => (
            <motion.div 
              key={route.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-6 rounded-3xl border group transition-all hover:shadow-lg ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 shrink-0">
                  <Navigation size={32} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{route.route_name}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Active</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-emerald-500" />
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{route.start_point}</span>
                    </div>
                    <ChevronRight size={14} className="text-zinc-300" />
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-red-500" />
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{route.end_point}</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <Clock size={14} />
                      <span>Est. 45 mins</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
                    View Stops
                  </button>
                  <button 
                    onClick={() => handleEdit(route)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(route.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
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
                  {editingId ? 'Edit Route' : 'Create Route'}
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
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Route Name</label>
                  <input 
                    required
                    value={formData.routeName}
                    onChange={(e) => setFormData({...formData, routeName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-purple-500 transition-all text-zinc-900 dark:text-white"
                    placeholder="e.g. North Sector Express"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Start Point</label>
                  <input 
                    required
                    value={formData.startPoint}
                    onChange={(e) => setFormData({...formData, startPoint: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-purple-500 transition-all text-zinc-900 dark:text-white"
                    placeholder="e.g. Main School Gate"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">End Point</label>
                  <input 
                    required
                    value={formData.endPoint}
                    onChange={(e) => setFormData({...formData, endPoint: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-purple-500 transition-all text-zinc-900 dark:text-white"
                    placeholder="e.g. City Center Hub"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Stops</label>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, stops: [...formData.stops, { stop_name: '' }]})}
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Stop
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {formData.stops.map((stop, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 shrink-0">
                          {index + 1}
                        </div>
                        <input 
                          required
                          value={stop.stop_name}
                          onChange={(e) => {
                            const newStops = [...formData.stops];
                            newStops[index].stop_name = e.target.value;
                            setFormData({...formData, stops: newStops});
                          }}
                          className="flex-1 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-purple-500 text-sm text-zinc-900 dark:text-white"
                          placeholder="Stop Name"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const newStops = formData.stops.filter((_, i) => i !== index);
                            setFormData({...formData, stops: newStops});
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ))}
                    {formData.stops.length === 0 && (
                      <p className="text-xs text-zinc-500 text-center py-2">No stops added yet.</p>
                    )}
                  </div>
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
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-purple-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : (editingId ? "Update Route" : "Create Route")}
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

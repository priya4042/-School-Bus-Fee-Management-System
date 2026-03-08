
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Route } from '../types';
import { 
  Search, 
  Plus, 
  MapPin, 
  Navigation, 
  MoreVertical, 
  Route as RouteIcon,
  Clock,
  Users,
  IndianRupee,
  ChevronRight,
  Trash2,
  Edit2
} from 'lucide-react';
import Modal from '../components/Modal';
import { showToast, showConfirm } from '../lib/swal';

const Routes: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const { data } = await api.get('routes');
      setRoutes(data || []);
    } catch (err) {
      console.error('Failed to fetch routes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm('Delete Route?', 'This will affect all students assigned to this route.');
    if (confirmed) {
      try {
        await api.delete(`routes/${id}`);
        showToast('Route deleted successfully');
        fetchRoutes();
      } catch (err) {
        showToast('Failed to delete route', 'error');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Fleet Routes</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Network Mapping & Logistics</p>
        </div>
        <button 
          onClick={() => { setSelectedRoute(null); setIsModalOpen(true); }}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/30 hover:bg-primary-dark hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 active:scale-95 active:translate-y-0"
        >
          <Plus size={18} />
          Create New Route
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 animate-pulse h-80"></div>
          ))
        ) : routes.length > 0 ? (
          routes.map(route => (
            <div key={route.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-700"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <RouteIcon size={32} />
                </div>
                <div className="flex gap-2">
                  <span className="bg-slate-950 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {route.code}
                  </span>
                  <button className="p-2 text-slate-300 hover:text-primary transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 group-hover:text-primary transition-colors">{route.route_name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Navigation size={12} className="text-primary" />
                {route.distance_km} KM Total Distance
              </p>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Fee</p>
                  <p className="text-lg font-black text-slate-800">₹{route.base_fee.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Students</p>
                  <p className="text-lg font-black text-slate-800">24</p>
                </div>
              </div>

              <div className="flex gap-3 pt-8 border-t border-slate-50 relative z-10">
                <button 
                  onClick={() => { setSelectedRoute(route); setIsModalOpen(true); }}
                  className="flex-1 py-4 bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <Edit2 size={14} />
                  Edit Route
                </button>
                <button 
                  onClick={() => handleDelete(route.id)}
                  className="px-5 py-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-lg active:scale-95"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-6 shadow-sm">
              <RouteIcon size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Routes Defined</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">Create your first route to start mapping your fleet operations.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedRoute ? 'Edit Route' : 'Create Route'}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Route Name</label>
            <input type="text" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" placeholder="Kangra Main Express" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Route Code</label>
              <input type="text" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" placeholder="KNG-01" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Fee (₹)</label>
              <input type="number" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" placeholder="1800" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Distance (KM)</label>
            <input type="number" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" placeholder="15" />
          </div>
          <button className="w-full py-5 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all mt-4">
            {selectedRoute ? 'Update Route' : 'Establish Route'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Routes;

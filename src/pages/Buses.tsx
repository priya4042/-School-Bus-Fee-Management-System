
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Bus as BusType } from '../types';
import { 
  Plus, 
  Bus as BusIcon, 
  MoreVertical, 
  ShieldCheck, 
  AlertTriangle, 
  Settings, 
  Calendar,
  User,
  Fuel,
  Gauge,
  CheckCircle2,
  XCircle,
  Wrench
} from 'lucide-react';
import Modal from '../components/Modal';
import { showToast, showConfirm } from '../lib/swal';

const Buses: React.FC = () => {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const { data } = await api.get('buses');
      setBuses(data || []);
    } catch (err) {
      console.error('Failed to fetch buses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm('Decommission Bus?', 'This will remove the bus from active fleet operations.');
    if (confirmed) {
      try {
        await api.delete(`buses/${id}`);
        showToast('Bus removed successfully');
        fetchBuses();
      } catch (err) {
        showToast('Failed to remove bus', 'error');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Fleet Management</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Vehicle Assets & Maintenance</p>
        </div>
        <button 
          onClick={() => { setSelectedBus(null); setIsModalOpen(true); }}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/30 hover:bg-primary-dark hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 active:scale-95 active:translate-y-0"
        >
          <Plus size={18} />
          Add New Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 animate-pulse h-96"></div>
          ))
        ) : buses.length > 0 ? (
          buses.map(bus => (
            <div key={bus.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-700"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <BusIcon size={32} />
                </div>
                <div className="flex gap-2">
                  <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                    bus.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {bus.status}
                  </span>
                  <button className="p-2 text-slate-300 hover:text-primary transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 group-hover:text-primary transition-colors">{bus.bus_number}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <ShieldCheck size={12} className="text-primary" />
                Insurance Valid: {new Date(bus.insurance_expiry).toLocaleDateString()}
              </p>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Capacity</p>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-300" />
                    <p className="text-lg font-black text-slate-800">{bus.capacity} Seats</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fuel Type</p>
                  <div className="flex items-center gap-2">
                    <Fuel size={14} className="text-slate-300" />
                    <p className="text-lg font-black text-slate-800 uppercase">{bus.fuel_type}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-8 border-t border-slate-50 relative z-10">
                <button 
                  onClick={() => { setSelectedBus(bus); setIsModalOpen(true); }}
                  className="flex-1 py-4 bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <Wrench size={14} />
                  Maintenance
                </button>
                <button 
                  onClick={() => handleDelete(bus.id)}
                  className="px-5 py-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-lg active:scale-95"
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-6 shadow-sm">
              <BusIcon size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Vehicles Found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">Add your first vehicle to start tracking your fleet assets.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedBus ? 'Edit Vehicle' : 'Add Vehicle'}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Registration Number</label>
            <input type="text" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" placeholder="HP-68-1234" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacity</label>
              <input type="number" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" placeholder="40" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fuel Type</label>
              <select className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none">
                <option>Diesel</option>
                <option>CNG</option>
                <option>Electric</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Insurance Expiry</label>
            <input type="date" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none" />
          </div>
          <button className="w-full py-5 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all mt-4">
            {selectedBus ? 'Update Vehicle' : 'Register Vehicle'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Buses;

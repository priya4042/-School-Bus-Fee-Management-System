import React, { useState } from 'react';
import { useBuses } from '../hooks/useBuses';
import { useRoutes } from '../hooks/useRoutes';
import Modal from '../components/Modal';
import { showConfirm, showToast, showLoading, closeSwal } from '../lib/swal';

const Buses: React.FC = () => {
  const { buses, loading, registerBus, updateBus, deleteBus } = useBuses();
  const { routes } = useRoutes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    capacity: 40,
    status: 'IDLE' as any,
    route_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoading('Syncing Records...');
    
    let success = false;
    if (editingId) {
      success = await updateBus(editingId, formData);
    } else {
      success = await registerBus(formData);
    }
    
    closeSwal();
    if (success) {
      setIsModalOpen(false);
      resetForm();
      showToast(editingId ? 'Vehicle updated' : 'Vehicle registered', 'success');
    }
  };

  const resetForm = () => {
    setFormData({ plate: '', model: '', capacity: 40, status: 'IDLE', route_id: '' });
    setEditingId(null);
  };

  const handleEdit = (bus: any) => {
    setFormData({
      plate: bus.plate,
      model: bus.model,
      capacity: bus.capacity,
      status: bus.status,
      route_id: bus.route_id || ''
    });
    setEditingId(bus.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, plate: string) => {
    const confirmed = await showConfirm(
      'Decommission Vehicle?',
      `Are you sure you want to remove ${plate} from the active fleet?`,
      'Remove Asset'
    );
    if (confirmed) {
      showLoading('Removing Asset...');
      await deleteBus(id);
      closeSwal();
      showToast('Asset removed successfully', 'info');
    }
  };

  const inputClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-slate-800 placeholder-slate-300 transition-all";
  const selectClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold bg-white text-slate-800 cursor-pointer transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Fleet Asset Control</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Active vehicle inventory and monitoring</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20"
        >
          <i className="fas fa-bus-alt"></i>
          Register Fleet Asset
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-premium">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-80 gap-4">
                <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scanning Hangar...</p>
             </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-5">Vehicle Identity</th>
                  <th className="px-8 py-5">Assigned Route</th>
                  <th className="px-8 py-5">Capacity</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {buses.length > 0 ? buses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:rotate-6 transition-transform">
                          <i className="fas fa-bus text-lg"></i>
                        </div>
                        <div>
                          <p className="font-black text-slate-800 tracking-tight text-sm uppercase">{bus.plate}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{bus.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-slate-600 uppercase tracking-tight">{bus.routes?.name || 'Unassigned'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                         <i className="fas fa-users text-slate-300"></i>
                         <span className="text-xs font-bold text-slate-600">{bus.capacity} Seats</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        bus.status === 'ON_ROUTE' ? 'bg-success/10 text-success border-success/10' :
                        bus.status === 'MAINTENANCE' ? 'bg-danger/10 text-danger border-danger/10' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {bus.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(bus)} className="w-9 h-9 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-400 flex items-center justify-center">
                          <i className="fas fa-edit text-xs"></i>
                        </button>
                        <button 
                          onClick={() => handleDelete(bus.id, bus.plate)}
                          className="w-9 h-9 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all text-slate-400 flex items-center justify-center"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-32 text-center">
                       <i className="fas fa-truck-monster text-5xl text-slate-100 mb-6 block"></i>
                       <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Zero assets logged in fleet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Fleet Asset" : "Register Fleet Asset"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Registration Plate</label>
            <input 
              required
              type="text" 
              className={inputClass + " font-black uppercase text-primary"} 
              placeholder="e.g. KNG-01-A"
              value={formData.plate}
              onChange={(e) => setFormData({...formData, plate: e.target.value.toUpperCase()})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Vehicle Model / Make</label>
            <input 
              required
              type="text" 
              className={inputClass} 
              placeholder="e.g. Tata Starbus"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Seating Capacity</label>
              <input 
                required
                type="number" 
                className={inputClass + " font-black"} 
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assigned Route</label>
              <select 
                className={selectClass}
                value={formData.route_id}
                onChange={(e) => setFormData({...formData, route_id: e.target.value})}
              >
                <option value="">Select Route...</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Operational Status</label>
            <select 
              className={selectClass}
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="IDLE">Idle</option>
              <option value="ON_ROUTE">On Route</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
          <div className="pt-6 flex gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all hover:bg-blue-800 active:scale-95"
            >
              {editingId ? 'Update Asset' : 'Register Asset'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Buses;

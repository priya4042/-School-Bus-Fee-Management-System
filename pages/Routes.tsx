import React, { useState } from 'react';
import Modal from '../components/Modal';
import { useRoutes } from '../hooks/useRoutes';
import { showToast, showLoading, closeSwal, showAlert, showConfirm } from '../lib/swal';

const Routes: React.FC = () => {
  const { routes, loading, addRoute, updateRoute, deleteRoute } = useRoutes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    distance_km: 0,
    base_fee: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.distance_km <= 0 || formData.base_fee <= 0) {
      showAlert('Invalid Input', 'Distance and Base Fee must be greater than zero.', 'warning');
      return;
    }

    showLoading('Syncing Route...');
    
    let result;
    if (editingId) {
      result = await updateRoute(editingId, formData);
    } else {
      result = await addRoute(formData);
    }
    
    closeSwal();

    if (result.success) {
      setIsModalOpen(false);
      resetForm();
      showToast(editingId ? 'Route updated' : 'Route activated', 'success');
    } else {
      showAlert('Failed', result.error || 'System error. Try again.', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', distance_km: 0, base_fee: 0 });
    setEditingId(null);
  };

  const handleEdit = (route: any) => {
    setFormData({
      name: route.name,
      code: route.code,
      distance_km: route.distance_km,
      base_fee: route.base_fee
    });
    setEditingId(route.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await showConfirm('Remove Route?', `Archive ${name}?`, 'Delete');
    if (confirmed) {
      showLoading('Deleting...');
      const success = await deleteRoute(id);
      closeSwal();
      if (success) showToast('Route removed', 'info');
      else showAlert('Error', 'Failed to remove route', 'error');
    }
  };

  const inputClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-slate-800 placeholder-slate-300 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Fleet Intelligence</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Configuration of zones and transport pricing</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20"
        >
          <i className="fas fa-plus"></i>
          Provision New Route
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
             <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
          </div>
        ) : routes.length > 0 ? routes.map((route) => (
          <div key={route.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-premium hover:shadow-2xl transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <i className="fas fa-route text-6xl text-primary"></i>
            </div>
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                <i className="fas fa-route text-2xl"></i>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(route)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-primary rounded-lg transition-all"><i className="fas fa-edit text-[10px]"></i></button>
                <button onClick={() => handleDelete(route.id, route.name)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-danger rounded-lg transition-all"><i className="fas fa-trash-alt text-[10px]"></i></button>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{route.name}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{route.code}</p>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distance</span>
                <span className="text-sm font-bold text-slate-700">{route.distance_km} KM</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</span>
                <span className="text-lg font-black text-primary">₹{route.base_fee.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
             <i className="fas fa-map-marked text-4xl text-slate-200 mb-4"></i>
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No routes registered in fleet</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Route" : "Provision New Route"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Route Identifier (Name)</label>
            <input 
              required
              type="text" 
              className={inputClass} 
              placeholder="e.g. West Coast Link"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Internal Code</label>
              <input 
                required
                type="text" 
                className={inputClass + " font-black uppercase text-primary"} 
                placeholder="R-XXX"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Distance (KM)</label>
              <input 
                required
                type="number" 
                className={inputClass} 
                placeholder="0"
                value={formData.distance_km || ''}
                onChange={(e) => setFormData({...formData, distance_km: Number(e.target.value)})}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Monthly Base Fee (₹)</label>
            <input 
              required
              type="number" 
              className={inputClass + " text-primary text-lg font-black"} 
              placeholder="0"
              value={formData.base_fee || ''}
              onChange={(e) => setFormData({...formData, base_fee: Number(e.target.value)})}
            />
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
              {editingId ? 'Update Route' : 'Provision Route'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Routes;

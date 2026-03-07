import React, { useState } from 'react';
import Modal from '../components/Modal';
import { useRoutes } from '../hooks/useRoutes';
import { showToast, showLoading, closeSwal, showAlert, showConfirm } from '../lib/swal';

const Routes: React.FC = () => {
  const { routes, loading, addRoute, updateRoute, deleteRoute } = useRoutes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    route_name: '',
    code: '',
    distance_km: 0,
    base_fee: 0,
    start_point: '',
    end_point: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.distance_km <= 0 || formData.base_fee <= 0) {
      showAlert('Invalid Input', 'Distance and Base Fee must be greater than zero.', 'warning');
      return;
    }

    setIsModalOpen(false);
    showLoading('Syncing Route...');
    
    let result;
    if (editingId) {
      result = await updateRoute(editingId, formData);
    } else {
      result = await addRoute(formData);
    }
    
    closeSwal();

    if (result.success) {
      resetForm();
      showToast(editingId ? 'Route updated' : 'Route activated', 'success');
    } else {
      setIsModalOpen(true);
      showAlert('Failed', result.error || 'System error. Try again.', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ route_name: '', code: '', distance_km: 0, base_fee: 0, start_point: '', end_point: '' });
    setEditingId(null);
  };

  const handleEdit = (route: any) => {
    setFormData({
      route_name: route.route_name || '',
      code: route.code || '',
      distance_km: route.distance_km || 0,
      base_fee: route.base_fee || 0,
      start_point: route.start_point || '',
      end_point: route.end_point || ''
    });
    setEditingId(route.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, route_name: string) => {
    const confirmed = await showConfirm('Remove Route?', `Archive ${route_name}?`, 'Delete');
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

      <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-premium">
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="p-20 text-center">
               <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
            </div>
          ) : routes.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-5">Route Name</th>
                  <th className="px-8 py-5">Code</th>
                  <th className="px-8 py-5">Start Point</th>
                  <th className="px-8 py-5">End Point</th>
                  <th className="px-8 py-5 text-right">Distance</th>
                  <th className="px-8 py-5 text-right">Base Fee</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {routes.map((route) => (
                  <tr key={route.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-all">
                           <i className="fas fa-route"></i>
                        </div>
                        <span className="font-black text-slate-800 tracking-tight text-sm">{route.route_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full uppercase tracking-widest border border-slate-200">
                        {route.code}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-600">{route.start_point || '---'}</td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-600">{route.end_point || '---'}</td>
                    <td className="px-8 py-5 text-right font-black text-slate-700">{route.distance_km} KM</td>
                    <td className="px-8 py-5 text-right font-black text-primary">₹{Number(route.base_fee || 0).toLocaleString()}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(route)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-primary rounded-lg transition-all"><i className="fas fa-edit text-[10px]"></i></button>
                        <button onClick={() => handleDelete(route.id, route.route_name)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-danger rounded-lg transition-all"><i className="fas fa-trash-alt text-[10px]"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-24 text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                   <i className="fas fa-map-marked text-3xl text-slate-200"></i>
               </div>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No routes registered in fleet</p>
            </div>
          )}
        </div>
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
              value={formData.route_name}
              onChange={(e) => setFormData({...formData, route_name: e.target.value})}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Start Point</label>
              <input 
                type="text" 
                className={inputClass} 
                placeholder="e.g. City Center"
                value={formData.start_point || ''}
                onChange={(e) => setFormData({...formData, start_point: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">End Point</label>
              <input 
                type="text" 
                className={inputClass} 
                placeholder="e.g. School Campus"
                value={formData.end_point || ''}
                onChange={(e) => setFormData({...formData, end_point: e.target.value})}
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

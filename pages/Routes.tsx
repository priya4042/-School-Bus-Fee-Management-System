
import React, { useState } from 'react';
import Modal from '../components/Modal';
import { useRoutes } from '../hooks/useRoutes';
import { showToast, showLoading, closeSwal, showAlert } from '../lib/swal';

const Routes: React.FC = () => {
  const { routes, loading, addRoute } = useRoutes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    distance_km: 0,
    base_fee: 0
  });

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Field-level Validation
    if (!formData.name.trim() || !formData.code.trim()) {
      showAlert('Required Fields', 'Please provide both a Name and a Route Code.', 'warning');
      return;
    }

    if (formData.distance_km <= 0 || formData.base_fee <= 0) {
      showAlert('Invalid Input', 'Distance and Base Fee must be greater than zero.', 'warning');
      return;
    }

    setIsSubmitting(true);
    showLoading('Provisioning Fleet Route...');
    
    const result = await addRoute(formData);
    
    closeSwal();
    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
      setFormData({ name: '', code: '', distance_km: 0, base_fee: 0 });
      showToast('Route activated successfully', 'success');
    } else {
      // Prioritize the actual error from the API result
      const specificError = result.error;
      const genericError = 'The system encountered an error saving the route. Please check the developer console for details.';
      
      showAlert(
        'Provisioning Failed', 
        specificError || genericError, 
        'error'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Fleet Intelligence</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Configuration of zones and transport pricing</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
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
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{route.code}</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{route.name}</h3>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Provision New Route">
        <form onSubmit={handleCreateRoute} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Route Identifier (Name)</label>
            <input 
              required
              type="text" 
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-primary/5 font-bold" 
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
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-primary/5 font-bold uppercase" 
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
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-primary/5 font-bold" 
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
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-primary/5 font-bold" 
              placeholder="0"
              value={formData.base_fee || ''}
              onChange={(e) => setFormData({...formData, base_fee: Number(e.target.value)})}
            />
          </div>
          <div className="pt-6 flex gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest rounded-2xl"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all hover:bg-blue-800"
            >
              Provision Route
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Fix: Add missing default export
export default Routes;

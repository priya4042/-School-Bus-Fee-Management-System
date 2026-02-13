
import React, { useState } from 'react';
import Modal from '../components/Modal';

const MOCK_ROUTES = [
  { id: 'r1', name: 'North Zone Express', code: 'NZ-01', distance: '12km', students: 45, fee: 1500 },
  { id: 'r2', name: 'South City Route', code: 'SC-02', distance: '8km', students: 32, fee: 1200 },
  { id: 'r3', name: 'East Highland', code: 'EH-03', distance: '20km', students: 28, fee: 2000 },
];

const Routes: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    distance: '',
    fee: 0
  });

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Route ${formData.name} created successfully!`);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Route Management</h2>
          <p className="text-slate-50">Configure bus routes and pickup zones</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-primary/20"
        >
          <i className="fas fa-plus"></i>
          Create New Route
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ROUTES.map((route) => (
          <div key={route.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-primary rounded-lg">
                <i className="fas fa-route text-xl"></i>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{route.code}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{route.name}</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Distance</span>
                <span className="font-semibold text-slate-700">{route.distance}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Active Students</span>
                <span className="font-semibold text-slate-700">{route.students}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Monthly Fee</span>
                <span className="font-bold text-primary">₹{route.fee}</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
              <button className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                Edit Details
              </button>
              <button className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                View Stops
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Route">
        <form onSubmit={handleCreateRoute} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Route Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20" 
              placeholder="e.g. West Coast Link"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Route Code</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20" 
                placeholder="WC-05"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Distance (km)</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20" 
                placeholder="15km"
                value={formData.distance}
                onChange={(e) => setFormData({...formData, distance: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Fee (INR)</label>
            <input 
              required
              type="number" 
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20" 
              placeholder="1800"
              value={formData.fee}
              onChange={(e) => setFormData({...formData, fee: Number(e.target.value)})}
            />
          </div>
          <div className="pt-4 flex gap-3">
             <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg">Cancel</button>
             <button type="submit" className="flex-1 py-2 bg-primary text-white font-bold rounded-lg">Create Route</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Routes;

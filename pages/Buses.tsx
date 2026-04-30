import React, { useState } from 'react';
import { useBuses } from '../hooks/useBuses';
import { useRoutes } from '../hooks/useRoutes';
import Routes from './Routes';
import Modal from '../components/Modal';
import { showConfirm, showToast, showLoading, closeSwal, showAlert } from '../lib/swal';
import { pushBusStatus, BUS_STATUS_OPTIONS, type BusStatusKey } from '../services/parentActions';
import { useAuthStore } from '../store/authStore';

const Buses: React.FC = () => {
  const { user: adminUser } = useAuthStore();
  const { buses, loading, registerBus, updateBus, deleteBus } = useBuses();
  const { routes } = useRoutes();
  const [view, setView] = useState<'buses' | 'routes'>('buses');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Bus status push (announces today's status to all parents on this bus)
  const [statusBus, setStatusBus] = useState<any | null>(null);
  const [statusKey, setStatusKey] = useState<BusStatusKey>('on_route');
  const [statusMessage, setStatusMessage] = useState('');
  const [pushingStatus, setPushingStatus] = useState(false);

  const openStatusModal = (bus: any) => {
    setStatusBus(bus);
    setStatusKey('on_route');
    setStatusMessage('');
  };

  const handlePushStatus = async () => {
    if (!statusBus || !adminUser) return;
    setPushingStatus(true);
    try {
      const result = await pushBusStatus({
        busId: statusBus.id,
        routeId: statusBus.route_id || null,
        status: statusKey,
        customMessage: statusMessage.trim() || undefined,
        adminUserId: adminUser.id,
      });
      if (!result.ok) {
        showAlert('Could not push status', result.error || 'Try again.', 'error');
        return;
      }
      showToast(`Status sent to ${result.parentsNotified || 0} parent${result.parentsNotified === 1 ? '' : 's'}.`, 'success');
      setStatusBus(null);
    } finally {
      setPushingStatus(false);
    }
  };
  
  const [formData, setFormData] = useState({
    bus_number: '',
    plate: '',
    model: '',
    capacity: 40,
    driver_name: '',
    driver_phone: '',
    status: 'idle' as any,
    route_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    showLoading('Syncing Records...');
    
    // Prepare payload - handle empty route_id
    const payload = {
      ...formData,
      route_id: formData.route_id || null
    };

    let result;
    if (editingId) {
      result = await updateBus(editingId, payload);
    } else {
      result = await registerBus(payload);
    }
    
    closeSwal();
    if (result.success) {
      resetForm();
      showToast(editingId ? 'Vehicle updated' : 'Vehicle registered', 'success');
    } else {
      // If failed, re-open modal so user doesn't lose data
      setIsModalOpen(true);
      showAlert('Failed', result.error || 'Could not save vehicle record.', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ 
      bus_number: '', 
      plate: '', 
      model: '', 
      capacity: 40, 
      driver_name: '', 
      driver_phone: '', 
      status: 'idle', 
      route_id: '' 
    });
    setEditingId(null);
  };

  const handleEdit = (bus: any) => {
    setFormData({
      bus_number: bus.bus_number || '',
      plate: bus.plate || bus.vehicle_number || '', // Fallback for old data
      model: bus.model || '',
      capacity: bus.capacity,
      driver_name: bus.driver_name || '',
      driver_phone: bus.driver_phone || '',
      status: bus.status || 'idle',
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
      const result = await deleteBus(id);
      closeSwal();
      if (result.success) {
        showToast('Asset removed successfully', 'info');
      } else {
        showAlert('Failed', result.error || 'Could not delete vehicle.', 'error');
      }
    }
  };

  const inputClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-slate-800 placeholder-slate-300 transition-all";
  const selectClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold bg-white text-slate-800 cursor-pointer transition-all";

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        {view === 'buses' ? (
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Fleet Asset Control</h2>
            <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">Active vehicle inventory and monitoring</p>
          </div>
        ) : <div />}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 flex-1 md:flex-none">
            <button onClick={() => setView('buses')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${view === 'buses' ? 'bg-primary text-white' : 'text-slate-500'}`}>Buses</button>
            <button onClick={() => setView('routes')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${view === 'routes' ? 'bg-primary text-white' : 'text-slate-500'}`}>Routes</button>
          </div>
          {view === 'buses' && (
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-primary text-white px-4 md:px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 md:gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20 flex-shrink-0"
            >
              <i className="fas fa-bus-alt"></i>
              <span className="hidden md:inline">Register Fleet Asset</span>
              <span className="md:hidden">Register</span>
            </button>
          )}
        </div>
      </div>

      {view === 'routes' ? (
        <Routes />
      ) : (
        <>

      <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-premium">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-4">
            <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scanning Hangar...</p>
          </div>
        ) : buses.length === 0 ? (
          <div className="p-12 md:p-32 text-center">
            <i className="fas fa-truck-monster text-4xl md:text-5xl text-slate-100 mb-4 md:mb-6 block"></i>
            <p className="text-[10px] md:text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] md:tracking-[0.4em]">Zero assets logged in fleet</p>
          </div>
        ) : (
          <>
          {/* Mobile cards (<md) */}
          <div className="md:hidden divide-y divide-slate-50">
            {buses.map((bus) => (
              <div key={bus.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-bus text-base"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-slate-800 tracking-tight text-sm uppercase truncate">{bus.bus_number}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        bus.status === 'active' ? 'bg-success/10 text-success border-success/10' :
                        bus.status === 'maintenance' ? 'bg-danger/10 text-danger border-danger/10' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>{bus.status?.toUpperCase()}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate">{bus.plate || bus.vehicle_number}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openStatusModal(bus)} className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center" title="Push status to parents">
                      <i className="fas fa-bullhorn text-xs"></i>
                    </button>
                    <button onClick={() => handleEdit(bus)} className="w-9 h-9 bg-slate-50 rounded-xl text-slate-400 flex items-center justify-center">
                      <i className="fas fa-edit text-xs"></i>
                    </button>
                    <button onClick={() => handleDelete(bus.id, bus.plate || bus.vehicle_number)} className="w-9 h-9 bg-slate-50 rounded-xl text-slate-400 flex items-center justify-center">
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pl-14">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Driver</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{bus.driver_name || 'Unassigned'}</p>
                    {bus.driver_phone && <p className="text-[10px] text-slate-400 font-bold">{bus.driver_phone}</p>}
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Route</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{bus.route?.route_name || bus.routes?.route_name || 'Unassigned'}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{bus.capacity} Seats</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table (≥md) */}
          <div className="hidden md:block overflow-x-auto min-h-[400px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-5">Vehicle Identity</th>
                  <th className="px-8 py-5">Driver Details</th>
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
                          <p className="font-black text-slate-800 tracking-tight text-sm uppercase">{bus.bus_number}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{bus.plate || bus.vehicle_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <p className="font-bold text-slate-700 text-xs">{bus.driver_name || 'Unassigned'}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{bus.driver_phone}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-slate-600 uppercase tracking-tight">{bus.route?.route_name || bus.routes?.route_name || 'Unassigned'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                         <i className="fas fa-users text-slate-300"></i>
                         <span className="text-xs font-bold text-slate-600">{bus.capacity} Seats</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        bus.status === 'active' ? 'bg-success/10 text-success border-success/10' :
                        bus.status === 'maintenance' ? 'bg-danger/10 text-danger border-danger/10' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {bus.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openStatusModal(bus)}
                          className="w-9 h-9 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all flex items-center justify-center"
                          title="Push status to parents"
                        >
                          <i className="fas fa-bullhorn text-xs"></i>
                        </button>
                        <button onClick={() => handleEdit(bus)} className="w-9 h-9 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-400 flex items-center justify-center">
                          <i className="fas fa-edit text-xs"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(bus.id, bus.plate || bus.vehicle_number)}
                          className="w-9 h-9 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all text-slate-400 flex items-center justify-center"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="p-32 text-center">
                       <i className="fas fa-truck-monster text-5xl text-slate-100 mb-6 block"></i>
                       <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Zero assets logged in fleet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Fleet Asset" : "Register Fleet Asset"} maxWidthClass="max-w-4xl" bodyClassName="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Bus Number</label>
              <input 
                required
                type="text" 
                className={inputClass + " font-black uppercase text-primary"} 
                placeholder="e.g. BUS-101"
                value={formData.bus_number}
                onChange={(e) => setFormData({...formData, bus_number: e.target.value.toUpperCase()})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Vehicle Number</label>
              <input 
                required
                type="text" 
                className={inputClass + " font-black uppercase"} 
                placeholder="e.g. KA-01-AB-1234"
                value={formData.plate}
                onChange={(e) => setFormData({...formData, plate: e.target.value.toUpperCase()})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Driver Name</label>
              <input 
                type="text" 
                className={inputClass} 
                placeholder="Full Name"
                value={formData.driver_name}
                onChange={(e) => setFormData({...formData, driver_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Driver Phone</label>
              <input 
                type="tel" 
                className={inputClass} 
                placeholder="Phone Number"
                value={formData.driver_phone}
                onChange={(e) => setFormData({...formData, driver_phone: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Vehicle Model</label>
              <input 
                type="text" 
                className={inputClass} 
                placeholder="e.g. Tata Starbus"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assigned Route</label>
              <select 
                className={selectClass}
                value={formData.route_id}
                onChange={(e) => setFormData({...formData, route_id: e.target.value})}
              >
                <option value="">Select Route...</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.route_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Operational Status</label>
              <select 
                className={selectClass}
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="idle">Idle</option>
                <option value="active">On Route</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row gap-3">
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
        </>
      )}

      {/* Push status to parents modal */}
      <Modal
        isOpen={!!statusBus}
        onClose={() => setStatusBus(null)}
        title={`Push status — ${statusBus?.bus_number || 'Bus'}`}
        maxWidthClass="max-w-md"
        bodyClassName="p-4 md:p-8"
      >
        <div className="space-y-4">
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
            Sends a one-tap status update to every parent whose child rides this bus.
          </p>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
            <div className="grid grid-cols-1 gap-2">
              {BUS_STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setStatusKey(opt.key)}
                  className={`p-3 rounded-xl text-left flex items-center gap-3 border-2 transition-all active:scale-[0.98] ${
                    statusKey === opt.key ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white'
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{opt.emoji}</span>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custom Note (optional)</label>
            <input
              type="text"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              placeholder="e.g. running 15 min late, traffic on NH-21"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-4 ring-primary/10 focus:border-primary"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setStatusBus(null)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handlePushStatus}
              disabled={pushingStatus}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {pushingStatus ? <><i className="fas fa-circle-notch fa-spin"></i> Sending</> : <><i className="fas fa-bullhorn"></i> Push to Parents</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Buses;

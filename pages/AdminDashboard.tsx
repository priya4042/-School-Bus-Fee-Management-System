import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import AIInsights from '../components/Dashboard/AIInsights';
import Modal from '../components/Modal';
import api from '../lib/api';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/swal';
import { useTracking } from '../hooks/useTracking';
import BusCameraModal from '../components/BusCameraModal';

declare const L: any;

const AdminDashboard: React.FC = () => {
  const [view, setView] = useState<'stats' | 'monitor' | 'geofences'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<any>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [geofences, setGeofences] = useState<any[]>([]);
  const [isGfModalOpen, setIsGfModalOpen] = useState(false);
  const [gfForm, setGfForm] = useState({ name: '', latitude: '', longitude: '', radius_meters: 100, type: 'SCHOOL' });
  const markerRef = useRef<any>(null);
  const { location } = useTracking('b1');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('dashboard/stats');
        setStats(data);
      } catch (err) {
        setStats({
          totalCollection: "₹12.4L",
          activeStudents: 412,
          defaulters: 18,
          lateFeeCollected: "₹4,250",
          revenueTrend: [
            { month: 'Oct', revenue: 450000 },
            { month: 'Nov', revenue: 520000 },
            { month: 'Dec', revenue: 480000 },
            { month: 'Jan', revenue: 610000 },
            { month: 'Feb', revenue: 590000 },
            { month: 'Mar', revenue: 650000 },
          ],
          paymentHealth: [
            { name: 'Paid', value: 380, color: '#1e40af' },
            { name: 'Overdue', value: 18, color: '#f59e0b' },
            { name: 'Unpaid', value: 14, color: '#ef4444' },
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    fetchGeofences();
  }, []);

  const fetchGeofences = async () => {
    const { data } = await supabase.from('geofences').select('*');
    if (data) setGeofences(data);
  };

  const handleCreateGeofence = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('geofences').insert({
      ...gfForm,
      latitude: parseFloat(gfForm.latitude),
      longitude: parseFloat(gfForm.longitude)
    });
    if (!error) {
      setIsGfModalOpen(false);
      setGfForm({ name: '', latitude: '', longitude: '', radius_meters: 100, type: 'SCHOOL' });
      fetchGeofences();
      showToast('Geofence Created', 'success');
    }
  };

  const handleDeleteGeofence = async (id: string) => {
    const { error } = await supabase.from('geofences').delete().eq('id', id);
    if (!error) {
      fetchGeofences();
      showToast('Geofence Removed', 'success');
    }
  };

  // Update marker position on location change
  useEffect(() => {
    if (map && location && markerRef.current) {
        markerRef.current.setLatLng([location.lat, location.lng]);
        map.panTo([location.lat, location.lng]);
    }
  }, [location, map]);

  useEffect(() => {
    if (view === 'monitor' && !map) {
      setTimeout(() => {
        const leafletMap = L.map('map').setView([32.0900, 76.2600], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(leafletMap);
        
        const busIcon = L.divIcon({
          className: 'custom-bus-icon',
          html: '<div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl border-2 border-white animate-pulse"><i class="fas fa-bus text-xs"></i></div>',
          iconSize: [40, 40]
        });

        const m = L.marker([32.0900, 76.2600], { icon: busIcon }).addTo(leafletMap).bindPopup('<b>Bus KNG-01-A</b>');
        markerRef.current = m;
        setMap(leafletMap);
      }, 100);
    }
  }, [view, map]);

  if (loading || !stats) {
    return (
      <div className="h-96 flex items-center justify-center">
        <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Operations Hub</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Global Fleet Intelligence</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setIsCameraOpen(true)}
            className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-slate-900 text-white shadow-lg flex items-center gap-2"
          >
            <i className="fas fa-video"></i>
            Live Cam
          </button>
          <div className="w-px h-6 bg-slate-100"></div>
          <button onClick={() => setView('stats')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'stats' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}>Analytics</button>
          <button onClick={() => setView('monitor')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'monitor' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}>Live Monitor</button>
          <button onClick={() => setView('geofences')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'geofences' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}>Geofences</button>
        </div>
      </div>

      <BusCameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />

      {view === 'stats' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <DashboardCard title="Revenue (MTD)" value={stats.totalCollection} icon="fa-wallet" color="blue" />
              <DashboardCard title="Total Students" value={stats.activeStudents} icon="fa-user-graduate" color="green" />
              <DashboardCard title="Active Fleet" value="1/1" icon="fa-bus" color="orange" />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-10">Monthly Revenue Growth</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -10px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="revenue" fill="#1e40af" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <AIInsights />
          </div>
        </div>
      ) : view === 'monitor' ? (
        <div className="h-[600px] bg-white rounded-[3rem] border border-slate-200 shadow-premium overflow-hidden relative z-0">
          <div id="map"></div>
          {location && (
            <div className="absolute bottom-10 left-10 z-[1000] bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 text-white min-w-[200px] animate-in slide-in-from-left-4">
                <p className="text-[9px] font-black uppercase text-success tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                    Live Signal: B101
                </p>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Velocity</span>
                        <span className="text-xl font-black tracking-tighter">{Math.round(location.speed)} KM/H</span>
                    </div>
                    <div className="h-px bg-white/5"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Satellite Ref</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">GPS_32N_76E</span>
                    </div>
                </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-black text-slate-800 tracking-tight">Geofence Registry</h3>
             <button 
               onClick={() => setIsGfModalOpen(true)}
               className="bg-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
             >
               + Define New Fence
             </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {geofences.map(gf => (
               <div key={gf.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                     <i className="fas fa-bullseye text-6xl"></i>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${gf.type === 'SCHOOL' ? 'bg-primary' : 'bg-success'}`}>
                        <i className={`fas ${gf.type === 'SCHOOL' ? 'fa-school' : 'fa-map-marker-alt'}`}></i>
                     </div>
                     <div>
                        <h4 className="font-black text-slate-800 uppercase tracking-tight">{gf.name}</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{gf.type} • {gf.radius_meters}m Radius</p>
                     </div>
                  </div>
                  <div className="space-y-2 mb-6">
                     <p className="text-[10px] font-bold text-slate-500 flex justify-between">
                        <span>Latitude:</span>
                        <span className="text-slate-800">{gf.latitude.toFixed(4)}</span>
                     </p>
                     <p className="text-[10px] font-bold text-slate-500 flex justify-between">
                        <span>Longitude:</span>
                        <span className="text-slate-800">{gf.longitude.toFixed(4)}</span>
                     </p>
                  </div>
                  <button 
                    onClick={() => handleDeleteGeofence(gf.id)}
                    className="w-full py-3 bg-slate-50 text-danger font-black uppercase text-[9px] tracking-widest rounded-xl hover:bg-red-50 transition-all"
                  >
                    Remove Fence
                  </button>
               </div>
             ))}
             {geofences.length === 0 && (
               <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No geofences defined for this fleet</p>
               </div>
             )}
          </div>

          <Modal isOpen={isGfModalOpen} onClose={() => setIsGfModalOpen(false)} title="Define Geofence">
             <form onSubmit={handleCreateGeofence} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fence Name</label>
                      <input type="text" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold" placeholder="e.g. Main Campus" value={gfForm.name} onChange={e => setGfForm({...gfForm, name: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Latitude</label>
                      <input type="number" step="any" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold" placeholder="32.1024" value={gfForm.latitude} onChange={e => setGfForm({...gfForm, latitude: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Longitude</label>
                      <input type="number" step="any" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold" placeholder="76.2734" value={gfForm.longitude} onChange={e => setGfForm({...gfForm, longitude: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Radius (m)</label>
                      <input type="number" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold" value={gfForm.radius_meters} onChange={e => setGfForm({...gfForm, radius_meters: parseInt(e.target.value)})} />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fence Type</label>
                      <select className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold" value={gfForm.type} onChange={e => setGfForm({...gfForm, type: e.target.value})}>
                         <option value="SCHOOL">School Campus</option>
                         <option value="STOP">Bus Stop</option>
                         <option value="LANDMARK">Landmark</option>
                      </select>
                   </div>
                </div>
                <div className="pt-6 flex gap-3">
                   <button type="button" onClick={() => setIsGfModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest rounded-2xl">Cancel</button>
                   <button type="submit" className="flex-1 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20">Create Fence</button>
                </div>
             </form>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
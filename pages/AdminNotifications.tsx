import React, { useState } from 'react';
import api from '../lib/api.ts';

const AdminNotifications: React.FC = () => {
  const [msgType, setMsgType] = useState('emergency');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/notifications/broadcast', {
        message,
        type: msgType,
        target: target
      });
      setSuccessMsg(`Broadcast sent to ${data.recipients} users successfully.`);
      setMessage('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
      alert('Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary bg-white font-bold text-slate-700 transition-all cursor-pointer";

  return (
    <div className="max-w-5xl space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Notification Center</h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Enterprise Communication Terminal</p>
      </div>

      {successMsg && (
        <div className="p-5 bg-success/10 border-2 border-success/20 text-success rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-4 animate-in slide-in-from-top-4">
           <i className="fas fa-check-double text-lg"></i>
           {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleBroadcast} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                    <i className="fas fa-bullhorn"></i>
                  </div>
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">New Broadcast Protocol</h3>
               </div>
               <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">AES-256 Encrypted</span>
            </div>
            
            <div className="p-8 md:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 ml-1">Message Protocol</label>
                  <select value={msgType} onChange={(e) => setMsgType(e.target.value)} className={selectClass}>
                    <option value="emergency">🚨 Emergency Alert</option>
                    <option value="announcement">📢 Announcement</option>
                    <option value="reminder">⏰ Fee Reminder</option>
                    <option value="update">ℹ️ Route Update</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 ml-1">Target Distribution</label>
                  <select value={target} onChange={(e) => setTarget(e.target.value)} className={selectClass}>
                    <option value="all">All Parents & Staff</option>
                    <option value="parents">Parents Only</option>
                    <option value="drivers">Drivers Only</option>
                    <option value="route-a">Route North Zone Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-primary uppercase tracking-widest mb-3 ml-1">Your Message</label>
                <textarea 
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type the message payload here..."
                  className="w-full px-6 py-6 rounded-[2rem] bg-primary border border-primary/20 outline-none focus:ring-4 focus:ring-primary/20 focus:border-white/40 font-bold text-white placeholder-white/50 transition-all resize-none shadow-inner leading-relaxed"
                  required
                ></textarea>
                
                <div className="flex items-center gap-3 mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                   <i className={`fas ${msgType === 'emergency' ? 'fa-exclamation-triangle text-danger' : 'fa-info-circle text-primary'}`}></i>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                     {msgType === 'emergency' ? 'Priority: Critical. Bypasses Do Not Disturb filters.' : 'Standard priority delivery based on user preferences.'}
                   </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="flex flex-wrap gap-6">
                    {['SMS', 'Email', 'Push'].map(item => (
                       <label key={item} className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-primary/20 text-primary focus:ring-primary/20 bg-primary/5 transition-all" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">{item}</span>
                       </label>
                    ))}
                 </div>
                 <button 
                   type="submit" 
                   disabled={loading}
                   className="bg-primary text-white font-black uppercase text-[11px] tracking-[0.2em] px-10 py-5 rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95"
                 >
                   {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                   {loading ? 'Transmitting...' : 'Initiate Broadcast'}
                 </button>
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
                 <i className="fas fa-satellite-dish text-8xl"></i>
              </div>
              <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-10 text-white/40">Transmission Health</h4>
              <div className="space-y-8">
                 <div>
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-3">
                       <span className="text-white/50">Billing Reminders</span>
                       <span className="text-success">Synchronized</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="w-full h-full bg-success rounded-full"></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-3">
                       <span className="text-white/50">Emergency Reach</span>
                       <span className="text-primary-light">92.4% Optimal</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="w-[92%] h-full bg-primary-light rounded-full"></div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-8 flex items-center gap-3">
                 <i className="fas fa-history text-primary"></i>
                 Recent Transmissions
              </h4>
              <div className="space-y-6">
                 <div className="pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <p className="text-xs font-black text-slate-800 tracking-tight leading-snug">Bus B101 delay due to Kangra Valley traffic.</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Yesterday, 4:30 PM</span>
                       <span className="text-slate-200">•</span>
                       <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Update</span>
                    </div>
                 </div>
                 <div className="pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <p className="text-xs font-black text-slate-800 tracking-tight leading-snug">National Holiday Announcement: Fleet Grounded.</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">2 Days Ago</span>
                       <span className="text-slate-200">•</span>
                       <span className="text-[8px] font-black text-primary uppercase tracking-widest">Broadcast</span>
                    </div>
                 </div>
              </div>
              <button className="w-full mt-8 py-3 bg-primary/5 text-primary font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95">
                 Download Audit Log
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
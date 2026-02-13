
import React, { useState } from 'react';
import api from '../lib/api';

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

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Notification Center</h2>
        <p className="text-slate-500">Send mass alerts, emergency updates, and broadcasts</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-4">
           <i className="fas fa-check-double"></i>
           {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleBroadcast} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message Type</label>
                <select 
                  value={msgType}
                  onChange={(e) => setMsgType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  <option value="emergency">🚨 Emergency Alert</option>
                  <option value="announcement">📢 Announcement</option>
                  <option value="reminder">⏰ Fee Reminder</option>
                  <option value="update">ℹ️ Route Update</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Audience</label>
                <select 
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  <option value="all">All Parents & Staff</option>
                  <option value="parents">Parents Only</option>
                  <option value="drivers">Drivers Only</option>
                  <option value="route-a">Route North Zone Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Message</label>
              <textarea 
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20"
                required
              ></textarea>
              <p className="text-[10px] text-slate-400 mt-2 italic">
                {msgType === 'emergency' ? '⚠️ Emergency alerts are sent via SMS, Email, and Push immediately.' : 'Standard notifications follow user preference settings.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <input type="checkbox" defaultChecked id="sms" />
                     <label htmlFor="sms" className="text-xs font-bold text-slate-500">SMS</label>
                  </div>
                  <div className="flex items-center gap-2">
                     <input type="checkbox" defaultChecked id="email" />
                     <label htmlFor="email" className="text-xs font-bold text-slate-500">Email</label>
                  </div>
                  <div className="flex items-center gap-2">
                     <input type="checkbox" defaultChecked id="push" />
                     <label htmlFor="push" className="text-xs font-bold text-slate-500">Push</label>
                  </div>
               </div>
               <button 
                 type="submit" 
                 disabled={loading}
                 className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
               >
                 {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                 {loading ? 'Broadcasting...' : 'Send Broadcast'}
               </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 p-6 rounded-2xl text-white">
              <h4 className="font-bold mb-4">Delivery Status</h4>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                       <span className="text-slate-400">Monthly Reminders</span>
                       <span className="text-success font-bold">100% Sent</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full">
                       <div className="w-full h-full bg-success rounded-full"></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                       <span className="text-slate-400">Emergency Broadcast</span>
                       <span className="text-primary font-bold">92% Delivered</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full">
                       <div className="w-[92%] h-full bg-primary rounded-full"></div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4">Past Alerts</h4>
              <div className="space-y-4">
                 <div className="pb-3 border-b border-slate-50">
                    <p className="text-xs font-bold text-slate-700">Bus 102 delay due to traffic</p>
                    <p className="text-[10px] text-slate-400">Yesterday at 04:30 PM</p>
                 </div>
                 <div className="pb-3 border-b border-slate-50">
                    <p className="text-xs font-bold text-slate-700">Half-day holiday announced</p>
                    <p className="text-[10px] text-slate-400">2 days ago</p>
                 </div>
              </div>
              <button className="w-full mt-4 text-xs font-bold text-primary hover:underline">View Notification Logs</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;


import React, { useState, useEffect } from 'react';
import { User } from '../types';
import api from '../lib/api';

const Notifications: React.FC<{ user: User }> = ({ user }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Mocking for now
        setNotifications([
          { id: 1, title: 'Fee Payment Successful', message: 'Transaction for March 2024 has been verified. Download your receipt in the Receipts tab.', type: 'SUCCESS', date: '2 hours ago' },
          { id: 2, title: 'Bus Delayed', message: 'Bus 102 on North Zone route is running 15 minutes late due to city traffic.', type: 'WARNING', date: '5 hours ago' },
          { id: 3, title: 'Monthly Bill Generated', message: 'April 2024 invoice for Alice Doe (1001) has been generated.', type: 'INFO', date: 'Yesterday' },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user.id]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'fa-check-circle text-success';
      case 'WARNING': return 'fa-exclamation-triangle text-orange-500';
      case 'DANGER': return 'fa-shield-alt text-danger';
      default: return 'fa-info-circle text-primary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Alert Center</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">System & Fleet Updates</p>
        </div>
        <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Mark All Read</button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-50">
        {loading ? (
          <div className="p-20 text-center">
            <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <div key={n.id} className="p-8 flex items-start gap-6 hover:bg-slate-50/50 transition-all cursor-pointer group">
              <div className={`w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform`}>
                <i className={`fas ${getIcon(n.type)}`}></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-black text-slate-800 tracking-tight">{n.title}</h4>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{n.date}</span>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center">
            <i className="fas fa-bell-slash text-4xl text-slate-100 mb-4"></i>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Alerts In History</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

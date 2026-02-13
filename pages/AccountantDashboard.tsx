
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardCard from '../components/DashboardCard';

const AccountantDashboard: React.FC = () => {
  const collectionData = [
    { day: 'Mon', amount: 85000 },
    { day: 'Tue', amount: 72000 },
    { day: 'Wed', amount: 95000 },
    { day: 'Thu', amount: 120000 },
    { day: 'Fri', amount: 110000 },
    { day: 'Sat', amount: 45000 },
    { day: 'Sun', amount: 12000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Accountant Portal</h2>
          <p className="text-slate-500">Financial oversight and collection monitoring</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
           <i className="fas fa-print"></i>
           Print Daily Summary
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Daily Collection" value="₹1.15L" icon="fa-cash-register" color="green" />
        <DashboardCard title="Total Revenue (Mar)" value="₹14.8L" icon="fa-chart-line" color="blue" />
        <DashboardCard title="Pending Dues" value="₹3.2L" icon="fa-exclamation-circle" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-6">Weekly Collection Trend</h3>
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={collectionData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                   <Tooltip cursor={{ fill: '#f8fafc' }} />
                   <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-4">Quick Links</h3>
           <div className="space-y-3">
              <button className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center gap-3 transition-colors text-left group">
                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary border border-slate-100 group-hover:border-primary">
                    <i className="fas fa-file-invoice"></i>
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-700">Bank Reconciliation</p>
                    <p className="text-[10px] text-slate-400">Match Razorpay payouts</p>
                 </div>
              </button>
              <button className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center gap-3 transition-colors text-left group">
                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-orange-500 border border-slate-100 group-hover:border-orange-500">
                    <i className="fas fa-user-clock"></i>
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-700">Defaulter List</p>
                    <p className="text-[10px] text-slate-400">Export for management</p>
                 </div>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;


import React from 'react';
import { User } from '../types';
import { MOCK_STUDENTS } from '../constants';

const TeacherDashboard: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Teacher Portal</h2>
          <p className="text-slate-500">Overview for Class Class 5th-A</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
           <span className="text-sm font-bold text-slate-600">Active Session</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">My Students</p>
          <h3 className="text-3xl font-black text-slate-800">32</h3>
          <p className="text-xs text-slate-400 mt-2">Class 5th Section A</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Morning Attendance</p>
          <h3 className="text-3xl font-black text-success">28/32</h3>
          <p className="text-xs text-slate-400 mt-2">Marked at 08:15 AM</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Outstanding Fees</p>
          <h3 className="text-3xl font-black text-warning">4</h3>
          <p className="text-xs text-slate-400 mt-2">Students with overdue dues</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
           <h3 className="font-bold text-slate-800">Student List & Status</h3>
           <button className="text-xs font-bold text-primary hover:underline">View All Students</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4 text-center">Fee Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_STUDENTS.slice(0, 5).map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                           {/* Fix: Use full_name */}
                           {s.full_name.charAt(0)}
                        </div>
                        {/* Fix: Use full_name */}
                        <span className="font-semibold text-slate-700">{s.full_name}</span>
                     </div>
                  </td>
                  {/* Fix: Use route_name */}
                  <td className="px-6 py-4 text-sm text-slate-500">{s.route_name}</td>
                  <td className="px-6 py-4 text-center">
                     <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">PAID</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button className="text-slate-400 hover:text-primary transition-colors">
                        <i className="fas fa-eye"></i>
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

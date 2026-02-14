
import React from 'react';
import { useBuses } from '../hooks/useBuses';

const Buses: React.FC = () => {
  const { buses, loading } = useBuses();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Fleet Asset Control</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Active vehicle inventory and monitoring</p>
        </div>
        <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20">
          <i className="fas fa-bus-alt"></i>
          Register Fleet Asset
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-20 text-center">
                <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
             </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-5">Vehicle Identity</th>
                  <th className="px-8 py-5">Capacity Manifest</th>
                  <th className="px-8 py-5 text-center">Operational Status</th>
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
                          <p className="font-black text-slate-800 tracking-tight text-sm uppercase">{bus.plate}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{bus.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                         <i className="fas fa-users text-slate-300"></i>
                         <span className="text-xs font-bold text-slate-600">{bus.capacity} Authorized Seats</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        bus.status === 'On Route' ? 'bg-success/10 text-success border-success/10' :
                        bus.status === 'Maintenance' ? 'bg-danger/10 text-danger border-danger/10' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {bus.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-400 flex items-center justify-center mx-auto lg:ml-auto lg:mr-0">
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                       <i className="fas fa-truck-monster text-4xl text-slate-100 mb-4"></i>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No assets logged in fleet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Buses;

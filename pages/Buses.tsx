
import React from 'react';

const MOCK_BUSES = [
  { id: 'b1', plate: 'UP-16-BZ-1234', model: 'Tata Starbus', capacity: 40, driver: 'Ramesh Singh', status: 'On Route' },
  { id: 'b2', plate: 'UP-16-BZ-5678', model: 'Ashok Leyland', capacity: 32, driver: 'Suresh Kumar', status: 'Maintenance' },
  { id: 'b3', plate: 'UP-16-BZ-9012', model: 'Eicher Skyline', capacity: 50, driver: 'Amit Pal', status: 'Idle' },
];

const Buses: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fleet Management</h2>
          <p className="text-slate-500">Monitor vehicle status and assignments</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <i className="fas fa-bus-alt"></i>
          Register Vehicle
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">Vehicle Detail</th>
              <th className="px-6 py-4">Assigned Driver</th>
              <th className="px-6 py-4">Capacity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MOCK_BUSES.map((bus) => (
              <tr key={bus.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                      <i className="fas fa-bus"></i>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{bus.plate}</p>
                      <p className="text-xs text-slate-400">{bus.model}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-600">{bus.driver}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">{bus.capacity} Seats</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    bus.status === 'On Route' ? 'bg-green-100 text-green-700' :
                    bus.status === 'Maintenance' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {bus.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-primary p-2">
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Buses;

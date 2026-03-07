
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'red';
  trend?: {
    value: number;
    label: string;
  };
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    green: 'bg-green-50 text-green-600 ring-green-100',
    orange: 'bg-orange-50 text-orange-600 ring-orange-100',
    red: 'bg-red-50 text-red-600 ring-red-100',
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/0 to-${color}-500/5 rounded-bl-[100%] transition-transform group-hover:scale-150 duration-700`}></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{title}</p>
          <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{value}</h3>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg ring-4 ring-opacity-50 transition-transform group-hover:rotate-12 duration-500 ${colorClasses[color]}`}>
          <i className={`fas ${icon}`}></i>
        </div>
      </div>
      
      {trend && (
        <div className="mt-6 flex items-center gap-3 relative z-10">
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${trend.value >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            <i className={`fas fa-arrow-${trend.value >= 0 ? 'up' : 'down'} text-[8px]`}></i>
            <span>{Math.abs(trend.value)}%</span>
          </div>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;

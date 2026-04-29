
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
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white p-3 md:p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] md:text-sm font-bold md:font-medium text-slate-500 uppercase tracking-widest md:tracking-wider truncate">{title}</p>
          <h3 className="text-base md:text-3xl font-black md:font-bold text-slate-800 mt-1 md:mt-2 tracking-tight md:tracking-normal">{value}</h3>
        </div>
        <div className={`p-2 md:p-3 rounded-lg ${colorClasses[color]} flex-shrink-0`}>
          <i className={`fas ${icon} text-sm md:text-xl`}></i>
        </div>
      </div>

      {trend && (
        <div className="mt-2 md:mt-4 flex items-center gap-2 flex-wrap">
          <span className={`text-[9px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 rounded-full ${trend.value >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-[9px] md:text-xs text-slate-400 font-medium truncate">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;

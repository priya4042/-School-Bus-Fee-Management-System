
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  trend?: {
    value: number;
    label: string;
    isUp?: boolean;
  };
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  const iconBgClasses = {
    blue: 'bg-blue-600 shadow-blue-200',
    green: 'bg-emerald-600 shadow-emerald-200',
    orange: 'bg-orange-600 shadow-orange-200',
    red: 'bg-red-600 shadow-red-200',
    purple: 'bg-purple-600 shadow-purple-200',
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-700 ${colorClasses[color].split(' ')[0]}`}></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110 duration-500 ${iconBgClasses[color]}`}>
          <i className={`fa-solid ${icon} text-xl`}></i>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
            trend.isUp !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {trend.isUp !== false ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend.value}%
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 tracking-tighter group-hover:text-primary transition-colors">{value}</h3>
        {trend && (
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{trend.label}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;

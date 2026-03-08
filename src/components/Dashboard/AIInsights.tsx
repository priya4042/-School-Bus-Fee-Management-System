
import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Zap, ChevronRight } from 'lucide-react';

const AIInsights: React.FC = () => {
  const insights = [
    {
      type: 'optimization',
      title: 'Route Efficiency',
      description: 'Route B is 15% less efficient than average. Consider re-routing via Sector 4.',
      icon: Zap,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      type: 'prediction',
      title: 'Revenue Forecast',
      description: 'Projected 12% increase in collections next month based on current trends.',
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      type: 'alert',
      title: 'Maintenance Alert',
      description: 'Bus HP-68-1234 requires service in 250km to avoid potential downtime.',
      icon: AlertTriangle,
      color: 'text-orange-600 bg-orange-50 border-orange-100',
    },
  ];

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium group transition-all hover:shadow-2xl duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 animate-pulse">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">AI Insights</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Predictive Fleet Intelligence</p>
          </div>
        </div>
        <button className="p-2 text-slate-300 hover:text-primary transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="space-y-6 relative z-10">
        {insights.map((insight, idx) => (
          <div key={idx} className={`p-6 rounded-[2rem] border transition-all hover:translate-x-2 duration-300 group/item ${insight.color}`}>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center shadow-sm">
                <insight.icon size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-[11px] font-black uppercase tracking-tight mb-1">{insight.title}</h4>
                <p className="text-[10px] font-bold leading-relaxed opacity-80">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95">
        Generate Full Analysis
      </button>
    </div>
  );
};

export default AIInsights;

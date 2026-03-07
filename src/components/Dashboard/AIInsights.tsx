
import React from 'react';
import { AIInsight } from '../../types';

const AIInsights: React.FC = () => {
  const insights: AIInsight[] = [
    {
      id: '1',
      type: 'PAYMENT_RISK',
      title: 'High Default Risk Detected',
      description: '3 parents in North Zone show an 85% probability of late payment this month based on historical data.',
      priority: 'HIGH',
      actionLabel: 'Send Preventive Reminders',
      impact: 'High'
    },
    {
      id: '2',
      type: 'FLEET_EFFICIENCY',
      title: 'Route Optimization',
      description: 'Kangra Main Express is running at 40% capacity. Suggest merging with North Link to save ₹12k/month.',
      priority: 'MEDIUM',
      actionLabel: 'View Route Suggestion',
      impact: 'Medium'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="w-10 h-10 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <i className="fas fa-brain text-lg"></i>
        </div>
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">AI Strategic Insights</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Intelligence</p>
        </div>
      </div>
      
      {insights.map((insight, idx) => (
        <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-premium hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-${insight.priority === 'HIGH' ? 'red' : 'blue'}-500/10 to-transparent rounded-bl-[100%] -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-700`}></div>
          
          {insight.priority === 'HIGH' && (
            <div className="absolute left-0 top-6 bottom-6 w-1 bg-red-500 rounded-r-full"></div>
          )}
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
              insight.priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
            }`}>
              {insight.priority} Priority
            </span>
          </div>
          
          <h4 className="text-sm font-black text-slate-800 tracking-tight mb-2 relative z-10 group-hover:text-primary transition-colors">{insight.title}</h4>
          <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-6 relative z-10">{insight.description}</p>
          
          <button className="w-full py-3 bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm hover:shadow-lg active:scale-95 relative z-10 flex items-center justify-center gap-2 group/btn">
            {insight.actionLabel}
            <i className="fas fa-arrow-right opacity-0 group-hover/btn:opacity-100 -ml-2 group-hover/btn:ml-0 transition-all"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default AIInsights;

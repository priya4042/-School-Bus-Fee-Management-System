
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-indigo-500/10 text-indigo-600 rounded-lg flex items-center justify-center">
          <i className="fas fa-brain text-xs"></i>
        </div>
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">AI Strategic Insights</h3>
      </div>
      
      {insights.map((insight, idx) => (
        <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          {insight.priority === 'HIGH' && (
            <div className="absolute top-0 right-0 w-1 h-full bg-red-500"></div>
          )}
          <div className="flex justify-between items-start mb-2">
            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
              insight.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
            }`}>
              {insight.priority} Priority
            </span>
          </div>
          <h4 className="text-sm font-black text-slate-800 tracking-tight mb-1">{insight.title}</h4>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">{insight.description}</p>
          <button className="w-full py-2.5 bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all">
            {insight.actionLabel}
          </button>
        </div>
      ))}
    </div>
  );
};

export default AIInsights;

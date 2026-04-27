import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  cta?: { label: string; onClick: () => void };
  className?: string;
  tone?: 'neutral' | 'success' | 'warning';
}

const TONE: Record<NonNullable<EmptyStateProps['tone']>, { iconBg: string; iconColor: string }> = {
  neutral: { iconBg: 'bg-slate-50', iconColor: 'text-slate-300' },
  success: { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-400' },
  warning: { iconBg: 'bg-amber-50', iconColor: 'text-amber-400' },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'fa-inbox',
  title,
  message,
  cta,
  className = '',
  tone = 'neutral',
}) => {
  const palette = TONE[tone];

  return (
    <div
      className={`bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm py-12 md:py-16 px-6 md:px-8 text-center animate-in fade-in zoom-in-95 duration-500 ${className}`}
    >
      <div className={`relative mx-auto w-20 h-20 md:w-24 md:h-24 ${palette.iconBg} rounded-3xl flex items-center justify-center mb-5 md:mb-6`}>
        <i className={`fas ${icon} ${palette.iconColor} text-3xl md:text-4xl`}></i>
        <span className={`absolute inset-0 ${palette.iconBg} rounded-3xl animate-ping opacity-30`}></span>
      </div>
      <h3 className="text-base md:text-xl font-black text-slate-900 tracking-tight">{title}</h3>
      {message && (
        <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-2 max-w-md mx-auto">
          {message}
        </p>
      )}
      {cta && (
        <button
          onClick={cta.onClick}
          className="mt-6 md:mt-8 px-6 md:px-8 py-3 md:py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-800 active:scale-95 transition-all"
        >
          {cta.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

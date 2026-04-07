import React from 'react';

const MiniLoader: React.FC<{ text?: string }> = ({ text = 'Loading' }) => {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-5">
      {/* Animated SBW circle */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Outer rotating ring */}
        <svg className="absolute inset-0 w-20 h-20 animate-spin" style={{ animationDuration: '2.5s' }} viewBox="0 0 80 80">
          <defs>
            <linearGradient id="miniGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="35" fill="none" stroke="url(#miniGrad)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="165 55" />
        </svg>
        {/* Inner reverse ring */}
        <svg className="absolute inset-0 w-20 h-20 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="28" fill="none" stroke="#1e40af" strokeWidth="1" strokeLinecap="round" strokeDasharray="40 140" opacity="0.2" />
        </svg>
        {/* Center text */}
        <span className="text-sm font-black bg-gradient-to-br from-primary to-cyan-500 bg-clip-text text-transparent select-none">
          SBW
        </span>
      </div>
      <p className="text-[9px] font-bold text-slate-400 tracking-widest">{text}</p>
    </div>
  );
};

export default MiniLoader;

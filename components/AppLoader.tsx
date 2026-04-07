import React, { useState, useEffect } from 'react';

const AppLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 12;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-[120px]"></div>

      <div className="relative z-10 flex flex-col items-center gap-10">

        {/* Animated circle with initials */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Outer rotating ring */}
          <svg className="absolute inset-0 w-40 h-40 animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 160 160">
            <defs>
              <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <circle cx="80" cy="80" r="72" fill="none" stroke="url(#loaderGrad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="340 110" />
          </svg>

          {/* Inner pulsing ring */}
          <svg className="absolute inset-0 w-40 h-40 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }} viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="62" fill="none" stroke="#1e40af" strokeWidth="1" strokeLinecap="round" strokeDasharray="80 300" opacity="0.3" />
          </svg>

          {/* Small orbiting dots */}
          <div className="absolute inset-0 w-40 h-40 animate-spin" style={{ animationDuration: '4s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
          </div>
          <div className="absolute inset-0 w-40 h-40 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50"></div>
          </div>

          {/* Center initials */}
          <div className="relative flex items-center justify-center">
            <span className="text-4xl font-black tracking-tight bg-gradient-to-br from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent select-none">
              SBW
            </span>
          </div>
        </div>

        {/* App name with animated reveal */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-black text-white tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
              School Bus WayPro
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/50"></div>
            <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.4em]">Fleet Manager</p>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/50"></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-52 space-y-3">
          <div className="h-[3px] bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-primary via-blue-400 to-cyan-400"
              style={{ width: `${Math.min(progress, 95)}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              Initializing
            </p>
          </div>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-8 text-center" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <p className="text-[8px] font-bold text-slate-700 uppercase tracking-[0.3em]">
          Priya Tech Labs
        </p>
      </div>
    </div>
  );
};

export default AppLoader;

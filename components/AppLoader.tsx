import React, { useState, useEffect } from 'react';
import { APP_NAME } from '../constants';

const AppLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px]"></div>

      <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">
        {/* App icon */}
        <div className="relative">
          <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/30 border border-white/10">
            <i className="fas fa-bus-alt text-5xl text-white"></i>
          </div>
          {/* Pulsing ring */}
          <div className="absolute inset-0 w-24 h-24 rounded-[2rem] border-2 border-primary/30 animate-ping" style={{ animationDuration: '2s' }}></div>
        </div>

        {/* App name */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{APP_NAME}</h1>
          <p className="text-[9px] font-black text-primary uppercase tracking-[0.5em] mt-2">Enterprise Fleet Manager</p>
        </div>

        {/* Progress bar */}
        <div className="w-48 space-y-3">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 95)}%` }}
            ></div>
          </div>
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center">
            Loading{dots}
          </p>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-10 text-center">
        <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">
          Powered by Priya Tech Labs
        </p>
      </div>
    </div>
  );
};

export default AppLoader;

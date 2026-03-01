import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Shield, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center space-y-12"
      >
        <div className="space-y-4">
          <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-emerald-600/20 mx-auto mb-8">
            <Bus size={40} />
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-zinc-900 dark:text-white">
            BusWay <span className="text-emerald-600">Pro</span>
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Enterprise-grade school transport management system. Secure, real-time, and reliable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <button 
            onClick={() => navigate('/admin/login')}
            className="group p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-600 dark:hover:border-emerald-600 transition-all hover:shadow-2xl hover:shadow-emerald-600/10 text-left space-y-4"
          >
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">School Admin</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Fleet & Finance management.</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/parent/login')}
            className="group p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-600 dark:hover:border-emerald-600 transition-all hover:shadow-2xl hover:shadow-emerald-600/10 text-left space-y-4"
          >
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Parent Portal</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Track child & pay fees.</p>
            </div>
          </button>
        </div>

        <div className="pt-12 flex items-center justify-center gap-8 text-xs font-bold uppercase tracking-widest text-zinc-400">
          <span className="flex items-center gap-2"><Shield size={14} /> Secure JWT</span>
          <span className="flex items-center gap-2"><Bus size={14} /> Real-time GPS</span>
          <span className="flex items-center gap-2"><Users size={14} /> 64+ Students</span>
        </div>
      </motion.div>
    </div>
  );
}

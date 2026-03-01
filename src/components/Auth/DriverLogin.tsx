import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Eye, EyeOff, Lock, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export default function DriverLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phoneNumber, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('userRole', data.user.role.toLowerCase());
        toast.success('Welcome back, Driver!');
        navigate('/driver/dashboard');
      } else {
        toast.error(data.error || 'Invalid credentials');
      }
    } catch (err) {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-600/20 mb-4">
            <Bus size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Driver Portal</h1>
          <p className="text-zinc-500 text-sm mt-1 text-center">Manage your route and students</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="tel" 
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-amber-500 transition-all text-zinc-900 dark:text-white"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-amber-500 transition-all text-zinc-900 dark:text-white"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Back to Selection
          </button>
        </div>
      </motion.div>
    </div>
  );
}

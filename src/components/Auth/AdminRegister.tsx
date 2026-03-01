import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Shield, Eye, EyeOff, Lock, Mail, User, Key } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export default function AdminRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    masterSecret: ''
  });

  const passwordStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    return strength;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match");
    }
    if (passwordStrength(formData.password) < 50) {
      return toast.error("Password is too weak");
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Admin account created successfully!');
        navigate('/admin/login');
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-zinc-900 shadow-lg mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Admin Registration</h1>
          <p className="text-zinc-500 text-sm mt-1 text-center">Create a new enterprise administrator</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-zinc-900 dark:text-white"
                placeholder="Admin Name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-zinc-900 dark:text-white"
                placeholder="admin@busway.pro"
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
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-zinc-900 dark:text-white"
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
            {formData.password && (
              <div className="px-1 mt-2">
                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      strength <= 25 ? 'bg-red-500 w-1/4' : 
                      strength <= 50 ? 'bg-amber-500 w-1/2' : 
                      strength <= 75 ? 'bg-blue-500 w-3/4' : 'bg-emerald-500 w-full'
                    }`}
                  />
                </div>
                <p className="text-[10px] mt-1 text-zinc-500 font-medium">
                  Strength: {strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Strong'}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="password" 
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-zinc-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Master Admin Secret</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="password" 
                required
                value={formData.masterSecret}
                onChange={(e) => setFormData({...formData, masterSecret: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-zinc-900 dark:text-white"
                placeholder="Enter Setup Key"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
            ) : (
              "Register Admin"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <button 
            onClick={() => navigate('/admin/login')}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Already have an account? Sign In
          </button>
        </div>
      </motion.div>
    </div>
  );
}

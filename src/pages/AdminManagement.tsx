
import React from 'react';
import { Shield, Plus, Search, Filter, Trash2, Edit2, User, Mail, Phone, Lock } from 'lucide-react';

const AdminManagement: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Admin Management</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage System Administrators & Permissions</p>
        </div>
        <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2">
          <Plus size={20} />
          Add New Admin
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-[3rem] p-10 shadow-premium border border-slate-100 group hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between mb-8">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110">
                <Shield size={32} />
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                  <Edit2 size={16} />
                </button>
                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-2">Admin User {i}</h3>
            <p className="text-primary font-black uppercase text-[10px] tracking-widest mb-8">System Administrator</p>

            <div className="space-y-4 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-4 text-slate-500">
                <Mail size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">admin{i}@buswaypro.com</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <Phone size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">+91 98765 4321{i}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <Lock size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Full Access Control</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManagement;

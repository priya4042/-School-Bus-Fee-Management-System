
import React from 'react';
import { Shield, Lock, Eye, FileText, ChevronLeft } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-8 md:p-20 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-3 text-slate-400 hover:text-primary transition-colors group"
        >
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
            <ChevronLeft size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Return to Portal</span>
        </button>

        <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-premium border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="relative z-10 space-y-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center">
                <Shield size={40} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Privacy Policy</h1>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Last Updated: May 2024</p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none space-y-8">
              <section className="space-y-4">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Data Collection
                </h2>
                <p className="text-slate-600 font-medium leading-loose text-sm">
                  We collect information necessary to provide safe and efficient transportation services, including student names, parent contact details, and real-time GPS location data of school vehicles.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Usage & Security
                </h2>
                <p className="text-slate-600 font-medium leading-loose text-sm">
                  Your data is encrypted end-to-end and stored securely. We use location data exclusively for tracking school buses and notifying parents of arrivals or delays. We never sell your personal information to third parties.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Your Rights
                </h2>
                <p className="text-slate-600 font-medium leading-loose text-sm">
                  You have the right to access, correct, or delete your personal information at any time through your account settings or by contacting the school administration.
                </p>
              </section>
            </div>

            <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Lock size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">SSL Encrypted</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secure Connection</p>
                </div>
              </div>
              <button className="bg-slate-950 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-950/20 hover:bg-black transition-all">
                Download PDF Version
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

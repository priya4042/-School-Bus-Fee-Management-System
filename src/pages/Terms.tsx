
import React from 'react';
import { FileText, CheckCircle2, AlertCircle, ChevronLeft } from 'lucide-react';

const Terms: React.FC = () => {
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
                <FileText size={40} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Terms of Service</h1>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Last Updated: May 2024</p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none space-y-8">
              <section className="space-y-4">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Agreement to Terms
                </h2>
                <p className="text-slate-600 font-medium leading-loose text-sm">
                  By accessing or using the Busway Pro platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  User Responsibilities
                </h2>
                <p className="text-slate-600 font-medium leading-loose text-sm">
                  Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account. You must notify us immediately of any unauthorized use.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Service Availability
                </h2>
                <p className="text-slate-600 font-medium leading-loose text-sm">
                  We strive to provide continuous service but do not guarantee uninterrupted access. Real-time tracking accuracy may vary based on network conditions and GPS signal strength.
                </p>
              </section>
            </div>

            <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Verified Compliance</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Legal Standard 2024</p>
                </div>
              </div>
              <button className="bg-slate-950 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-950/20 hover:bg-black transition-all">
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;

import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-8 md:p-20">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-10 md:p-20 shadow-xl">
        <h1 className="text-4xl font-black text-slate-800 mb-8 uppercase tracking-tighter">Terms of Service</h1>
        <p className="text-slate-500 mb-6 font-bold uppercase text-[10px] tracking-widest">Last Updated: February 2026</p>
        
        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tight">1. Acceptance of Terms</h2>
            <p>By accessing BusWay Pro, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tight">2. Use License</h2>
            <p>Permission is granted to use the BusWay Pro application for personal, non-commercial school transport tracking and fee management only.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tight">3. Payment Terms</h2>
            <p>Fees are processed via Stripe. All payments are subject to the school's specific refund policies. Late fees are automatically calculated based on system parameters.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tight">4. Termination</h2>
            <p>We reserve the right to terminate access for users who violate safety protocols or misuse the real-time tracking features.</p>
          </section>
        </div>

        <div className="mt-12 pt-12 border-t border-slate-100">
          <button onClick={() => window.history.back()} className="text-primary font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
            <i className="fas fa-arrow-left"></i> Back to App
          </button>
        </div>
      </div>
    </div>
  );
};

export default Terms;

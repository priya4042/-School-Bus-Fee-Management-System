import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-8 md:p-20">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-10 md:p-20 shadow-xl">
        <h1 className="text-4xl font-black text-slate-800 mb-8 uppercase tracking-tighter">Privacy Policy</h1>
        <p className="text-slate-500 mb-6 font-bold uppercase text-[10px] tracking-widest">Last Updated: February 2026</p>
        
        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tight">1. Information Collection</h2>
            <p>We collect information you provide directly to us, such as when you create an account, including your name, email address, phone number, and student admission details.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tight">2. Location Data</h2>
            <p>For real-time bus tracking, we collect precise location data from bus GPS devices. This data is only accessible to authorized parents and administrators.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tight">3. Data Security</h2>
            <p>We implement industry-standard security measures, including HTTPS encryption and secure JWT authentication, to protect your personal information.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tight">4. Account Deletion</h2>
            <p>Users have the right to delete their accounts at any time through the Profile settings. All personal data will be permanently removed from our active databases.</p>
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

export default Privacy;

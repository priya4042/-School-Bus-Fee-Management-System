import React from 'react';

const adminModules = [
  { name: 'Dashboard', details: 'Revenue, student count, overdue dues, fleet health, live monitor.' },
  { name: 'Students', details: 'Student master, admission numbers, parent mapping, fee setup.' },
  { name: 'Attendance', details: 'Attendance capture and review for operations and compliance.' },
  { name: 'User Directory', details: 'Searchable directory for users and role visibility.' },
  { name: 'Routes', details: 'Route planning, stop management, and route assignments.' },
  { name: 'Buses', details: 'Fleet records, bus status, and operational assignment.' },
  { name: 'Live Tracking', details: 'Real-time bus tracking and movement visibility.' },
  { name: 'Payments', details: 'Monthly dues overview, paid and pending states, collection analytics.' },
  { name: 'Reports', details: 'Administrative reporting views for finance and operations.' },
  { name: 'Notifications', details: 'Broadcasts, payment confirmations, profile update requests.' },
  { name: 'Audit Logs', details: 'Action stream for critical, finance, data, and system events.' },
  { name: 'Bus admins', details: 'Super admin area to manage bus admin accounts.' },
  { name: 'Settings', details: 'Fee configuration and global policy controls (with local fallback).' },
  { name: 'Support', details: 'Support channel for issue handling and communication.' },
];

const parentModules = [
  { name: 'Dashboard', details: 'Parent summary for dues, child data, and quick actions.' },
  { name: 'Student Profile', details: 'Parent and child profile updates with admin review flow.' },
  { name: 'Attendance History', details: 'Historical attendance insights for children.' },
  { name: 'Routes', details: 'Assigned route visibility and transport details.' },
  { name: 'Live Tracking', details: 'Optional real-time tracking if enabled in parent preferences.' },
  { name: 'Bus Camera', details: 'Optional camera view if enabled in parent preferences.' },
  { name: 'Payments / Fees / Receipts', details: 'Pay dues, view payment status, and access receipts.' },
  { name: 'Notifications', details: 'Payment updates, approvals, and operational alerts.' },
  { name: 'Profile', details: 'Parent profile details and account info.' },
  { name: 'Settings', details: 'Parent-level personal and app preference settings.' },
  { name: 'Support', details: 'Issue reporting and help requests.' },
];

const stackRows = [
  { area: 'Frontend', used: 'React + TypeScript + Vite + TailwindCSS', pricing: 'Free / Open source', buy: 'No purchase needed' },
  { area: 'Backend API', used: 'Serverless endpoints (Vercel) + optional Python backend', pricing: 'Free tier available', buy: 'Upgrade if traffic grows' },
  { area: 'Database + Auth', used: 'Supabase (Postgres, Auth, Realtime)', pricing: 'Free tier + paid plans', buy: 'Buy paid plan for production scale' },
  { area: 'Hosting', used: 'Vercel (frontend deployment)', pricing: 'Free tier + Pro plans', buy: 'Buy Pro for team limits and higher usage' },
  { area: 'Payments', used: 'Razorpay checkout + webhook verification', pricing: 'Per transaction fees', buy: 'Business account required for live payments' },
  { area: 'Maps', used: 'Google Maps integration', pricing: 'Usage-based billing', buy: 'Billing account required beyond free credit' },
  { area: 'Alerts / UI', used: 'SweetAlert, custom notification UI', pricing: 'Free libraries', buy: 'No purchase needed' },
  { area: 'Build Tooling', used: 'Node.js, npm, ESLint, TypeScript', pricing: 'Free / Open source', buy: 'No purchase needed' },
  { area: 'Mobile Wrapper', used: 'Capacitor for Android packaging', pricing: 'Free / Open source', buy: 'No purchase needed' },
  { area: 'Play Store', used: 'Google Play Console account and app release management', pricing: 'One-time account fee', buy: 'Required to publish app' },
  { area: 'Cloud Backend (Optional)', used: 'Render-hosted backend APIs if used in env config', pricing: 'Free tier + paid plans', buy: 'Upgrade for always-on and higher traffic' },
];

const playStoreChecklist = [
  'Google Play Console account (one-time registration fee)',
  'App signing key and upload key generated and stored securely',
  'Android package ID and app name finalized',
  'Capacitor Android project synced from web build',
  'Production API endpoints configured in environment variables',
  'Razorpay live keys and webhook URL configured',
  'Supabase production project URL and anon key configured',
  'Privacy policy URL and Terms URL publicly accessible',
  'App icon, feature graphic, screenshots, and app description ready',
  'Internal testing track release tested before production rollout',
];

const envItems = [
  { key: 'VITE_SUPABASE_URL', purpose: 'Supabase project URL for auth and database access' },
  { key: 'VITE_SUPABASE_ANON_KEY', purpose: 'Public anon key used by frontend Supabase client' },
  { key: 'VITE_RAZORPAY_KEY_ID', purpose: 'Razorpay public key for checkout initialization' },
  { key: 'VITE_API_BASE_URL', purpose: 'Optional backend API base URL if using external API server' },
  { key: 'VITE_GOOGLE_MAPS_API_KEY', purpose: 'Google Maps key for live tracking map features' },
];

const Documentation: React.FC = () => {
  const handleDownloadPdf = () => {
    // Uses browser print dialog where user can choose "Save as PDF".
    window.print();
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">Platform Documentation Center</h2>
            <p className="text-slate-500 text-sm mt-3 max-w-4xl leading-relaxed">
              This page gives a complete product-level reference for Admin and Parent modules, architecture,
              integrations, and what is free vs paid in your current application setup.
            </p>
          </div>
          <button
            onClick={handleDownloadPdf}
            className="print:hidden inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            <i className="fas fa-file-pdf"></i>
            Download PDF
          </button>
        </div>
        <p className="print:hidden text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
          Tip: Browser will open print dialog. Choose Save as PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-5">Admin Modules</h3>
          <div className="space-y-4">
            {adminModules.map((item) => (
              <div key={item.name} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <p className="text-sm font-black text-slate-800 uppercase tracking-wide">{item.name}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.details}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-5">Parent Modules</h3>
          <div className="space-y-4">
            {parentModules.map((item) => (
              <div key={item.name} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <p className="text-sm font-black text-slate-800 uppercase tracking-wide">{item.name}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.details}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm overflow-x-auto">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-5">Technology And Cost Matrix</h3>
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-100">
              <th className="py-3 pr-4">Area</th>
              <th className="py-3 pr-4">What We Use</th>
              <th className="py-3 pr-4">Free Or Paid</th>
              <th className="py-3 pr-4">What You Need To Buy</th>
            </tr>
          </thead>
          <tbody>
            {stackRows.map((row) => (
              <tr key={row.area} className="border-b border-slate-100 last:border-0">
                <td className="py-4 pr-4 text-xs font-black text-slate-800 uppercase tracking-wide">{row.area}</td>
                <td className="py-4 pr-4 text-xs text-slate-700">{row.used}</td>
                <td className="py-4 pr-4 text-xs text-slate-700">{row.pricing}</td>
                <td className="py-4 pr-4 text-xs text-slate-700">{row.buy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-5">Production Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
            <p className="font-black text-slate-800 uppercase tracking-wide mb-2">Must Have</p>
            <p>Supabase project, Razorpay live keys, Vercel project, domain SSL, production environment variables.</p>
          </div>
          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
            <p className="font-black text-slate-800 uppercase tracking-wide mb-2">Recommended</p>
            <p>Paid Supabase plan, Vercel Pro, monitoring/alerts, backup policy, and clear admin SOPs.</p>
          </div>
          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
            <p className="font-black text-slate-800 uppercase tracking-wide mb-2">Optional</p>
            <p>Google Maps advanced billing limits, third-party SMS/WhatsApp channels, dedicated support tooling.</p>
          </div>
          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
            <p className="font-black text-slate-800 uppercase tracking-wide mb-2">Governance</p>
            <p>Role-based permissions, audit review cadence, payment reconciliation, and monthly release checks.</p>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-5">Play Store Deployment: Complete Guide</h3>
        <div className="space-y-4">
          {playStoreChecklist.map((item) => (
            <div key={item} className="flex items-start gap-3 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">OK</span>
              <p className="text-xs text-slate-700 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm overflow-x-auto">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-5">Environment Variables Used In Deployment</h3>
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-100">
              <th className="py-3 pr-4">Variable</th>
              <th className="py-3 pr-4">Purpose</th>
            </tr>
          </thead>
          <tbody>
            {envItems.map((row) => (
              <tr key={row.key} className="border-b border-slate-100 last:border-0">
                <td className="py-4 pr-4 text-xs font-black text-slate-800">{row.key}</td>
                <td className="py-4 pr-4 text-xs text-slate-700">{row.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-5">Play Store Release Flow</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
            <p className="font-black text-slate-800 uppercase tracking-wide mb-2">1. Build And Sync</p>
            <p>Run web production build, sync with Capacitor Android, open Android Studio, and generate signed AAB.</p>
          </div>
          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
            <p className="font-black text-slate-800 uppercase tracking-wide mb-2">2. Test Tracks</p>
            <p>Upload to internal testing first, verify payment flow, notifications, and map permissions on real devices.</p>
          </div>
          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
            <p className="font-black text-slate-800 uppercase tracking-wide mb-2">3. Store Listing</p>
            <p>Complete app content, data safety, permissions declarations, privacy policy, screenshots, and app description.</p>
          </div>
          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
            <p className="font-black text-slate-800 uppercase tracking-wide mb-2">4. Production Rollout</p>
            <p>Promote tested release to production and monitor crash reports, payment success rates, and audit logs.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Documentation;

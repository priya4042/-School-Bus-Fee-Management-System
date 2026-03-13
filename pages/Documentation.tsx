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
];

const Documentation: React.FC = () => {
  return (
    <div className="space-y-8 pb-8">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">Platform Documentation Center</h2>
        <p className="text-slate-500 text-sm mt-3 max-w-4xl leading-relaxed">
          This page gives a complete product-level reference for Admin and Parent modules, architecture,
          integrations, and what is free vs paid in your current application setup.
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
    </div>
  );
};

export default Documentation;

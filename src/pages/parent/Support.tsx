
import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { HelpCircle, MessageSquare, Phone, Mail, FileText, ChevronRight, Search, Globe, Shield, Clock, AlertCircle } from 'lucide-react';

const Support: React.FC<{ user: User }> = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    { q: 'How do I pay my fees online?', a: 'You can pay fees through the "Fee History" or "Dashboard" using Razorpay. We support UPI, Cards, and Netbanking.' },
    { q: 'How can I track my child\'s bus?', a: 'Go to the Dashboard and click "Establish Uplink" to see the live location of the bus assigned to your child.' },
    { q: 'What should I do if the bus is delayed?', a: 'You will receive a real-time notification if the bus is delayed by more than 15 minutes. You can also check the live status on the map.' },
    { q: 'How do I change my boarding point?', a: 'Navigate to "Boarding Points" in the sidebar and click "Add New Location" or edit your primary location.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Support Center</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">We're here to help you 24/7</p>
        </div>
        <div className="flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-2xl border border-primary/10 mx-auto md:mx-0">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live Support Online</span>
        </div>
      </div>

      <div className="bg-slate-950 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-bl-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-tr-full -ml-20 -mb-20 blur-3xl"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl font-black uppercase tracking-tight">How can we assist you today?</h2>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={24} />
            <input 
              type="text" 
              placeholder="Search for answers (e.g., 'fees', 'tracking', 'profile')..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-lg font-bold focus:ring-4 ring-primary/20 outline-none transition-all placeholder:text-white/20"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {['Payments', 'Bus Tracking', 'Account', 'Safety'].map((tag) => (
              <button key={tag} className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium text-center group hover:border-primary/20 transition-all">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 transition-transform group-hover:scale-110">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-4">Live Chat</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose mb-8">
            Instant assistance from our support team for urgent queries.
          </p>
          <button className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
            Start Chat
          </button>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium text-center group hover:border-emerald-500/20 transition-all">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transition-transform group-hover:scale-110">
            <Phone size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-4">Call Support</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose mb-8">
            Speak directly with our school transport administrators.
          </p>
          <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
            Call Now
          </button>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium text-center group hover:border-slate-900/20 transition-all">
          <div className="w-20 h-20 bg-slate-50 text-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transition-transform group-hover:scale-110">
            <Mail size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-4">Email Us</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose mb-8">
            Send us a detailed message and we'll reply within 24 hours.
          </p>
          <button className="w-full bg-slate-950 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-950/20 hover:bg-black transition-all">
            Send Email
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-12 shadow-premium border border-slate-100">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Frequently Asked Questions</h3>
          <button className="text-primary font-black uppercase text-[10px] tracking-widest hover:underline">View All FAQ</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:border-primary/20 transition-all">
              <div className="flex items-start gap-6">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                  <HelpCircle size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-3">{faq.q}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'User Manual', icon: <FileText />, color: 'text-blue-500' },
          { title: 'Safety Policy', icon: <Shield />, color: 'text-emerald-500' },
          { title: 'Terms of Service', icon: <Clock />, color: 'text-slate-500' },
          { title: 'Privacy Policy', icon: <AlertCircle />, color: 'text-red-500' },
        ].map((doc, idx) => (
          <button key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-premium flex items-center justify-between group hover:bg-slate-50 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 bg-slate-50 ${doc.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                {doc.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{doc.title}</span>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Support;

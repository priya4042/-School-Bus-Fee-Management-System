import React, { useState } from 'react';
import { User } from '../../types';
import {
  HelpCircle, MessageSquare, Phone, Mail, FileText,
  ChevronRight, Search, Shield, Clock, AlertCircle, Send, CheckCircle2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/swal';
import { useLanguage } from '../../lib/i18n';

const Support: React.FC<{ user: User; onOpenDocumentation?: () => void; section?: 'ticket' | 'faq' }> = ({ user, section = 'ticket' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeDocument, setActiveDocument] = useState<null | 'manual' | 'safety' | 'terms' | 'privacy'>(null);

  const docDetails: Record<'manual' | 'safety' | 'terms' | 'privacy', { title: string; sections: Array<{ heading: string; body: string }> }> = {
    manual: {
      title: 'User Manual',
      sections: [
        { heading: 'Dashboard Basics', body: 'Open Dashboard to see family summary, live tracking status, and pending dues for linked children. Use child chips to switch context quickly.' },
        { heading: 'Paying Fees', body: 'Go to Payments, select your child, review billing period and overdue months, then tap Pay Now for each unlocked due. Download receipt after success.' },
        { heading: 'Attendance & Alerts', body: 'Attendance History shows pickup/drop records. Notifications panel shows school announcements, payment updates, and delay alerts.' },
        { heading: 'Profile & Support', body: 'Use Profile to update contact details. Full name updates require admin approval. Use Support ticket form for route, payment, or access issues.' },
      ],
    },
    safety: {
      title: 'Safety Policy',
      sections: [
        { heading: 'Student Pickup Safety', body: 'Parents must be available at registered boarding points before scheduled arrival. Students should avoid road crossing without guardian supervision.' },
        { heading: 'Transport Compliance', body: 'Only authorized drivers and assigned buses can operate active routes. Emergency alerts are prioritized and cannot be disabled from preferences.' },
        { heading: 'Data & Access Safety', body: 'Do not share account credentials or security tokens. Report suspicious access immediately through support channels.' },
        { heading: 'Incident Reporting', body: 'Any delay, route deviation, or safety concern should be reported via support ticket with child name, route, time, and incident details.' },
      ],
    },
    terms: {
      title: 'Terms of Service',
      sections: [
        { heading: 'Acceptance of Terms', body: 'By using BusWay Pro, you agree to platform policies and all applicable school transport regulations.' },
        { heading: 'Use License', body: 'The app is intended for personal school transport and fee management use. Misuse or unauthorized access attempts are prohibited.' },
        { heading: 'Payment Terms', body: 'Fees are processed via configured payment gateway. Late fees and due schedules are applied by system policy configured by school administration.' },
        { heading: 'Termination', body: 'Access may be suspended for policy violations, safety threats, fraud attempts, or repeated misuse of notification/tracking systems.' },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      sections: [
        { heading: 'Information Collection', body: 'The platform stores parent profile details, student linkage data, payment records, and support interactions required for service delivery.' },
        { heading: 'Location Data', body: 'Live route location is shown only to authorized users and used solely for school transport operations and safety awareness.' },
        { heading: 'Data Security', body: 'Authentication, role controls, and secure transport methods are used to protect account and transaction data.' },
        { heading: 'Deletion & Retention', body: 'Users can request account deletion. Mandatory school and compliance records may be retained as per institutional policies.' },
      ],
    },
  };

  const faqs = [
    { q: 'How do I pay my fees online?', a: 'Go to "Fee History" in the sidebar and click "Pay Now" on any pending due. We support UPI, Cards, and Netbanking through our secure payment system.' },
    { q: 'How can I track my child\'s bus?', a: 'Go to the Dashboard and click "Establish Uplink" to see the live GPS location of the bus assigned to your child.' },
    { q: 'What should I do if the bus is delayed?', a: 'You will receive an automatic notification for delays. Check the live map in Dashboard for real-time status.' },
    { q: 'How do I change my boarding point?', a: 'Navigate to "Boarding Points" in the sidebar to view and update your child\'s pickup/drop location.' },
    { q: 'How do I download a payment receipt?', a: 'After a successful payment, go to "Fee History" and click the download icon next to any paid month to get the PDF receipt.' },
    { q: 'How do I view my child\'s attendance?', a: 'Go to "Attendance History" in the sidebar to see daily PICKUP and DROP records for your child.' },
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const handleSubmitTicket = async () => {
    if (!ticketSubject.trim()) { showToast('Please enter a subject', 'error'); return; }
    if (!ticketMessage.trim()) { showToast('Please describe your issue', 'error'); return; }

    setSubmitting(true);
    try {
      // Create a notification for admins — fetch any admin profile first
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['ADMIN', 'SUPER_ADMIN'])
        .limit(1);

      const adminId = admins?.[0]?.id;

      const notifPayload = {
        user_id: adminId || user.id, // fallback to self if no admin found
        title: `[${ticketPriority}] Support: ${ticketSubject}`,
        message: `From: ${user.full_name || user.email} (${user.phone_number || ''})\n\n${ticketMessage}`,
        type: ticketPriority === 'HIGH' ? 'DANGER' : ticketPriority === 'MEDIUM' ? 'WARNING' : 'INFO',
        is_read: false,
      };

      const { error } = await supabase.from('notifications').insert(notifPayload);

      if (error) throw error;

      setSubmitted(true);
      setTicketSubject('');
      setTicketMessage('');
      setShowTicketForm(false);
      showToast('Support ticket submitted! We will respond within 24 hours.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit ticket. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-4xl font-black text-slate-900 tracking-tight truncate">
            {section === 'faq' ? 'FAQ' : 'Submit Ticket'}
          </h1>
          <p className="text-slate-500 font-bold text-[9px] tracking-widest mt-0.5">
            {section === 'faq' ? 'Find answers to common questions' : "We're here to help"}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-xl border border-primary/10 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[8px] font-black text-primary uppercase tracking-widest">Active</span>
        </div>
      </div>

      {section === 'ticket' && (<>
      {/* Search hero */}
      <div className="bg-slate-950 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-bl-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-tr-full -ml-20 -mb-20 blur-3xl"></div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl font-black tracking-tight">How can we assist you today?</h2>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={24} />
            <input
              type="text"
              placeholder="Search FAQs (e.g., 'fees', 'tracking', 'receipt')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-base font-bold focus:ring-4 ring-primary/20 outline-none transition-all placeholder:text-white/20"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {['Payments', 'Bus Tracking', 'Receipts', 'Account'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contact channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-slate-100 shadow-sm text-center group hover:border-primary/20 transition-all cursor-pointer"
          onClick={() => setShowTicketForm(true)}
        >
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 transition-transform group-hover:scale-110">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4">Submit Ticket</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose mb-8">
            Send us a detailed support request and we'll respond promptly.
          </p>
          <button className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-800 transition-all">
            Open Ticket
          </button>
        </div>

        <a
          href="tel:+911234567890"
          className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-slate-100 shadow-sm text-center group hover:border-emerald-500/20 transition-all"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transition-transform group-hover:scale-110">
            <Phone size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4">Call Support</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose mb-8">
            Speak directly with our Bus Administrators.
          </p>
          <div className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all text-center">
            Call Now
          </div>
        </a>

        <a
          href="mailto:support@school.com"
          className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-slate-100 shadow-sm text-center group hover:border-slate-900/20 transition-all"
        >
          <div className="w-20 h-20 bg-slate-50 text-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transition-transform group-hover:scale-110">
            <Mail size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4">Email Us</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose mb-8">
            Send a detailed message and we'll reply within 24 hours.
          </p>
          <div className="w-full bg-slate-950 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-950/20 hover:bg-black transition-all text-center">
            Send Email
          </div>
        </a>
      </div>

      {/* Ticket Form Modal */}
      {showTicketForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-20 pb-6 md:pt-24">
          <div className="bg-white rounded-2xl md:rounded-[3rem] p-5 md:p-10 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Submit Support Ticket</h2>
              <button
                onClick={() => setShowTicketForm(false)}
                className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-4 ring-primary/10 focus:border-primary"
                  placeholder="Briefly describe your issue"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                <div className="flex gap-3">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setTicketPriority(p)}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        ticketPriority === p
                          ? p === 'HIGH'
                            ? 'bg-red-500 text-white'
                            : p === 'MEDIUM'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  rows={5}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-4 ring-primary/10 focus:border-primary resize-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowTicketForm(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTicket}
                  disabled={submitting}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <i className="fas fa-circle-notch fa-spin"></i>
                  ) : (
                    <Send size={16} />
                  )}
                  {submitting ? 'Sending...' : 'Submit Ticket'}
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Success banner */}
      {submitted && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="font-black text-emerald-800 uppercase tracking-tight">Ticket Submitted Successfully</p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">
              Our team will respond within 24 hours.
            </p>
          </div>
        </div>
      )}

      </>)}

      {section === 'faq' && (<>
      {/* FAQ */}
      <div className="bg-white rounded-2xl md:rounded-[3rem] p-5 md:p-12 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h3>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-primary font-black uppercase text-[10px] tracking-widest hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>
        {filteredFaqs.length === 0 ? (
          <p className="text-center text-slate-400 font-black uppercase tracking-widest text-[10px] py-10">
            No FAQs match your search
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 md:p-8 bg-slate-50 rounded-xl md:rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:border-primary/20 transition-all"
              >
                <div className="flex items-start gap-6">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
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
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 pb-4">
        {[
          { id: 'manual', title: 'User Manual', icon: <FileText />, color: 'text-blue-500' },
          { id: 'safety', title: 'Safety Policy', icon: <Shield />, color: 'text-emerald-500' },
          { id: 'terms', title: 'Terms of Service', icon: <Clock />, color: 'text-slate-500' },
          { id: 'privacy', title: 'Privacy Policy', icon: <AlertCircle />, color: 'text-red-500' },
        ].map((doc, idx) => (
          <button
            key={idx}
            onClick={() => setActiveDocument(doc.id as 'manual' | 'safety' | 'terms' | 'privacy')}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:bg-slate-50 transition-all"
          >
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

      </>)}

      {activeDocument && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2100] overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-20 pb-6 md:pt-24">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-3xl w-full max-h-[calc(100vh-6rem)] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{docDetails[activeDocument].title}</h3>
              <button
                onClick={() => setActiveDocument(null)}
                className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-6">
              {docDetails[activeDocument].sections.map((sec) => (
                <div key={sec.heading} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60">
                  <h4 className="text-sm font-black text-slate-800 tracking-widest mb-2">{sec.heading}</h4>
                  <p className="text-[12px] text-slate-600 font-semibold leading-relaxed">{sec.body}</p>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;

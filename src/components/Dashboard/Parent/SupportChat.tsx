import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  User, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Loader2,
  Plus,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

interface SupportChatProps {
  isDarkMode: boolean;
}

export default function SupportChat({ isDarkMode }: SupportChatProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/parent/support/tickets', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setTickets(data);
      } else {
        toast.error(data.error || 'Failed to fetch tickets');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/parent/support/ticket', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success('Ticket created successfully');
        setIsModalOpen(false);
        setFormData({ subject: '', message: '' });
        fetchTickets();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create ticket');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className={`p-8 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-600/10">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Support & Help</h3>
            <p className="text-zinc-500 text-sm">Raise a ticket or chat with the school transport admin</p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={20} />
          New Support Request
        </button>
      </div>

      {/* Tickets List */}
      <div className="flex-1 space-y-6">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto animate-spin text-indigo-500 mb-4" size={48} />
            <p className="text-zinc-500">Loading your requests...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[40px]">
            <HelpCircle size={64} className="mx-auto text-zinc-200 mb-4" />
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white">No active requests</h4>
            <p className="text-zinc-500 max-w-xs mx-auto mt-2">If you have any issues with transport or fees, please raise a new support request.</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div 
              key={ticket.id}
              className={`p-8 rounded-[32px] border transition-all hover:shadow-lg ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ticket.status === 'open' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' :
                      ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20' :
                      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-bold mb-2">{ticket.subject}</h4>
                    <p className="text-zinc-500 text-sm leading-relaxed">{ticket.message}</p>
                  </div>

                  {ticket.admin_response && (
                    <div className={`p-6 rounded-2xl border-l-4 ${isDarkMode ? 'bg-black/40 border-indigo-600' : 'bg-indigo-50 border-indigo-600'}`}>
                      <div className="flex items-center gap-2 mb-2 text-indigo-600">
                        <ShieldCheck size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Admin Response</span>
                      </div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{ticket.admin_response}</p>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col gap-2">
                  <button className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl text-zinc-400 transition-all">
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}
            >
              <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">New Support Request</h3>
                  <p className="text-zinc-500 text-sm mt-1">Our team will respond within 24 hours.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all">
                  <XCircle size={28} className="text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Subject</label>
                  <select 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  >
                    <option value="">Select a category</option>
                    <option value="Bus Delay">Bus Delay / Issue</option>
                    <option value="Fee Issue">Fee / Payment Issue</option>
                    <option value="Boarding Change">Boarding Point Change</option>
                    <option value="Waiver Request">Fee Waiver Request</option>
                    <option value="Other">Other Query</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Message</label>
                  <textarea 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[160px] resize-none font-medium"
                    placeholder="Describe your issue in detail..."
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-4 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Submit Request"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

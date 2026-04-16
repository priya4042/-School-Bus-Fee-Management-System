import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, User as UserIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { getBotReply } from '../lib/chatBot';
import { useLanguage } from '../lib/i18n';

interface ChatMessage {
  id: string;
  message: string;
  title: string;
  created_at: string;
  user_id: string;
  is_from_admin: boolean;
}

const SupportChat: React.FC<{ user: User }> = ({ user }) => {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .like('title', '%[CHAT]%')
      .order('created_at', { ascending: true })
      .limit(50);

    if (data) {
      const mapped = data.map((n: any) => ({
        id: n.id,
        message: n.message,
        title: n.title,
        created_at: n.created_at,
        user_id: n.user_id,
        is_from_admin: n.title?.includes('[CHAT] Admin'),
      }));
      setMessages(mapped);
      const unreadCount = data.filter((n: any) => !n.is_read && n.title?.includes('[CHAT] Admin')).length;
      setUnread(unreadCount);
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`chat-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload: any) => {
        if (payload.new?.title?.includes('[CHAT]')) {
          const msg: ChatMessage = {
            id: payload.new.id,
            message: payload.new.message,
            title: payload.new.title,
            created_at: payload.new.created_at,
            user_id: payload.new.user_id,
            is_from_admin: payload.new.title?.includes('[CHAT] Admin'),
          };
          // Only add if not already in list (avoid duplicates from optimistic update)
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          if (!isOpen && msg.is_from_admin) setUnread(prev => prev + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user.id]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      inputRef.current?.focus();
      // Mark chat messages as read
      supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .like('title', '%[CHAT] Admin%')
        .eq('is_read', false)
        .then();
    }
  }, [isOpen, user.id]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput('');

    const displayName = user.fullName || user.full_name || user.email || 'Parent';
    const tempId = `temp-${Date.now()}`;

    // Optimistic UI: show message immediately
    const optimisticMsg: ChatMessage = {
      id: tempId,
      message: text,
      title: `[CHAT] ${displayName}`,
      created_at: new Date().toISOString(),
      user_id: user.id,
      is_from_admin: false,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      // Save in parent's notifications (so parent sees their own message)
      const { data: inserted } = await supabase.from('notifications').insert({
        user_id: user.id,
        title: `[CHAT] ${displayName}`,
        message: text,
        type: 'INFO',
        is_read: true,
      }).select('id').single();

      // Update temp ID with real ID
      if (inserted?.id) {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: inserted.id } : m));
      }

      // Also notify admin
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['ADMIN', 'SUPER_ADMIN'])
        .limit(1);

      if (admins?.[0]?.id) {
        await supabase.from('notifications').insert({
          user_id: admins[0].id,
          title: `[CHAT] ${displayName}`,
          message: text,
          type: 'INFO',
          is_read: false,
        });
      }

      // Bot auto-reply
      const botReply = getBotReply(text, lang);
      if (botReply) {
        setTimeout(() => {
          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            message: botReply,
            title: '[CHAT] Admin',
            created_at: new Date().toISOString(),
            user_id: user.id,
            is_from_admin: true,
          };
          setMessages(prev => [...prev, botMsg]);

          // Also save bot reply to DB so it persists
          supabase.from('notifications').insert({
            user_id: user.id,
            title: '[CHAT] Admin',
            message: botReply,
            type: 'INFO',
            is_read: false,
          }).then();
        }, 1000 + Math.random() * 1000); // 1-2s delay for natural feel
      }
    } catch {
      // Remove optimistic message on failure, restore input
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' +
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-3 z-[1500] w-12 h-12 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all ${
          isOpen ? 'bg-slate-800 text-white shadow-slate-800/40' : 'bg-primary text-white shadow-primary/40'
        }`}
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 4rem)' }}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {unread > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed left-2 right-2 sm:left-auto sm:right-4 sm:w-80 z-[2000] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 4rem)', top: 'calc(env(safe-area-inset-top, 0px) + 4rem)' }}
        >
          {/* Header */}
          <div className="bg-slate-950 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-widest">AI Assistant</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50 min-h-[150px] max-h-[350px]">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={20} className="text-slate-300" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ask me anything</p>
                <p className="text-[9px] text-slate-400 mt-1">I can help with fees, tracking, attendance & more</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_from_admin ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] ${msg.is_from_admin ? 'order-2' : ''}`}>
                  <div className={`px-4 py-3 rounded-2xl ${
                    msg.is_from_admin
                      ? 'bg-white border border-slate-100 rounded-tl-md'
                      : 'bg-primary text-white rounded-tr-md'
                  }`}>
                    {msg.is_from_admin && (
                      <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-1">
                        {msg.id?.startsWith('bot-') ? <><i className="fas fa-robot text-[7px]"></i> AI Bot</> : <><UserIcon size={8} /> Admin</>}
                      </p>
                    )}
                    <p className={`text-[12px] font-semibold leading-relaxed ${msg.is_from_admin ? 'text-slate-700' : 'text-white'}`}>
                      {msg.message}
                    </p>
                  </div>
                  <p className={`text-[8px] font-bold text-slate-300 mt-1 ${msg.is_from_admin ? 'text-left ml-1' : 'text-right mr-1'}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 focus:border-primary transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-blue-800 transition-all flex-shrink-0"
              >
                {sending ? <i className="fas fa-circle-notch fa-spin text-xs"></i> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChat;

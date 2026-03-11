import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, Plus, Trash2, CheckCircle2, AlertCircle, Star } from 'lucide-react';

interface Contact {
  id: string;
  type: 'phone' | 'email' | 'whatsapp';
  value: string;
  label: string;
  isPrimary: boolean;
  isVerified: boolean;
}

interface ContactManagerProps {
  contacts: Contact[];
  onAdd: (contact: any) => void;
  onDelete: (id: string) => void;
  onSetPrimary: (id: string) => void;
}

const ContactManager: React.FC<ContactManagerProps> = ({ contacts, onAdd, onDelete, onSetPrimary }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({ type: 'phone', value: '', label: 'Personal' });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone size={18} />;
      case 'email': return <Mail size={18} />;
      case 'whatsapp': return <MessageSquare size={18} />;
      default: return <Phone size={18} />;
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-premium border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Contact Information</h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Manage multiple phone numbers and emails</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-primary/10 text-primary p-3 rounded-2xl hover:bg-primary/20 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {contacts.map((contact) => (
          <div key={contact.id} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                contact.type === 'phone' ? 'bg-blue-50 text-blue-600' :
                contact.type === 'email' ? 'bg-purple-50 text-purple-600' :
                'bg-emerald-50 text-emerald-600'
              }`}>
                {getTypeIcon(contact.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">{contact.value}</p>
                  {contact.isPrimary && (
                    <span className="bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star size={8} fill="currentColor" /> Primary
                    </span>
                  )}
                  {contact.isVerified ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : (
                    <AlertCircle size={14} className="text-warning" />
                  )}
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{contact.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!contact.isPrimary && (
                <button 
                  onClick={() => onSetPrimary(contact.id)}
                  className="p-2 text-slate-400 hover:text-primary transition-colors"
                  title="Set as Primary"
                >
                  <Star size={18} />
                </button>
              )}
              <button 
                onClick={() => onDelete(contact.id)}
                className="p-2 text-slate-400 hover:text-danger transition-colors"
                disabled={contact.isPrimary}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[110] bg-slate-950/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Add Contact</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['phone', 'email', 'whatsapp'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewContact({ ...newContact, type: t as any })}
                      className={`py-3 rounded-2xl text-xs font-bold capitalize transition-all ${
                        newContact.type === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Value</label>
                <input 
                  type="text"
                  value={newContact.value}
                  onChange={(e) => setNewContact({ ...newContact, value: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20"
                  placeholder={newContact.type === 'email' ? 'email@example.com' : '+91 XXXXX XXXXX'}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Label</label>
                <select 
                  value={newContact.label}
                  onChange={(e) => setNewContact({ ...newContact, label: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20"
                >
                  <option>Personal</option>
                  <option>Office</option>
                  <option>Emergency</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-4 rounded-2xl text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onAdd(newContact);
                    setIsAdding(false);
                  }}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors"
                >
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManager;

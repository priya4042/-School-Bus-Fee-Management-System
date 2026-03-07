
import React from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10 ring-1 ring-black/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-400 to-primary"></div>
        
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
          <div>
             <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{title}</h3>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Secure Action Required</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-danger transition-all active:scale-90"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;

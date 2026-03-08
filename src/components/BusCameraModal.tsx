import React from 'react';
import Modal from './Modal';
import { Camera, Video, Shield, AlertCircle } from 'lucide-react';

interface BusCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BusCameraModal: React.FC<BusCameraModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Live Bus Vision">
      <div className="p-8 space-y-8">
        <div className="bg-slate-950 rounded-[2.5rem] aspect-video relative overflow-hidden flex items-center justify-center group">
           <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Live • Stream 01</span>
           </div>
           
           <div className="text-center space-y-4 group-hover:scale-110 transition-transform duration-700">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 border border-white/10">
                 <Video size={32} />
              </div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Connecting to Encrypted Stream...</p>
           </div>
           
           <div className="absolute bottom-4 right-4 z-10">
              <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white/60 text-[8px] font-black uppercase tracking-widest">
                 AES-256 Secured
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                 <Shield size={20} />
              </div>
              <div>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Privacy Mode</p>
                 <p className="text-[10px] font-black text-slate-800 uppercase">Active • Only Parents</p>
              </div>
           </div>
           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
                 <AlertCircle size={20} />
              </div>
              <div>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Signal Strength</p>
                 <p className="text-[10px] font-black text-slate-800 uppercase">Excellent • 4G LTE</p>
              </div>
           </div>
        </div>
      </div>
    </Modal>
  );
};

export default BusCameraModal;

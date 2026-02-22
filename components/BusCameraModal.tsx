
import React from 'react';
import Modal from './Modal';

interface BusCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  busId?: string;
}

const BusCameraModal: React.FC<BusCameraModalProps> = ({ isOpen, onClose, busId = 'B101' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Live Fleet Surveillance">
      <div className="space-y-6">
        <div className="aspect-video bg-slate-900 rounded-3xl overflow-hidden relative group border-4 border-slate-800 shadow-2xl">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 animate-pulse">
              <i className="fas fa-video-slash text-white/20 text-3xl"></i>
            </div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-2">Signal Encrypted</h4>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest max-w-[200px]">
              Hardware handshake required for live stream
            </p>
          </div>
          
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-danger animate-pulse"></div>
            <span className="text-[9px] font-black text-white uppercase tracking-widest">Live: {busId}</span>
          </div>
        </div>

        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
          <h5 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fas fa-info-circle"></i>
            How to Connect
          </h5>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary font-black text-xs shadow-sm shrink-0">1</div>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
                Ensure the bus hardware is active. The camera system initializes automatically when the trip starts.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary font-black text-xs shadow-sm shrink-0">2</div>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
                Enter the <span className="text-primary">Fleet Security Token</span> in your profile settings to authorize the stream.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary font-black text-xs shadow-sm shrink-0">3</div>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
                Once authorized, the "Live Stream" button will activate a direct RTSP tunnel to the bus interior.
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/20"
        >
          Close Terminal
        </button>
      </div>
    </Modal>
  );
};

export default BusCameraModal;

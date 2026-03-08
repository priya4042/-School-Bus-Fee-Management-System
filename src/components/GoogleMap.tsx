import React from 'react';
import { MapPin, Navigation, Compass, Shield } from 'lucide-react';

interface GoogleMapProps {
  location: { lat: number; lng: number };
  busId?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ location, busId }) => {
  return (
    <div className="w-full h-full bg-slate-900 relative overflow-hidden flex items-center justify-center group">
       {/* Abstract Map Grid */}
       <div className="absolute inset-0 opacity-10 grid grid-cols-12 grid-rows-12 gap-px pointer-events-none">
          {Array.from({ length: 144 }).map((_, i) => (
             <div key={i} className="border border-white/20"></div>
          ))}
       </div>

       {/* Radial Pulse */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
       
       {/* Map UI Elements */}
       <div className="absolute top-6 right-6 z-20 space-y-4">
          <div className="bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-white flex items-center gap-4">
             <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center shadow-xl shadow-primary/20">
                <Navigation size={20} />
             </div>
             <div>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Telemetry Data</p>
                <p className="text-[10px] font-black uppercase tracking-tight">42 km/h • Heading NE</p>
             </div>
          </div>
          <div className="bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-white flex items-center gap-4">
             <div className="w-10 h-10 bg-white/5 text-white/40 rounded-xl flex items-center justify-center">
                <Compass size={20} />
             </div>
             <div>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Coordinates</p>
                <p className="text-[10px] font-black uppercase tracking-tight">{location.lat.toFixed(4)}N, {location.lng.toFixed(4)}E</p>
             </div>
          </div>
       </div>

       {/* Bus Marker */}
       <div className="relative z-10 transition-transform duration-1000 group-hover:scale-110">
          <div className="absolute -inset-10 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="w-16 h-16 bg-primary text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 border-4 border-white/10 relative">
             <i className="fas fa-bus text-2xl"></i>
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
          </div>
       </div>

       {/* Bottom Controls */}
       <div className="absolute bottom-6 left-6 z-20 flex items-center gap-4">
          <div className="bg-black/80 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 text-white flex items-center gap-4">
             <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-primary">
                <Shield size={16} />
             </div>
             <p className="text-[9px] font-black uppercase tracking-widest">Encrypted Satellite Feed</p>
          </div>
       </div>
    </div>
  );
};

export default GoogleMap;

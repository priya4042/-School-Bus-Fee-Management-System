import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Search, Navigation, Save, X } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet icon issue
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// @ts-ignore
L.Marker.prototype.options.icon = DefaultIcon;

interface BoardingLocationPickerProps {
  onSave: (data: any) => void;
  onClose: () => void;
  initialPosition?: [number, number];
}

const LocationMarker = ({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker 
      position={position} 
      // @ts-ignore
      draggable={true} 
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
        }
      }} 
    />
  );
};

const BoardingLocationPicker: React.FC<BoardingLocationPickerProps> = ({ onSave, onClose, initialPosition }) => {
  const [position, setPosition] = useState<[number, number]>(initialPosition || [32.2190, 76.3234]); // Default to Kangra/Dharamshala area
  const [address, setAddress] = useState('');
  const [locationName, setLocationName] = useState('Home');
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (!initialPosition) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, [initialPosition]);

  const handleSave = () => {
    onSave({
      location_name: locationName,
      address,
      latitude: position[0],
      longitude: position[1],
      landmark,
      special_instructions: instructions,
      is_primary: true
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-white flex flex-col md:flex-row animate-in fade-in duration-500">
      <div className="flex-1 relative h-[50vh] md:h-full bg-slate-100">
        {/* @ts-ignore */}
        <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }} className="z-0">
          <TileLayer
            // @ts-ignore
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            // @ts-ignore
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
        
        <div className="absolute top-6 left-6 right-6 z-[1000] flex gap-4">
          <div className="flex-1 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl flex items-center px-6 py-4 border border-white/20 ring-1 ring-black/5 transition-all focus-within:ring-primary/20 focus-within:scale-[1.02]">
            <Search size={20} className="text-slate-400 mr-4" />
            <input 
              type="text" 
              placeholder="Search for your address..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 placeholder:text-slate-400"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              navigator.geolocation.getCurrentPosition((pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
              });
            }}
            className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl text-primary hover:bg-white hover:scale-110 transition-all border border-white/20 ring-1 ring-black/5 active:scale-95"
          >
            <Navigation size={20} fill="currentColor" className="opacity-20" />
            <Navigation size={20} className="absolute inset-0 m-auto" />
          </button>
        </div>
      </div>

      <div className="w-full md:w-[450px] bg-white p-8 md:p-10 overflow-y-auto border-t md:border-t-0 md:border-l border-slate-100 shadow-2xl z-10 relative">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Boarding Point</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Set Pickup Location</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-danger transition-all active:scale-90">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
          <div className="group">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within:text-primary transition-colors">Location Label</label>
            <input 
              type="text" 
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary/10 focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-slate-300"
              placeholder="e.g. Home, Office, Grandma's"
            />
          </div>

          <div className="group">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within:text-primary transition-colors">Full Address</label>
            <textarea 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary/10 focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-slate-300 h-28 resize-none"
              placeholder="Enter complete address..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within:text-primary transition-colors">Landmark</label>
              <input 
                type="text" 
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary/10 focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-slate-300"
                placeholder="e.g. Near Park"
              />
            </div>
            <div className="group">
               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within:text-primary transition-colors">Instructions</label>
               <input 
                 type="text" 
                 value={instructions}
                 onChange={(e) => setInstructions(e.target.value)}
                 className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary/10 focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-slate-300"
                 placeholder="e.g. Ring bell"
               />
            </div>
          </div>

          <div className="pt-6 flex gap-4 border-t border-slate-50">
            <button 
              onClick={onClose}
              className="flex-1 py-5 rounded-2xl text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex-[2] bg-primary text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/30 hover:bg-primary-dark hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 active:translate-y-0"
            >
              <Save size={18} />
              Save Location
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BoardingLocationPicker;

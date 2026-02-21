import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, Search, Navigation, Save, X } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

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
    <Marker position={position} draggable={true} eventHandlers={{
      dragend: (e) => {
        const marker = e.target;
        const pos = marker.getLatLng();
        setPosition([pos.lat, pos.lng]);
      }
    }} />
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

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col md:flex-row">
      <div className="flex-1 relative h-[50vh] md:h-full">
        <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
        
        <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2">
          <div className="flex-1 bg-white rounded-2xl shadow-premium flex items-center px-4 py-3 border border-slate-100">
            <Search size={20} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search for your address..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
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
            className="bg-white p-3 rounded-2xl shadow-premium text-primary hover:bg-slate-50 border border-slate-100"
          >
            <Navigation size={20} />
          </button>
        </div>
      </div>

      <div className="w-full md:w-[400px] bg-white p-6 md:p-8 overflow-y-auto border-t md:border-t-0 md:border-l border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Boarding Point</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Location Label</label>
            <input 
              type="text" 
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Home, Office, Grandma's"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Full Address</label>
            <textarea 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 h-24 resize-none"
              placeholder="Enter complete address..."
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Nearby Landmark</label>
            <input 
              type="text" 
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Near City Park"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Special Instructions</label>
            <textarea 
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 h-24 resize-none"
              placeholder="e.g. Ring doorbell twice, wait at the gate..."
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardingLocationPicker;

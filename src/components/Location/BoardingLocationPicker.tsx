import React from 'react';

interface BoardingLocationPickerProps {
  onSave: (data: any) => void;
  onClose: () => void;
}

const BoardingLocationPicker: React.FC<BoardingLocationPickerProps> = ({ onSave, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full">
        <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-widest">Boarding Location</h2>
        <div className="h-64 bg-slate-100 rounded-2xl flex items-center justify-center">Map Placeholder</div>
        <div className="flex gap-4 mt-6">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest">Cancel</button>
          <button onClick={() => onSave({})} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest">Save</button>
        </div>
      </div>
    </div>
  );
};

export default BoardingLocationPicker;

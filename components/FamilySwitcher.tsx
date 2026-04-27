import React, { useEffect, useState, useRef } from 'react';
import { useFamilyStore } from '../store/familyStore';

interface FamilySwitcherProps {
  parentId: string;
}

const FamilySwitcher: React.FC<FamilySwitcherProps> = ({ parentId }) => {
  const { children, selectedChildId, loadFamily, selectChild } = useFamilyStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parentId) loadFamily(parentId);
  }, [parentId, loadFamily]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  if (!children || children.length === 0) return null;

  const current = children.find((c) => c.id === selectedChildId) || children[0];
  const initials = String(current?.full_name || '?').charAt(0).toUpperCase();

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 md:gap-3 px-2.5 md:px-3 py-1.5 md:py-2 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 active:scale-95 transition-all"
        title="Switch child"
      >
        <span className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-primary text-white text-xs font-black flex items-center justify-center">
          {initials}
        </span>
        <span className="hidden sm:flex flex-col items-start leading-none min-w-0">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Viewing</span>
          <span className="text-[11px] font-black text-slate-800 truncate max-w-[100px]">
            {current?.full_name?.split(' ')[0] || 'Child'}
          </span>
        </span>
        <i className={`fas fa-chevron-down text-[9px] text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}></i>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[1100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Your Family</p>
          </div>
          <div className="max-h-[320px] overflow-y-auto scrollbar-hide">
            {children.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  selectChild(c.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors active:scale-[0.98] ${
                  c.id === selectedChildId ? 'bg-primary/5' : 'hover:bg-slate-50'
                }`}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  c.id === selectedChildId ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {String(c.full_name || '?').charAt(0).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-black tracking-tight truncate ${
                    c.id === selectedChildId ? 'text-primary' : 'text-slate-800'
                  }`}>
                    {c.full_name}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                    {c.admission_number ? `Adm ${c.admission_number}` : ''}
                    {c.grade && c.section ? ` · ${c.grade}-${c.section}` : ''}
                  </p>
                </div>
                {c.id === selectedChildId && (
                  <i className="fas fa-check text-primary text-xs flex-shrink-0"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilySwitcher;

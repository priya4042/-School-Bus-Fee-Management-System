import React, { useEffect, useRef, useState } from 'react';

interface LegalLinkItem {
  href: string;
  label: string;
  icon: string;
  /** True if link should appear in the native app build too. Marketing links are web-only. */
  native?: boolean;
}

const LINKS: LegalLinkItem[] = [
  { href: '/about', label: 'About Us', icon: 'fa-circle-info' },
  { href: '/services', label: 'Services', icon: 'fa-bus-simple' },
  { href: '/contact-us', label: 'Contact', icon: 'fa-envelope' },
  { href: '/privacy-policy', label: 'Privacy', icon: 'fa-lock', native: true },
  { href: '/terms-of-service', label: 'Terms', icon: 'fa-file-contract', native: true },
  { href: '/refund-policy', label: 'Refund', icon: 'fa-rotate-left', native: true },
  { href: '/shipping-policy', label: 'Shipping', icon: 'fa-truck' },
];

interface LegalLinksProps {
  className?: string;
}

const LegalLinks: React.FC<LegalLinksProps> = ({ className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
          open
            ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <i className="fas fa-shield-halved text-[11px]"></i>
        <span>Legal &amp; Info</span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-[9px] transition-transform`}></i>
      </button>

      {open && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-2xl border border-slate-100 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50"
          role="menu"
        >
          <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/60 flex items-center justify-between">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">More Information</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-xs"
              aria-label="Close menu"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="p-2 grid grid-cols-2 gap-1">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-primary/5 active:bg-primary/10 active:scale-95 transition-all group ${link.native ? '' : 'web-only'}`}
                role="menuitem"
              >
                <span className="w-7 h-7 rounded-lg bg-slate-50 group-hover:bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <i className={`fas ${link.icon} text-[10px]`}></i>
                </span>
                <span className="text-[10px] font-black text-slate-700 group-hover:text-primary uppercase tracking-widest truncate">
                  {link.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalLinks;

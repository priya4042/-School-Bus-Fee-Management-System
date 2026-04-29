import React from 'react';
import { useLanguage } from '../../lib/i18n';

interface LegalLinkItem {
  href: string;
  labelKey: string;
  fallback: string;
  icon: string;
  /** True if link should appear in the native app build too. Marketing links are web-only. */
  native?: boolean;
}

const LINKS: LegalLinkItem[] = [
  { href: '/about', labelKey: 'about_us', fallback: 'About', icon: 'fa-circle-info' },
  { href: '/services', labelKey: 'services', fallback: 'Services', icon: 'fa-bus-simple' },
  { href: '/contact-us', labelKey: 'contact', fallback: 'Contact', icon: 'fa-envelope' },
  { href: '/privacy-policy', labelKey: 'privacy_policy', fallback: 'Privacy', icon: 'fa-lock', native: true },
  { href: '/terms-of-service', labelKey: 'terms_of_service', fallback: 'Terms', icon: 'fa-file-contract', native: true },
  { href: '/refund-policy', labelKey: 'refund', fallback: 'Refund', icon: 'fa-rotate-left', native: true },
  { href: '/shipping-policy', labelKey: 'shipping', fallback: 'Shipping', icon: 'fa-truck' },
];

interface LegalLinksProps {
  className?: string;
}

const LegalLinks: React.FC<LegalLinksProps> = ({ className = '' }) => {
  const { t } = useLanguage();

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-px bg-slate-100"></div>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
          {t('legal_and_info') === 'legal_and_info' ? 'Legal & Info' : t('legal_and_info')}
        </p>
        <div className="flex-1 h-px bg-slate-100"></div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {LINKS.map((link) => {
          const label = t(link.labelKey) === link.labelKey ? link.fallback : t(link.labelKey);
          return (
            <a
              key={link.href}
              href={link.href}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-primary/5 hover:text-primary hover:border-primary/20 active:scale-95 transition-all ${link.native ? '' : 'web-only'}`}
            >
              <i className={`fas ${link.icon} text-[8px] text-primary`}></i>
              <span>{label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default LegalLinks;

import React from 'react';

/**
 * PageShell — the single layout primitive every parent + admin page should use.
 *
 * What it owns (so individual pages don't):
 *  - Max-width + horizontal padding (consistent on phone, tablet, desktop)
 *  - Page title + subtitle slot, with consistent typography
 *  - Right-side action slot (e.g., "Add Student" button)
 *  - Sticky footer slot — the holy grail for mobile forms.
 *    Whatever is passed in `stickyFooter` floats above the bottom nav and
 *    safe-area on phone, becomes a normal block on desktop.
 *  - Vertical rhythm between header and content (space-y-4 md:space-y-6)
 *  - Consistent animate-in entrance
 *
 * Tokens used:
 *  - Page title:  text-xl md:text-3xl font-black tracking-tight
 *  - Subtitle:    text-[9px] md:text-[10px] font-bold uppercase tracking-widest
 *  - Card style:  see PageShell.Card export below for shared card styling.
 */

export interface PageShellProps {
  /** Page title — appears as h1. */
  title?: React.ReactNode;
  /** Optional caption under the title. */
  subtitle?: React.ReactNode;
  /** Right-side action slot in the header row (button, pill bar, etc.). */
  action?: React.ReactNode;
  /**
   * Sticky footer rendered ABOVE the bottom nav on mobile. Use for primary
   * Save / Submit actions so they're never hidden by the nav.
   */
  stickyFooter?: React.ReactNode;
  /** Override the default max-w-7xl container. */
  maxWidthClass?: string;
  /** Extra classes on the outermost wrapper. */
  className?: string;
  /** Hide the default header block (when the page builds its own). */
  hideHeader?: boolean;
  children: React.ReactNode;
}

const PageShell: React.FC<PageShellProps> = ({
  title,
  subtitle,
  action,
  stickyFooter,
  maxWidthClass = 'max-w-7xl',
  className = '',
  hideHeader = false,
  children,
}) => {
  return (
    <div className={`${maxWidthClass} mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}>
      {!hideHeader && (title || subtitle || action) && (
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 md:gap-6">
          <div className="min-w-0">
            {title && (
              <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="flex flex-wrap gap-2 md:gap-3 md:items-center md:flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      )}

      {children}

      {stickyFooter && (
        <div
          className="sticky md:static md:mt-2 -mx-3 md:mx-0 px-3 md:px-0 py-3 md:py-0 bg-white md:bg-transparent border-t md:border-0 border-slate-100 z-10"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }}
        >
          {stickyFooter}
        </div>
      )}
    </div>
  );
};

export default PageShell;

/**
 * PageShell.Card — shared card primitive so every list/form card looks the same.
 * Uses the standard radius + padding tokens.
 */
export interface PageCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Compact (smaller padding) or default. */
  size?: 'compact' | 'default';
  /** Optional inner padding override (matches Tailwind p-* class). */
  paddingClass?: string;
}

export const PageCard: React.FC<PageCardProps> = ({ size = 'default', paddingClass, className = '', children, ...rest }) => {
  const pad = paddingClass || (size === 'compact' ? 'p-3 md:p-6' : 'p-4 md:p-8');
  return (
    <div
      className={`bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm ${pad} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

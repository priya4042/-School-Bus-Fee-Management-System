import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'busway_onboarding_seen_v1';

interface Slide {
  emoji: string;
  title: string;
  body: string;
  bg: string;
}

const PARENT_SLIDES: Slide[] = [
  {
    emoji: '🚌',
    title: 'Track every fee in one place',
    body: 'See unpaid months, set up reminders, and pay directly from your UPI app — no extra fees, no gateway redirects.',
    bg: 'from-blue-500 to-indigo-600',
  },
  {
    emoji: '👨‍👩‍👧',
    title: 'Manage all your children together',
    body: 'Add multiple children to one account. Pay for everyone in a single tap with sibling and annual pre-pay discounts applied automatically.',
    bg: 'from-emerald-500 to-teal-600',
  },
  {
    emoji: '🚨',
    title: 'Stay in touch with admin',
    body: 'Mark child absent, request a one-time pickup change, see live bus status, or trigger an emergency alert — all from the dashboard.',
    bg: 'from-red-500 to-rose-600',
  },
];

const ADMIN_SLIDES: Slide[] = [
  {
    emoji: '📊',
    title: 'See real profit at a glance',
    body: 'Log fuel and maintenance expenses; the dashboard subtracts them from revenue so you finally know what each bus actually earns.',
    bg: 'from-blue-500 to-indigo-600',
  },
  {
    emoji: '💸',
    title: 'Collect fees the way you want',
    body: 'Parents pay via UPI directly, or you record offline cash receipts. Either way, parents get a verified digital receipt instantly.',
    bg: 'from-emerald-500 to-teal-600',
  },
  {
    emoji: '🚌',
    title: 'Push live bus status to all parents',
    body: 'One tap on a bus row sends "On the way / Delayed / Cancelled" to every parent on that bus. Stops the daily WhatsApp barrage.',
    bg: 'from-amber-500 to-orange-600',
  },
];

interface OnboardingTutorialProps {
  role: 'admin' | 'parent';
  /** When true, force-shows even if previously dismissed (useful from a Help menu). */
  force?: boolean;
  onClose?: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ role, force, onClose }) => {
  const slides = role === 'admin' ? ADMIN_SLIDES : PARENT_SLIDES;
  const [show, setShow] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (force) { setShow(true); return; }
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // Show after a tiny delay so the dashboard has time to render once
        const t = setTimeout(() => setShow(true), 800);
        return () => clearTimeout(t);
      }
    } catch { /* ignore */ }
  }, [force]);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setShow(false);
    onClose?.();
  };

  if (!show) return null;
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <div
      className="fixed inset-0 z-[2500] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Hero band */}
        <div className={`bg-gradient-to-br ${slide.bg} text-white p-8 text-center`}>
          <div className="text-7xl mb-2">{slide.emoji}</div>
          <p className="text-[9px] font-black uppercase tracking-widest opacity-80">
            Step {index + 1} of {slides.length}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight text-center">{slide.title}</h2>
          <p className="text-sm font-medium text-slate-600 leading-relaxed text-center">{slide.body}</p>

          {/* Pagination dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to step ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-primary' : 'w-2 bg-slate-200'}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {!isLast && (
              <button
                onClick={dismiss}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
              >
                Skip
              </button>
            )}
            <button
              onClick={() => (isLast ? dismiss() : setIndex(index + 1))}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:bg-blue-800 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isLast ? <><i className="fas fa-rocket"></i> Get Started</> : <>Next <i className="fas fa-arrow-right"></i></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;

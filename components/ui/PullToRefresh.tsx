import React, { useEffect, useRef, useState } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 70,
  disabled = false,
}) => {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const onTouchStart = (e: TouchEvent) => {
      if (refreshing) return;
      // Only initiate pull when scrolled to the very top
      if (window.scrollY > 0) {
        startY.current = null;
        return;
      }
      startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (refreshing || startY.current == null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) {
        setPull(0);
        return;
      }
      // Apply rubber-band damping
      const damped = Math.min(threshold * 1.4, delta * 0.45);
      setPull(damped);
    };

    const onTouchEnd = async () => {
      if (refreshing || startY.current == null) return;
      const triggered = pull >= threshold;
      startY.current = null;
      if (triggered) {
        setRefreshing(true);
        setPull(threshold);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
          setPull(0);
        }
      } else {
        setPull(0);
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [pull, refreshing, threshold, disabled, onRefresh]);

  const ready = pull >= threshold;
  const progress = Math.min(1, pull / threshold);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all"
        style={{ height: pull, opacity: progress }}
        aria-hidden="true"
      >
        <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
          <i
            className={`fas fa-arrow-down transition-transform duration-200 ${ready ? 'rotate-180' : ''} ${refreshing ? 'fa-circle-notch fa-spin' : ''}`}
          ></i>
          <span>{refreshing ? 'Refreshing...' : ready ? 'Release to refresh' : 'Pull to refresh'}</span>
        </div>
      </div>
      <div
        style={{ transform: pull ? `translateY(${pull * 0.2}px)` : undefined, transition: pull ? 'none' : 'transform 200ms ease' }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;

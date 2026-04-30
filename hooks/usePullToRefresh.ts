import { useEffect, useRef, useState } from 'react';

/**
 * Pull-to-refresh — the gesture every Indian banking + delivery app uses.
 *
 * Wire-up:
 *   const ref = useRef<HTMLDivElement>(null);
 *   const { refreshing, indicatorOffset } = usePullToRefresh(ref, async () => {
 *     await fetchLatest();
 *   });
 *
 * The ref must point at a scrollable container. The hook listens for a
 * touchstart at scrollTop===0, then a touchmove that pulls down at least
 * THRESHOLD pixels, then on touchend invokes onRefresh. While onRefresh
 * is running, `refreshing` is true so the page can show a spinner.
 *
 * Pure DOM — no native plugin, works on every Capacitor app and the web.
 */

const PULL_THRESHOLD = 70;
const MAX_PULL = 110;

export const usePullToRefresh = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  onRefresh: () => Promise<void> | void,
) => {
  const [refreshing, setRefreshing] = useState(false);
  const [indicatorOffset, setIndicatorOffset] = useState(0);
  const startYRef = useRef<number | null>(null);
  const pullingRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (refreshing) return;
      if (el.scrollTop > 0) return;
      startYRef.current = e.touches[0]?.clientY ?? null;
      pullingRef.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current || startYRef.current == null) return;
      const dy = (e.touches[0]?.clientY ?? 0) - startYRef.current;
      if (dy <= 0) {
        setIndicatorOffset(0);
        return;
      }
      // Resistance curve — pulls feel stretchier the further you go
      const eased = Math.min(MAX_PULL, dy * 0.5);
      setIndicatorOffset(eased);
    };

    const handleTouchEnd = async () => {
      if (!pullingRef.current) return;
      const offset = indicatorOffset;
      pullingRef.current = false;
      startYRef.current = null;

      if (offset >= PULL_THRESHOLD) {
        setRefreshing(true);
        setIndicatorOffset(PULL_THRESHOLD);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
          setIndicatorOffset(0);
        }
      } else {
        setIndicatorOffset(0);
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [containerRef, onRefresh, refreshing, indicatorOffset]);

  return {
    refreshing,
    indicatorOffset,
    /** Spread on the indicator <div> for the standard rotating-arrow visual. */
    indicatorStyle: {
      transform: `translateY(${indicatorOffset}px)`,
      opacity: Math.min(1, indicatorOffset / PULL_THRESHOLD),
    },
    /** True when the user has pulled past the trigger threshold (visual cue to flip the arrow). */
    isReady: indicatorOffset >= PULL_THRESHOLD,
  };
};

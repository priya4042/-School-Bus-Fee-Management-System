import { useEffect } from 'react';

let openCount = 0;
let savedOverflow: string | null = null;
let savedTouchAction: string | null = null;

const lock = () => {
  if (typeof document === 'undefined') return;
  if (openCount === 0) {
    savedOverflow = document.body.style.overflow;
    savedTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }
  openCount += 1;
};

const unlock = () => {
  if (typeof document === 'undefined') return;
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0) {
    document.body.style.overflow = savedOverflow ?? '';
    document.body.style.touchAction = savedTouchAction ?? '';
    savedOverflow = null;
    savedTouchAction = null;
  }
};

/**
 * Locks <body> scroll while `active` is true. Multiple instances stack — the
 * lock is only released when every active caller has released.
 */
export const useBodyScrollLock = (active: boolean) => {
  useEffect(() => {
    if (!active) return;
    lock();
    return () => unlock();
  }, [active]);
};

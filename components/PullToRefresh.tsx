import React, { useRef } from 'react';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

interface Props {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Drop-in pull-to-refresh wrapper for any list page.
 * Wraps children in a scrollable div and shows a spring-loaded
 * arrow → spinner indicator that follows the finger.
 */
const PullToRefresh: React.FC<Props> = ({ onRefresh, children, className }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { refreshing, indicatorStyle, isReady } = usePullToRefresh(ref, onRefresh);

  return (
    <div ref={ref} className={`relative ${className || ''}`}>
      <div
        style={indicatorStyle}
        className="absolute left-0 right-0 -top-12 flex justify-center pointer-events-none"
      >
        <div className="w-10 h-10 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-primary">
          {refreshing ? (
            <i className="fas fa-circle-notch fa-spin text-sm"></i>
          ) : (
            <i className={`fas fa-arrow-down text-sm transition-transform ${isReady ? 'rotate-180' : ''}`}></i>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

export default PullToRefresh;

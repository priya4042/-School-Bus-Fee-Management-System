import React, { useState } from 'react';

interface CollapsibleListProps {
  children: React.ReactNode[];
  initialCount?: number;
  showMoreLabel?: string;
  showLessLabel?: string;
  className?: string;
}

/**
 * Renders the first `initialCount` children eagerly and gates the rest
 * behind a "Show more" toggle. Mirrors the dropdown style used for
 * "Future Scheduled" so notifications and attendance lists stay short.
 */
export const CollapsibleList: React.FC<CollapsibleListProps> = ({
  children,
  initialCount = 5,
  showMoreLabel,
  showLessLabel = 'Show less',
  className = '',
}) => {
  const [expanded, setExpanded] = useState(false);
  const items = React.Children.toArray(children);
  const total = items.length;
  const hidden = Math.max(0, total - initialCount);
  const visible = expanded ? items : items.slice(0, initialCount);

  return (
    <div className={className}>
      {visible}
      {hidden > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full mt-3 md:mt-4 py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-[0.98] border border-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        >
          <i className={`fas fa-chevron-${expanded ? 'up' : 'down'} text-[9px]`}></i>
          <span>
            {expanded
              ? showLessLabel
              : `${showMoreLabel || 'Show'} ${hidden} more`}
          </span>
        </button>
      )}
    </div>
  );
};

export default CollapsibleList;

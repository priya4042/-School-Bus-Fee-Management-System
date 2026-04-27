import React, { useEffect } from 'react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface ReceiptViewerProps {
  isOpen: boolean;
  pdfUrl: string | null;
  loading?: boolean;
  title?: string;
  onClose: () => void;
  onDownload?: () => void;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  isOpen,
  pdfUrl,
  loading,
  title = 'Receipt Preview',
  onClose,
  onDownload,
}) => {
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Revoke object URL when modal closes
  useEffect(() => {
    if (!isOpen && pdfUrl && pdfUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(pdfUrl);
      } catch {
      }
    }
  }, [isOpen, pdfUrl]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[3000] bg-slate-900/90 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full h-[92vh] md:h-[88vh] md:max-w-3xl bg-white rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 md:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag indicator */}
        <div className="md:hidden pt-2 pb-1 flex justify-center">
          <span className="w-12 h-1 rounded-full bg-slate-200"></span>
        </div>

        {/* Header */}
        <div className="px-5 md:px-8 py-3 md:py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">In-App Preview</p>
            <p className="text-sm md:text-base font-black text-slate-900 truncate">{title}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onDownload && (
              <button
                onClick={onDownload}
                className="px-3 md:px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
                title="Download"
              >
                <i className="fas fa-download"></i>
                <span className="hidden md:inline">Save</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center active:scale-95 transition-all"
              title="Close"
              aria-label="Close"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>

        {/* PDF surface */}
        <div className="flex-1 bg-slate-100 relative">
          {loading || !pdfUrl ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generating receipt...</p>
            </div>
          ) : (
            <iframe
              src={pdfUrl}
              title={title}
              className="w-full h-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewer;

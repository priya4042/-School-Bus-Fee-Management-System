
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClass?: string;
  bodyClassName?: string;
}

// Track how many modals are stacked open so the last-closed one restores scroll
let openModalCount = 0;
let savedBodyOverflow: string | null = null;

const lockBodyScroll = () => {
  if (typeof document === 'undefined') return;
  if (openModalCount === 0) {
    savedBodyOverflow = document.body.style.overflow || '';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }
  openModalCount += 1;
};

const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return;
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount === 0) {
    document.body.style.overflow = savedBodyOverflow ?? '';
    document.body.style.touchAction = '';
    savedBodyOverflow = null;
  }
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidthClass = 'max-w-lg', bodyClassName = 'p-6' }) => {
  useEffect(() => {
    if (!isOpen) return;
    lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      unlockBodyScroll();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/60 backdrop-blur-sm overscroll-contain"
      onClick={onClose}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex min-h-full items-center justify-center px-3 py-6 sm:px-4 md:py-12">
        <div
          className={`bg-white rounded-2xl w-full ${maxWidthClass} shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[calc(100dvh-3rem)] sm:max-h-[calc(100dvh-6rem)] overflow-hidden flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 p-4 md:p-6 border-b border-slate-100 shrink-0">
            <h3 className="text-base md:text-xl font-bold text-slate-800 truncate">{title}</h3>
            <button
              onClick={onClose}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 active:scale-95 transition-all flex-shrink-0"
              aria-label="Close"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className={`${bodyClassName} overflow-y-auto overscroll-contain flex-1`}>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;

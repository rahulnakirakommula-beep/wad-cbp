import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const modalWidths = {
  standard: 'max-w-[560px]',
  alert: 'max-w-[400px]',
  wide: 'max-w-[840px]'
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  variant = 'standard',
  isDirty = false,
  className = ''
}) {
  const modalRef = useRef(null);

  // Focus trap and block scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements?.length > 0) {
        focusableElements[0].focus();
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div
        ref={modalRef}
        className={`
          relative w-full bg-white shadow-2xl overflow-hidden flex flex-col
          sm:rounded-2xl sm:animate-in sm:zoom-in-95 sm:fade-in sm:duration-200
          max-sm:rounded-t-2xl max-sm:animate-in max-sm:slide-in-from-bottom duration-300
          ${modalWidths[variant] || modalWidths.standard}
          ${className}
        `}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-black text-primary-navy">{title}</h3>
            {isDirty && <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tighter"> Unsaved changes</span>}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto max-h-[60vh] p-6 custom-scrollbar text-slate-600 leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

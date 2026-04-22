import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const TOAST_TYPES = {
  success: {
    color: 'border-emerald-500',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    duration: 4000
  },
  error: {
    color: 'border-red-500',
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    duration: null // Manual dismiss
  },
  warning: {
    color: 'border-amber-500',
    icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    duration: 6000
  },
  info: {
    color: 'border-blue-500',
    icon: <Info className="w-5 h-5 text-blue-500" />,
    duration: 5000
  }
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts((prev) => {
      const newToast = {
        ...toast,
        id: Date.now(),
        type: toast.type || 'info',
        createdAt: Date.now()
      };
      // Limit to 3 toasts, oldest removed first (Section 2.6)
      const updated = [newToast, ...prev].slice(0, 3);
      return updated;
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastRegion toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastRegion({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none md:bottom-24">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const config = TOAST_TYPES[toast.type];
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!config.duration || isPaused) return;

    const timer = setTimeout(() => {
      onRemove();
    }, config.duration);

    return () => clearTimeout(timer);
  }, [isPaused, config.duration, onRemove]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto flex items-start gap-4 p-4 bg-white shadow-xl border-l-[4px] rounded-r-xl transition-all duration-300 animate-in slide-in-from-right fade-in ${config.color}`}
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-grow">
        <h4 className="text-sm font-bold text-slate-900 leading-tight">{toast.title}</h4>
        {toast.body && <p className="text-sm text-slate-500 mt-1">{toast.body}</p>}
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

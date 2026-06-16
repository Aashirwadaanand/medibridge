import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastContextType {
  showToast: (title: string, message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (title: string, message: string, type: Toast['type'] = 'info') => {
    const newToast: Toast = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title,
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Listen to global 'medibridge-toast' custom events
  useEffect(() => {
    const handleGlobalToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { title, message, type } = customEvent.detail;
        showToast(title, message, type);
      }
    };

    window.addEventListener('medibridge-toast', handleGlobalToast);
    return () => {
      window.removeEventListener('medibridge-toast', handleGlobalToast);
    };
  }, []);

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-450 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-450 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  const getToastBorder = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-500/[0.02] shadow-glow-emerald';
      case 'error':
        return 'border-rose-500/25 bg-rose-500/[0.02] shadow-glow-rose';
      case 'warning':
        return 'border-amber-500/20 bg-amber-500/[0.02] shadow-glow-amber';
      default:
        return 'border-cyan-500/20 bg-cyan-500/[0.02] shadow-glow-cyan';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <React.Fragment key={toast.id}>
              <ToastItem toast={toast} onDismiss={() => removeToast(toast.id)} />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                layout
                className={`p-4 rounded-2xl glass-panel border flex items-start gap-3 pointer-events-auto ${getToastBorder(toast.type)}`}
              >
                {getToastIcon(toast.type)}
                
                <div className="flex-1 min-w-0 font-sans">
                  <h4 className="text-xs font-bold text-slate-200">{toast.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{toast.message}</p>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Hook auto-dismiss logic
export const ToastItem: React.FC<{ toast: Toast; onDismiss: () => void }> = ({ toast: _toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  return null;
};

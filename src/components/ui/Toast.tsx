import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[], removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: 9999,
    pointerEvents: 'none'
  };

  return (
    <div style={containerStyle}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast, onRemove: () => void }> = ({ toast, onRemove }) => {
  const getColors = () => {
    switch (toast.type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info':
      default: return '#2563eb';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle color={getColors()} size={20} />;
      case 'error': return <XCircle color={getColors()} size={20} />;
      case 'warning': return <AlertTriangle color={getColors()} size={20} />;
      case 'info':
      default: return <Info color={getColors()} size={20} />;
    }
  };

  const toastStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderLeft: `4px solid ${getColors()}`,
    borderRadius: '12px',
    minWidth: '300px',
    maxWidth: '400px',
    fontFamily: "'Inter', sans-serif",
    pointerEvents: 'auto',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  };

  const messageStyle: React.CSSProperties = {
    color: '#f0f0f5',
    fontSize: '0.875rem',
    flex: 1,
    margin: 0
  };

  const closeBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      style={toastStyle}
    >
      {getIcon()}
      <p style={messageStyle}>{toast.message}</p>
      <button style={closeBtnStyle} onClick={onRemove} aria-label="Close toast">
        <X size={16} />
      </button>
    </motion.div>
  );
};

'use client';

import { useEffect } from 'react';

interface SnackbarProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
  onClose: () => void;
  autoHideDuration?: number;
}

export default function Snackbar({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 3000
}: SnackbarProps) {
  useEffect(() => {
    if (open && autoHideDuration > 0) {
      const timer = setTimeout(onClose, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

  const styles = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600'
  }[severity];

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`${styles} text-white px-6 py-3 rounded-lg shadow-lg border-l-4 min-w-80 flex items-center justify-between`}>
        <div className="flex items-center">
          {severity === 'success' && <span className="mr-2">✅</span>}
          {severity === 'error' && <span className="mr-2">❌</span>}
          <span className="font-medium">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
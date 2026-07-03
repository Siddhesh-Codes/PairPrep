'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import styles from './Toast.module.css';

/* ─── Types ─── */

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration: number;
  exiting?: boolean;
}

interface ToastContextValue {
  toast: (opts: { variant?: ToastVariant; title: string; message?: string; duration?: number }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ICONS: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 5;

/* ─── Context ─── */

const ToastContext = createContext<ToastContextValue | null>(null);

/* ─── Provider + Renderer ─── */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    // Mark as exiting for animation
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));

    // Remove after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);

    // Clear the auto-dismiss timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({
      variant = 'info',
      title,
      message,
      duration = DEFAULT_DURATION,
    }: {
      variant?: ToastVariant;
      title: string;
      message?: string;
      duration?: number;
    }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const item: ToastItem = { id, variant, title, message, duration };

      setToasts((prev) => {
        const next = [...prev, item];
        // Evict oldest if over limit
        if (next.length > MAX_TOASTS) {
          const evicted = next[0];
          // cleanup evicted timer
          const timer = timersRef.current.get(evicted.id);
          if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(evicted.id);
          }
          return next.slice(1);
        }
        return next;
      });

      // Auto-dismiss
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }
    },
    [dismiss],
  );

  const success = useCallback(
    (title: string, message?: string) => toast({ variant: 'success', title, message }),
    [toast],
  );
  const error = useCallback(
    (title: string, message?: string) => toast({ variant: 'error', title, message, duration: 6000 }),
    [toast],
  );
  const info = useCallback(
    (title: string, message?: string) => toast({ variant: 'info', title, message }),
    [toast],
  );
  const warning = useCallback(
    (title: string, message?: string) => toast({ variant: 'warning', title, message, duration: 5000 }),
    [toast],
  );

  const contextValue: ToastContextValue = { toast, success, error, info, warning };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Portal */}
      {toasts.length > 0 && (
        <div className={styles.toastContainer} aria-live="polite" aria-label="Notifications">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={[
                styles.toast,
                styles[`toast--${t.variant}`],
                t.exiting ? styles['toast--exiting'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
              role="status"
            >
              <span className={styles.toastIcon} aria-hidden="true">
                {ICONS[t.variant]}
              </span>
              <div className={styles.toastBody}>
                <div className={styles.toastTitle}>{t.title}</div>
                {t.message && <div className={styles.toastMessage}>{t.message}</div>}
              </div>
              <button
                className={styles.toastDismiss}
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

/* ─── Hook ─── */

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

import React, { useEffect } from 'react';

/** Props for transient Toast notification banner. */
export interface ToastProps {
  readonly message: string | null;
  readonly onDismiss: () => void;
  readonly durationMs?: number;
  readonly dismissLabel?: string;
}

/** Non-intrusive notification toast announcing transient actions and status updates. */
export function Toast({
  message,
  onDismiss,
  durationMs = 3500,
  dismissLabel = 'Dismiss notification',
}: ToastProps): React.JSX.Element | null {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [message, onDismiss, durationMs]);

  if (!message) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl dark:border-slate-600 dark:bg-slate-800"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={dismissLabel}
        className="rounded p-1 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        ✕
      </button>
    </aside>
  );
}

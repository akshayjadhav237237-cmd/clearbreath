import type { JSX, ReactNode } from 'react';

/** Allowed visual severity variants for the Badge component. */
export type BadgeSeverity =
  | 'good'
  | 'satisfactory'
  | 'moderate'
  | 'poor'
  | 'veryPoor'
  | 'severe'
  | 'info'
  | 'success'
  | 'neutral';

/** Props for the status and severity indicator Badge component. */
export interface BadgeProps {
  readonly children: ReactNode;
  readonly severity?: BadgeSeverity;
  readonly size?: 'sm' | 'md';
}

const SEVERITY_CLASSES: Record<BadgeSeverity, string> = {
  good: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
  satisfactory:
    'bg-lime-100 text-lime-950 border-lime-300 dark:bg-lime-950 dark:text-lime-100 dark:border-lime-700',
  moderate:
    'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-700',
  poor: 'bg-orange-100 text-orange-950 border-orange-300 dark:bg-orange-950 dark:text-orange-100 dark:border-orange-700',
  veryPoor:
    'bg-rose-100 text-rose-950 border-rose-300 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-700',
  severe:
    'bg-purple-100 text-purple-950 border-purple-300 dark:bg-purple-950 dark:text-purple-100 dark:border-purple-700',
  info: 'bg-sky-100 text-sky-950 border-sky-300 dark:bg-sky-950 dark:text-sky-100 dark:border-sky-700',
  success:
    'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
  neutral:
    'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
};

/** Accessible color-coded badge rendering categorical severity and operational statuses. */
export function Badge({
  children,
  severity = 'neutral',
  size = 'sm',
}: BadgeProps): JSX.Element {
  const sizeClass =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm font-semibold';
  const colorClass = SEVERITY_CLASSES[severity];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${colorClass}`}
    >
      {children}
    </span>
  );
}

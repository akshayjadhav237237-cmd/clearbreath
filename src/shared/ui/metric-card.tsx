import type { JSX } from 'react';

/** Props for statistical and numerical MetricCard display components. */
export interface MetricCardProps {
  readonly label: string;
  readonly value: string | number;
  readonly unit?: string;
  readonly delta?: string;
  readonly deltaType?: 'positive' | 'negative' | 'neutral';
  readonly tooltip?: string;
}

const DELTA_COLORS: Record<'positive' | 'negative' | 'neutral', string> = {
  positive: 'text-emerald-700 dark:text-emerald-300',
  negative: 'text-rose-700 dark:text-rose-300',
  neutral: 'text-slate-600 dark:text-slate-400',
};

/** Formatted numerical card presenting key air quality, health risk, or economic indicators. */
export function MetricCard({
  label,
  value,
  unit,
  delta,
  deltaType = 'neutral',
  tooltip,
}: MetricCardProps): JSX.Element {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
        <h3>{label}</h3>
        {tooltip ? (
          <span
            role="img"
            className="cursor-help text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            title={tooltip}
            aria-label={tooltip}
          >
            ⓘ
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {value}
        </span>
        {unit ? (
          <span className="text-xs text-slate-700 dark:text-slate-300">
            {unit}
          </span>
        ) : null}
      </div>
      {delta ? (
        <p className={`mt-1 text-xs font-medium ${DELTA_COLORS[deltaType]}`}>
          {delta}
        </p>
      ) : null}
    </article>
  );
}

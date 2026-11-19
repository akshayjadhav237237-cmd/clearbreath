import type { JSX } from 'react';

type ConfidenceTier = 'low' | 'medium' | 'high';

/** Props for the empirical ConfidenceMeter indicator. */
export interface ConfidenceMeterProps {
  readonly level: ConfidenceTier;
  readonly explanation?: string;
}

const CONFIDENCE_LEVEL_NUM: Record<ConfidenceTier, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const CONFIDENCE_LABELS: Record<ConfidenceTier, string> = {
  low: 'Low empirical confidence',
  medium: 'Moderate empirical confidence',
  high: 'High scientific consensus',
};

const INACTIVE_SEGMENT_CLASS = 'bg-slate-200 dark:bg-slate-700';

/** Visual segment bar indicating scientific evidentiary confidence of domain models. */
export function ConfidenceMeter({
  level,
  explanation,
}: ConfidenceMeterProps): JSX.Element {
  const activeSegments = CONFIDENCE_LEVEL_NUM[level];
  const label = CONFIDENCE_LABELS[level];

  return (
    <div
      className="flex flex-col gap-1 text-xs text-slate-700 dark:text-slate-300"
      aria-label={label}
    >
      <div className="flex items-center gap-[6px]">
        <span className="font-medium text-slate-800 dark:text-slate-200">
          Confidence:
        </span>
        <div
          className="flex items-center gap-1"
          role="progressbar"
          aria-label={label}
          aria-valuenow={activeSegments}
          aria-valuemin={1}
          aria-valuemax={3}
        >
          <span
            className={`h-2 w-4 rounded-sm ${activeSegments >= 1 ? 'bg-amber-500' : INACTIVE_SEGMENT_CLASS}`}
          />
          <span
            className={`h-2 w-4 rounded-sm ${activeSegments >= 2 ? 'bg-amber-500' : INACTIVE_SEGMENT_CLASS}`}
          />
          <span
            className={`h-2 w-4 rounded-sm ${activeSegments >= 3 ? 'bg-emerald-500' : INACTIVE_SEGMENT_CLASS}`}
          />
        </div>
        <span className="capitalize">{level}</span>
      </div>
      {explanation ? (
        <p className="text-[11px] text-slate-600 dark:text-slate-400">
          {explanation}
        </p>
      ) : null}
    </div>
  );
}

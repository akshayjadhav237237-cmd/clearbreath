import type { JSX } from 'react';
import { getActionCatalog } from '../../domain/actions';
import { Badge, ConfidenceMeter } from '../../shared/ui';

/** Evaluated recommendation item with quantified benefit metrics. */
export interface RecItem {
  readonly action: ReturnType<typeof getActionCatalog>[number];
  readonly dailyDoseReductionUg: number;
  readonly doseReductionBasisPoints: number;
  readonly co2eSavedGramsPerDay: number;
}

interface ItemCardProps {
  readonly item: RecItem;
  readonly isDone: boolean;
  readonly onToggle: (actionId: string) => void;
}

/** Card sub-component presenting action benefits, costs, and implementation toggle. */
export function RecommendationItemCard({
  item,
  isDone,
  onToggle,
}: ItemCardProps): JSX.Element {
  const { action, dailyDoseReductionUg } = item;
  return (
    <li
      className={`rounded-2xl border p-5 shadow-sm transition-all ${
        isDone
          ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge severity="info">{action.category.toUpperCase()}</Badge>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Cost: ₹{action.costRupees} • Effort {action.effort}/3
            </span>
            {isDone ? <Badge severity="good">✓ IMPLEMENTED TODAY</Badge> : null}
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {action.title}
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {action.description}
          </p>
          <div className="pt-2">
            <ConfidenceMeter level={action.confidence} />
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-700 dark:text-slate-300">
              Dose Saved
            </span>
            <p className="font-mono text-sm font-bold text-emerald-800 dark:text-emerald-300">
              -{dailyDoseReductionUg} µg/day
            </p>
          </div>
          <button
            type="button"
            onClick={() => onToggle(action.id)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              isDone
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'
            }`}
          >
            {isDone ? '✓ Completed' : '+ Mark as Implemented'}
          </button>
        </div>
      </div>
    </li>
  );
}

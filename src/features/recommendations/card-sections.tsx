import type { JSX } from 'react';
import type { ActionCategory, ConfidenceLevel } from '../../domain/contracts';
import { Badge, type BadgeSeverity } from '../../shared/ui';
import type { ActionsDict } from '../../shared/i18n/actions-dict';

const CONFIDENCE_SEVERITY: Readonly<Record<ConfidenceLevel, BadgeSeverity>> = {
  low: 'poor',
  medium: 'moderate',
  high: 'good',
};

const MUTED_META_CLASS = 'text-slate-700 dark:text-slate-300';
const STAT_LABEL_CLASS =
  'text-[10px] uppercase font-semibold text-slate-700 dark:text-slate-300';

interface CardHeaderBadgesProps {
  readonly category: ActionCategory;
  readonly confidence: ConfidenceLevel;
  readonly costText: string;
  readonly isDone: boolean;
  readonly dict: ActionsDict;
}

/** Header badge row showing category, confidence tier, cost/effort, and completion state. */
export function CardHeaderBadges({
  category,
  confidence,
  costText,
  isDone,
  dict,
}: CardHeaderBadgesProps): JSX.Element {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge severity="info">{dict.categories[category]}</Badge>
      <Badge severity={CONFIDENCE_SEVERITY[confidence]}>
        {dict.card.confidenceLabel}: {dict.card.confidenceLevels[confidence]}
      </Badge>
      <span className={`text-xs font-medium ${MUTED_META_CLASS}`}>
        {costText}
      </span>
      {isDone ? (
        <Badge severity="good">{dict.card.implementedTodayBadge}</Badge>
      ) : null}
    </div>
  );
}

interface ImpactColumnProps {
  readonly actionId: string;
  readonly dailyDoseReductionUg: number;
  readonly co2eSavedGramsPerDay: number;
  readonly isDone: boolean;
  readonly onToggle: (actionId: string) => void;
  readonly dict: ActionsDict;
  readonly locale: string;
}

/** Action card summary column rendering dose saved, CO2e saved, and completion toggle. */
export function CardImpactColumn({
  actionId,
  dailyDoseReductionUg,
  co2eSavedGramsPerDay,
  isDone,
  onToggle,
  dict,
  locale,
}: ImpactColumnProps): JSX.Element {
  return (
    <div className="flex flex-wrap sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 sm:min-w-[175px]">
      <div className="text-left sm:text-right">
        <span className={STAT_LABEL_CLASS}>{dict.card.doseSavedLabel}</span>
        <p className="font-mono text-sm font-bold text-emerald-800 dark:text-emerald-300">
          -{dailyDoseReductionUg.toLocaleString(locale)}{' '}
          {dict.card.doseSavedUnit}
        </p>
      </div>
      <div className="text-left sm:text-right">
        <span className={STAT_LABEL_CLASS}>{dict.card.co2SavedLabel}</span>
        <p className="font-mono text-xs font-bold text-sky-800 dark:text-sky-300">
          {co2eSavedGramsPerDay.toLocaleString(locale)} {dict.card.co2SavedUnit}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onToggle(actionId)}
        className={`rounded-lg px-3.5 py-[6px] text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
          isDone
            ? 'bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-700'
            : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200'
        }`}
      >
        {isDone ? dict.card.completedBtn : dict.card.markImplementedBtn}
      </button>
    </div>
  );
}

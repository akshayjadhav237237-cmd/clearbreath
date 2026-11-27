import type { JSX } from 'react';
import type { CompareTranslations } from '../../shared/i18n/compare-dict';
import { Badge } from '../../shared/ui';

interface HeaderProps {
  readonly title: string;
  readonly doseSavedPct: number;
  readonly activeCount: number;
  readonly aqiValue: number;
  readonly outdoorPm25: number;
  readonly estimateNote: string;
  readonly dict: CompareTranslations;
}

/** Header card presenting comparative inhaled dose reduction, live AQI badge, and estimate note. */
export function CompareHeader({
  title,
  doseSavedPct,
  activeCount,
  aqiValue,
  outdoorPm25,
  estimateNote,
  dict,
}: HeaderProps): JSX.Element {
  const actionsText = dict.actionsImplementedTemplate.replace(
    '{n}',
    String(activeCount)
  );
  const liveContext = dict.liveContextTemplate
    .replace('{aqi}', String(aqiValue))
    .replace('{pm25}', String(outdoorPm25));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2
        id="compare-heading"
        className="text-xl font-bold text-slate-900 dark:text-slate-50"
      >
        {title}
      </h2>
      <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
        {dict.subtitle}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Badge severity="good" size="md">
          {`-${doseSavedPct}% ${dict.doseBadgeLabel}`}
        </Badge>
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {actionsText}
        </span>
        <Badge severity="info">{liveContext}</Badge>
      </div>
      <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">
        {estimateNote}
      </p>
    </div>
  );
}

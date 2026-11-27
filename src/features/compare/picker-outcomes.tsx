import type { JSX } from 'react';
import type { ComparisonResult } from '../../domain/recommend/types';
import type { CompareTranslations } from '../../shared/i18n/compare-dict';
import { MetricCard } from '../../shared/ui';

interface PickerOutcomesProps {
  readonly comparison: ComparisonResult;
  readonly titleA: string;
  readonly titleB: string;
  readonly dict: CompareTranslations;
}

function formatDeltaSentence(params: {
  readonly delta: number;
  readonly titleA: string;
  readonly titleB: string;
  readonly winnerTemplate: string;
  readonly tieText: string;
}): string {
  if (params.delta === 0) return params.tieText;
  const winner = params.delta > 0 ? params.titleA : params.titleB;
  const amount = Math.abs(params.delta).toLocaleString('en-IN');
  return params.winnerTemplate
    .replace('{winner}', winner)
    .replace('{amount}', amount);
}

function formatSignedNumber(delta: number): string {
  const prefix = delta > 0 ? '+' : '';
  return `${prefix}${delta.toLocaleString('en-IN')}`;
}

function getDeltaTone(delta: number): 'positive' | 'negative' | 'neutral' {
  if (delta > 0) return 'positive';
  if (delta < 0) return 'negative';
  return 'neutral';
}

/** Displays localized dose and CO2e comparison metric cards plus verdict summary. */
export function PickerOutcomes({
  comparison,
  titleA,
  titleB,
  dict,
}: PickerOutcomesProps): JSX.Element {
  const doseVerdict = formatDeltaSentence({
    delta: comparison.doseDeltaUg,
    titleA,
    titleB,
    winnerTemplate: dict.doseWinnerTemplate,
    tieText: dict.doseTieText,
  });
  const emissionsVerdict = formatDeltaSentence({
    delta: comparison.emissionsDeltaGrams,
    titleA,
    titleB,
    winnerTemplate: dict.emissionsWinnerTemplate,
    tieText: dict.emissionsTieText,
  });

  return (
    <>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <MetricCard
          label={dict.doseDeltaLabel}
          value={formatSignedNumber(comparison.doseDeltaUg)}
          unit={dict.units.ugPerDay}
          delta={doseVerdict}
          deltaType={getDeltaTone(comparison.doseDeltaUg)}
        />
        <MetricCard
          label={dict.emissionsDeltaLabel}
          value={formatSignedNumber(comparison.emissionsDeltaGrams)}
          unit={dict.units.gPerDay}
          delta={emissionsVerdict}
          deltaType={getDeltaTone(comparison.emissionsDeltaGrams)}
        />
      </div>
      <p className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {dict.verdictLabel}:{' '}
        </span>
        {`${doseVerdict}; ${emissionsVerdict}.`}
      </p>
    </>
  );
}

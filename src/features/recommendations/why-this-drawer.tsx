import type { JSX } from 'react';
import { getActionSourceById } from '../../domain/actions';
import type { Explanation } from '../../domain/contracts';
import { RECOMMENDATION_SOURCES } from '../../domain/recommend/constants';
import type { Language } from '../../shared/i18n';
import type { ActionsDict } from '../../shared/i18n/actions-dict';
import { translateCompareAssumption } from '../../shared/i18n/compare-action-titles';

interface ResolvedSource {
  readonly id: string;
  readonly title: string;
  readonly organization: string;
  readonly url: string;
}

interface WhyThisDrawerProps {
  readonly panelId: string;
  readonly dailyDoseReductionUg: number;
  readonly doseReductionBasisPoints: number;
  readonly co2eSavedGramsPerDay: number;
  readonly explanation: Explanation | undefined;
  readonly fallbackSourceIds: readonly string[];
  readonly dict: ActionsDict;
  readonly locale: string;
  readonly language?: Language;
  readonly estimateNote: string;
}

const RECOMMENDATION_ORGS: Readonly<Record<string, string>> = {
  'ashrae-62-2-residential': 'ASHRAE',
  'cpcb-naqi-2014': 'Central Pollution Control Board',
  'cpcb-arai-vehicular-emissions-2020': 'CPCB & ARAI',
  'dmrc-sustainability-2022': 'Delhi Metro Rail Corporation',
  'cdc-niosh-n95-fit': 'CDC NIOSH',
  'epa-indoor-pm-penetration': 'US Environmental Protection Agency',
};

const DEFAULT_FORMULA_ID = 'indoor-pm25-mass-balance';
const DL_TERM_CLASS = 'text-[11px] text-slate-700 dark:text-slate-300';
const SUBHEADING_CLASS =
  'text-[11px] font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200';

function resolveSingleSource(
  id: string,
  fallbackOrg: string
): ResolvedSource | null {
  const actionSource = getActionSourceById(id);
  if (actionSource) {
    return {
      id: actionSource.id,
      title: actionSource.title,
      organization: actionSource.organization,
      url: actionSource.url,
    };
  }
  const recSource = RECOMMENDATION_SOURCES[id];
  if (recSource) {
    return {
      id: recSource.id,
      title: recSource.title,
      organization: RECOMMENDATION_ORGS[id] ?? fallbackOrg,
      url: recSource.url,
    };
  }
  return null;
}

function resolveActionSources(
  sourceIds: readonly string[],
  fallbackOrg: string
): readonly ResolvedSource[] {
  const uniqueIds = Array.from(new Set(sourceIds));
  const resolved: ResolvedSource[] = [];
  for (const id of uniqueIds) {
    const entry = resolveSingleSource(id, fallbackOrg);
    if (entry) resolved.push(entry);
  }
  return resolved;
}

function SourcesCitationList({
  sources,
  dict,
}: {
  readonly sources: readonly ResolvedSource[];
  readonly dict: ActionsDict;
}): JSX.Element {
  return (
    <div>
      <h5 className={SUBHEADING_CLASS}>{dict.whyThis.sourcesHeading}</h5>
      {sources.length > 0 ? (
        <ul className="mt-1.5 space-y-1.5">
          {sources.map((src) => (
            <li key={src.id} className="text-xs leading-snug">
              {src.url.startsWith('https://') ? (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-800 underline hover:text-sky-950 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-sky-300 dark:hover:text-sky-100"
                >
                  {src.title}
                </a>
              ) : (
                <span className="font-semibold">{src.title}</span>
              )}{' '}
              <span className="text-slate-700 dark:text-slate-300">
                — {src.organization}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
          {dict.whyThis.noSourcesNote}
        </p>
      )}
    </div>
  );
}

/** Expandable provenance drawer displaying quantified impact, formula ID, assumptions, and source citations. */
export function WhyThisDrawer({
  panelId,
  dailyDoseReductionUg,
  doseReductionBasisPoints,
  co2eSavedGramsPerDay,
  explanation,
  fallbackSourceIds,
  dict,
  locale,
  language = 'en',
  estimateNote,
}: WhyThisDrawerProps): JSX.Element {
  const formulaId = explanation?.formulaId ?? DEFAULT_FORMULA_ID;
  const assumptions = explanation?.assumptions ?? [];
  const sourceIds = explanation?.sourceIds ?? fallbackSourceIds;
  const sources = resolveActionSources(sourceIds, dict.whyThis.fallbackOrg);
  const relativePct = (doseReductionBasisPoints / 100).toFixed(1);

  return (
    <div
      id={panelId}
      className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-700">
        <h4 className="font-bold text-slate-900 dark:text-slate-100">
          {dict.whyThis.drawerHeading}
        </h4>
        <span className={DL_TERM_CLASS}>
          {dict.whyThis.formulaIdLabel}:{' '}
          <code className="font-mono">{formulaId}</code>
        </span>
      </div>
      <dl className="grid gap-2 sm:grid-cols-3">
        <div>
          <dt className={DL_TERM_CLASS}>{dict.whyThis.doseImpactLabel}</dt>
          <dd className="font-mono font-bold text-emerald-800 dark:text-emerald-300">
            -{dailyDoseReductionUg.toLocaleString(locale)}{' '}
            {dict.card.doseSavedUnit}
          </dd>
        </div>
        <div>
          <dt className={DL_TERM_CLASS}>
            {dict.whyThis.relativeReductionLabel}
          </dt>
          <dd className="font-mono font-bold text-slate-900 dark:text-slate-100">
            {relativePct}%
          </dd>
        </div>
        <div>
          <dt className={DL_TERM_CLASS}>{dict.whyThis.co2ImpactLabel}</dt>
          <dd className="font-mono font-bold text-sky-800 dark:text-sky-300">
            {co2eSavedGramsPerDay.toLocaleString(locale)}{' '}
            {dict.card.co2SavedUnit}
          </dd>
        </div>
      </dl>
      {assumptions.length > 0 ? (
        <div>
          <h5 className={SUBHEADING_CLASS}>
            {dict.whyThis.assumptionsHeading}
          </h5>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-slate-700 dark:text-slate-300">
            {assumptions.map((assumption) => (
              <li key={assumption}>
                {translateCompareAssumption(assumption, language)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <SourcesCitationList sources={sources} dict={dict} />
      <p className="border-t border-slate-200 pt-2 text-[11px] text-slate-700 dark:border-slate-700 dark:text-slate-300">
        {estimateNote}
      </p>
    </div>
  );
}

import type { JSX } from 'react';
import { translateCompareAssumption } from '../../shared/i18n/compare-action-titles';
import type { CompareTranslations } from '../../shared/i18n/compare-dict';
import type { Language } from '../../shared/i18n';
import { MetricCard } from '../../shared/ui';

interface BaselineProps {
  readonly baselineIndoorPm25: number;
  readonly baselineDoseUg: number;
  readonly title: string;
  readonly dict: CompareTranslations;
  readonly locale?: string;
}

const SUBTEXT_CLASS = 'mt-1 text-xs text-slate-700 dark:text-slate-300';

/** Card rendering baseline unmitigated indoor pollution and dose levels. */
export function BaselineScenarioCard({
  baselineIndoorPm25,
  baselineDoseUg,
  title,
  dict,
  locale = 'en-IN',
}: BaselineProps): JSX.Element {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
          {title}
        </h3>
        <p className={SUBTEXT_CLASS}>{dict.baselineSubtitle}</p>
      </div>
      <div className="mt-4 space-y-4">
        <MetricCard
          label={dict.baselineIndoorLabel}
          value={baselineIndoorPm25}
          unit={dict.units.ugm3}
          tooltip={dict.baselineIndoorTooltip}
        />
        <MetricCard
          label={dict.baselineDoseLabel}
          value={baselineDoseUg.toLocaleString(locale)}
          unit={dict.units.ugPerDay}
          tooltip={dict.baselineDoseTooltip}
        />
        <MetricCard
          label={dict.baselineCostLabel}
          value={`${dict.units.rupeeSymbol}0`}
          tooltip={dict.baselineCostTooltip}
        />
      </div>
    </article>
  );
}

interface MitigatedProps {
  readonly mitigatedIndoorPm25: number;
  readonly mitigatedDoseUg: number;
  readonly totalDoseReductionUg: number;
  readonly totalCostRupees: number;
  readonly totalEmissionsSavedG: number;
  readonly baselineIndoorPm25: number;
  readonly activeCount: number;
  readonly title: string;
  readonly dict: CompareTranslations;
  readonly locale?: string;
}

/** Card rendering mitigated indoor particulate and inhalation dose outcomes. */
export function MitigatedScenarioCard({
  mitigatedIndoorPm25,
  mitigatedDoseUg,
  totalDoseReductionUg,
  totalCostRupees,
  totalEmissionsSavedG,
  baselineIndoorPm25,
  activeCount,
  title,
  dict,
  locale = 'en-IN',
}: MitigatedProps): JSX.Element {
  const pmDelta = Math.max(0, baselineIndoorPm25 - mitigatedIndoorPm25);
  const subtitle = dict.mitigatedSubtitleTemplate.replace(
    '{n}',
    String(activeCount)
  );

  return (
    <article className="rounded-2xl border border-emerald-300 bg-emerald-50/20 p-6 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/20">
      <div className="border-b border-emerald-100 pb-3 dark:border-emerald-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          {title}
        </h3>
        <p className={SUBTEXT_CLASS}>{subtitle}</p>
      </div>
      <div className="mt-4 space-y-4">
        <MetricCard
          label={dict.mitigatedIndoorLabel}
          value={mitigatedIndoorPm25}
          unit={dict.units.ugm3}
          delta={`-${pmDelta} ${dict.units.ugm3}`}
          deltaType="positive"
        />
        <MetricCard
          label={dict.mitigatedDoseLabel}
          value={mitigatedDoseUg.toLocaleString(locale)}
          unit={dict.units.ugPerDay}
          delta={`-${totalDoseReductionUg.toLocaleString(locale)} ${dict.units.ugPerDay}`}
          deltaType="positive"
        />
        <MetricCard
          label={dict.mitigatedCostLabel}
          value={`${dict.units.rupeeSymbol}${totalCostRupees.toLocaleString(locale)}`}
          delta={`+${totalEmissionsSavedG.toLocaleString(locale)} ${dict.units.co2eSavedSuffix}`}
          deltaType="positive"
        />
      </div>
      {activeCount === 0 ? (
        <p className="mt-3 text-xs font-medium text-slate-700 dark:text-slate-300">
          {dict.noActionsHint}
        </p>
      ) : null}
    </article>
  );
}

interface AssumptionsProps {
  readonly assumptions: readonly string[];
  readonly language: Language;
  readonly dict: CompareTranslations;
}

/** Disclosure panel presenting stated domain model assumptions and estimate caveats. */
export function AssumptionsDisclosureCard({
  assumptions,
  language,
  dict,
}: AssumptionsProps): JSX.Element {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
        {dict.assumptionsHeader}
      </h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-700 dark:text-slate-300">
        {assumptions.map((item) => (
          <li key={item}>{translateCompareAssumption(item, language)}</li>
        ))}
      </ul>
      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          {dict.estimateDisclosureTitle}
        </p>
        <p className={SUBTEXT_CLASS}>{dict.estimateDisclosure}</p>
      </div>
    </aside>
  );
}

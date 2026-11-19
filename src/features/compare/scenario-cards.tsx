import type { JSX } from 'react';
import { MetricCard } from '../../shared/ui';

interface BaselineProps {
  readonly baselineIndoorPm25: number;
  readonly baselineDoseUg: number;
  readonly title: string;
}

/** Card rendering baseline unmitigated indoor pollution and dose levels. */
export function BaselineScenarioCard({
  baselineIndoorPm25,
  baselineDoseUg,
  title,
}: BaselineProps): JSX.Element {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
          {title}
        </span>
        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
          Without active interventions
        </p>
      </div>
      <div className="mt-4 space-y-4">
        <MetricCard
          label="Average Indoor PM2.5"
          value={baselineIndoorPm25}
          unit="µg/m³"
          tooltip="Steady-state indoor particulate concentration"
        />
        <MetricCard
          label="Total Daily Inhaled Dose"
          value={baselineDoseUg.toLocaleString('en-IN')}
          unit="µg/day"
          tooltip="Aggregated across all household members"
        />
        <MetricCard
          label="Implementation Cost"
          value="₹0"
          tooltip="Baseline expenditure"
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
}: MitigatedProps): JSX.Element {
  return (
    <article className="rounded-2xl border border-emerald-300 bg-emerald-50/20 p-6 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/20">
      <div className="border-b border-emerald-100 pb-3 dark:border-emerald-900">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          {title}
        </span>
        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
          With {activeCount} planned mitigations applied
        </p>
      </div>
      <div className="mt-4 space-y-4">
        <MetricCard
          label="Mitigated Indoor PM2.5"
          value={mitigatedIndoorPm25}
          unit="µg/m³"
          delta={`-${baselineIndoorPm25 - mitigatedIndoorPm25} µg/m³`}
          deltaType="positive"
        />
        <MetricCard
          label="Mitigated Inhaled Dose"
          value={mitigatedDoseUg.toLocaleString('en-IN')}
          unit="µg/day"
          delta={`-${totalDoseReductionUg.toLocaleString('en-IN')} µg/day`}
          deltaType="positive"
        />
        <MetricCard
          label="Total Implementation Cost"
          value={`₹${totalCostRupees.toLocaleString('en-IN')}`}
          delta={`+${totalEmissionsSavedG.toLocaleString('en-IN')}g CO2e saved`}
          deltaType="positive"
        />
      </div>
    </article>
  );
}

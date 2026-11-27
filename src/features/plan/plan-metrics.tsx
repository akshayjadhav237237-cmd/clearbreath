import type { JSX } from 'react';
import type { DailyPlan } from '../../domain/contracts';
import type { getTranslations } from '../../shared/i18n';
import type { PlanDict } from '../../shared/i18n/plan-dict';
import { Badge } from '../../shared/ui';

type OutdoorWindow = DailyPlan['outdoorWindows'][number];
type PurifierSlot = DailyPlan['purifierSchedule'][number];
type VentWindow = NonNullable<DailyPlan['bestVentilationWindow']>;

interface PlanMetricsProps {
  readonly bestWindow: OutdoorWindow | null;
  readonly ventWindow: VentWindow | null;
  readonly purifierSchedule: readonly PurifierSlot[];
  readonly t: ReturnType<typeof getTranslations>;
  readonly dict: PlanDict;
}

function formatHourRange(startHour: number, endHour: number): string {
  const start = String(startHour).padStart(2, '0');
  const end = String(endHour).padStart(2, '0');
  return `${start}:00 – ${end}:00`;
}

/** Summary cards showing safest outdoor window, ventilation slot, and purifier schedule. */
export function PlanMetrics({
  bestWindow,
  ventWindow,
  purifierSchedule,
  t,
  dict,
}: PlanMetricsProps): JSX.Element {
  const highHoursCount = purifierSchedule.filter(
    (p) => p.operationalState === 'high'
  ).length;
  const cardClass =
    'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900';

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 print:hidden">
      <article className={cardClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t.plan.outdoorWindow}
          </h3>
          <Badge severity="good">{dict.metrics.lowestAqiBadge}</Badge>
        </div>
        <p className="mt-3 font-mono text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">
          {bestWindow
            ? formatHourRange(bestWindow.startHour, bestWindow.endHour)
            : dict.metrics.stayIndoors}
        </p>
        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
          {bestWindow ? (
            <>
              {dict.metrics.averageAqiLabel}{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {bestWindow.averageAqi}
              </span>
            </>
          ) : (
            t.plan.peakSmogWarning
          )}
        </p>
      </article>

      <article className={cardClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t.plan.ventilation}
          </h3>
          <Badge severity="info">{dict.metrics.crossVentBadge}</Badge>
        </div>
        <p className="mt-3 font-mono text-2xl font-extrabold text-sky-800 dark:text-sky-300">
          {ventWindow
            ? `${(ventWindow.endHour - ventWindow.startHour) * 60} ${dict.metrics.minutesUnit}`
            : dict.metrics.sealedLabel}
        </p>
        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
          {dict.metrics.windowLabel}{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {ventWindow
              ? formatHourRange(ventWindow.startHour, ventWindow.endHour)
              : dict.metrics.keepWindowsShut}
          </span>
        </p>
      </article>

      <article className={cardClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t.plan.purifierSchedule}
          </h3>
          <Badge severity="moderate">{dict.metrics.hepaCadrBadge}</Badge>
        </div>
        <p className="mt-3 font-mono text-2xl font-extrabold text-amber-800 dark:text-amber-300">
          {highHoursCount} {dict.metrics.hoursHighUnit}
        </p>
        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
          {dict.metrics.nightInversionLabel}{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {dict.metrics.nightInversionNote}
          </span>
        </p>
      </article>
    </div>
  );
}

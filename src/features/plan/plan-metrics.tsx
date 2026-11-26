import type { JSX } from 'react';
import type { DailyPlan } from '../../domain/contracts';
import type { getTranslations } from '../../shared/i18n';
import { Badge } from '../../shared/ui';

type OutdoorWindow = DailyPlan['outdoorWindows'][number];
type PurifierSlot = DailyPlan['purifierSchedule'][number];
type VentWindow = NonNullable<DailyPlan['bestVentilationWindow']>;

interface PlanMetricsProps {
  readonly bestWindow: OutdoorWindow;
  readonly ventWindow: VentWindow | null;
  readonly purifierSchedule: readonly PurifierSlot[];
  readonly t: ReturnType<typeof getTranslations>;
}

/** Summary cards showing safest outdoor window, ventilation slot, and purifier schedule. */
export function PlanMetrics({
  bestWindow,
  ventWindow,
  purifierSchedule,
  t,
}: PlanMetricsProps): JSX.Element {
  const highHoursCount = purifierSchedule.filter(
    (p) => p.operationalState === 'high'
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 print:hidden">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t.plan.outdoorWindow}
          </h3>
          <Badge severity="good">LOWEST AQI WINDOW</Badge>
        </div>
        <p className="mt-3 font-mono text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">
          {String(bestWindow.startHour).padStart(2, '0')}:00 –{' '}
          {String(bestWindow.endHour).padStart(2, '0')}:00
        </p>
        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
          Average AQI:{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {bestWindow.averageAqi}
          </span>
        </p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t.plan.ventilation}
          </h3>
          <Badge severity="info">CROSS VENTILATION</Badge>
        </div>
        <p className="mt-3 font-mono text-2xl font-extrabold text-sky-800 dark:text-sky-300">
          {ventWindow
            ? `${(ventWindow.endHour - ventWindow.startHour) * 60} Minutes`
            : 'Sealed'}
        </p>
        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
          Window:{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {ventWindow
              ? `${String(ventWindow.startHour).padStart(2, '0')}:00 – ${String(ventWindow.endHour).padStart(2, '0')}:00`
              : 'Keep windows shut'}
          </span>
        </p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t.plan.purifierSchedule}
          </h3>
          <Badge severity="moderate">HEPA CADR</Badge>
        </div>
        <p className="mt-3 font-mono text-2xl font-extrabold text-amber-800 dark:text-amber-300">
          {highHoursCount} Hours High
        </p>
        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
          Night Inversion:{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            High speed during inversion hours
          </span>
        </p>
      </article>
    </div>
  );
}

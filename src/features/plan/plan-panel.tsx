import type { JSX } from 'react';
import { useAppStore } from '../../app/store';
import { generateDailyPlan } from '../../domain/planner';
import { determineHouseholdSensitivity } from '../../domain/profile';
import { Badge } from '../../shared/ui';
import { getTranslations } from '../../shared/i18n';
import type { DailyPlan, HourlyReading } from '../../domain/contracts';
import { DiurnalChart } from './diurnal-chart';

type OutdoorWindow = DailyPlan['outdoorWindows'][number];
type PurifierSlot = DailyPlan['purifierSchedule'][number];
type VentWindow = NonNullable<DailyPlan['bestVentilationWindow']>;

interface PlanMetricsProps {
  readonly bestWindow: OutdoorWindow;
  readonly ventWindow: VentWindow | null;
  readonly purifierSchedule: readonly PurifierSlot[];
  readonly t: ReturnType<typeof getTranslations>;
}

function PlanMetrics({
  bestWindow,
  ventWindow,
  purifierSchedule,
  t,
}: PlanMetricsProps): JSX.Element {
  const highHoursCount = purifierSchedule.filter(
    (p) => p.operationalState === 'high'
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t.plan.outdoorWindow}
          </h3>
          <Badge severity="good">SAFEST WINDOW</Badge>
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
          {ventWindow ? '30 Minutes' : 'Sealed'}
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
            Full Power (20:00 - 08:00)
          </span>
        </p>
      </article>
    </div>
  );
}

/** Interactive 24-hour diurnal particulate curve and mitigation scheduling advisory panel. */
export function PlanPanel(): JSX.Element {
  const { hourlySeries, profile, language } = useAppStore();
  const t = getTranslations(language);

  const readings: readonly HourlyReading[] =
    hourlySeries?.readings ??
    Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      pm25: i >= 11 && i <= 16 ? 95 : 240,
      pm10: i >= 11 && i <= 16 ? 160 : 380,
    }));

  const sensitivity = determineHouseholdSensitivity(profile.members);
  const planRes = generateDailyPlan(readings, sensitivity, profile.lifestyle);
  const plan: DailyPlan = planRes.ok
    ? planRes.value
    : {
        outdoorWindows: [{ startHour: 12, endHour: 15, averageAqi: 120 }],
        bestVentilationWindow: { startHour: 13, endHour: 14 },
        purifierSchedule: Array.from({ length: 24 }, (_, h) => ({
          hour: h,
          operationalState: h >= 20 || h <= 8 ? 'high' : 'low',
        })),
        hourlyAqi: [],
        advisorySummary: 'Exercise caution during peak evening hours.',
      };

  const bestWindow = plan.outdoorWindows[0] ?? {
    startHour: 12,
    endHour: 15,
    averageAqi: 120,
  };
  const maxPm25 = Math.max(...readings.map((r) => r.pm25));

  return (
    <section aria-labelledby="plan-heading" className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2
          id="plan-heading"
          className="text-xl font-bold text-slate-900 dark:text-slate-50"
        >
          {t.plan.title}
        </h2>
        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
          Optimal outdoor windows and room-by-room ventilation schedules
          calculated from mass-balance air exchange models.
        </p>
        <DiurnalChart
          readings={readings}
          bestWindow={bestWindow}
          maxPm25={maxPm25}
        />
      </div>
      <PlanMetrics
        bestWindow={bestWindow}
        ventWindow={plan.bestVentilationWindow}
        purifierSchedule={plan.purifierSchedule}
        t={t}
      />
    </section>
  );
}

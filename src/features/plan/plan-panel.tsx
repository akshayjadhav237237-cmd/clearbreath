import { useMemo, type JSX } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../app/store';
import { generateDailyPlan } from '../../domain/planner';
import { determineHouseholdSensitivity } from '../../domain/profile';
import { getTranslations } from '../../shared/i18n';
import { SystemClock } from '../../shared/system-ports';
import type { DailyPlan, HourlyReading } from '../../domain/contracts';
import { DiurnalChart } from './diurnal-chart';
import { PlanExportBar } from './plan-export-bar';
import { PlanMetrics } from './plan-metrics';
import { SmogDayPlanPrint } from '../print';

const FALLBACK_READINGS: readonly HourlyReading[] = Array.from(
  { length: 24 },
  (_, i) => ({
    hour: i,
    pm25: i >= 11 && i <= 16 ? 95 : 240,
    pm10: i >= 11 && i <= 16 ? 160 : 380,
  })
);

const FALLBACK_PLAN: DailyPlan = {
  outdoorWindows: [{ startHour: 12, endHour: 15, averageAqi: 120 }],
  bestVentilationWindow: { startHour: 13, endHour: 14 },
  purifierSchedule: Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    operationalState: h >= 20 || h <= 8 ? 'high' : 'low',
  })),
  hourlyAqi: [],
  advisorySummary: 'Exercise caution during peak evening hours.',
};

const FALLBACK_WINDOW = { startHour: 12, endHour: 15, averageAqi: 120 };

/** Interactive 24-hour diurnal particulate curve and mitigation scheduling advisory panel. */
export function PlanPanel(): JSX.Element {
  const { hourlySeries, profile, language } = useAppStore(
    useShallow((s) => ({
      hourlySeries: s.hourlySeries,
      profile: s.profile,
      language: s.language,
    }))
  );
  const t = getTranslations(language);

  const readings: readonly HourlyReading[] =
    hourlySeries?.readings ?? FALLBACK_READINGS;

  const plan = useMemo((): DailyPlan => {
    const sensitivity = determineHouseholdSensitivity(profile.members);
    const planRes = generateDailyPlan(readings, sensitivity, profile.lifestyle);
    return planRes.ok ? planRes.value : FALLBACK_PLAN;
  }, [readings, profile.members, profile.lifestyle]);

  const bestWindow = plan.outdoorWindows[0] ?? FALLBACK_WINDOW;
  const maxPm25 = useMemo(
    () => readings.reduce((mx, r) => (r.pm25 > mx ? r.pm25 : mx), 0),
    [readings]
  );
  const peakAqi = useMemo(
    () =>
      plan.hourlyAqi.reduce(
        (best, cur) => (cur.value > best.value ? cur : best),
        plan.hourlyAqi[0] ?? {
          value: bestWindow.averageAqi,
          category: 'severe' as const,
        }
      ),
    [plan.hourlyAqi, bestWindow.averageAqi]
  );
  const todayIsoDate = useMemo(
    () => new Date(new SystemClock().now()).toISOString().slice(0, 10),
    []
  );
  const handlePrint = (): void => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <section aria-labelledby="plan-heading" className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:hidden">
        <h2
          id="plan-heading"
          className="text-xl font-bold text-slate-900 dark:text-slate-50"
        >
          {t.plan.title}
        </h2>
        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
          Lower-pollution outdoor windows, ventilation slots, and purifier
          schedules derived from diurnal AQI trends and household sensitivity.
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
      <PlanExportBar plan={plan} onPrint={handlePrint} />
      <SmogDayPlanPrint
        profile={profile}
        plan={plan}
        currentAqi={peakAqi.value}
        aqiCategory={peakAqi.category}
        dateFormatted={todayIsoDate}
        onPrint={handlePrint}
      />
    </section>
  );
}

import { useMemo, type JSX } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../app/store';
import { getActionCatalog } from '../../domain/actions';
import { generateRecommendations } from '../../domain/recommend';
import { getTranslations } from '../../shared/i18n';
import { getPlanDict } from '../../shared/i18n/plan-dict';
import { selectAqiAndPlan } from '../../shared/state/selectors';
import { SystemClock } from '../../shared/system-ports';
import type { HourlyReading } from '../../domain/contracts';
import { DiurnalChart } from './diurnal-chart';
import { PlanExportBar } from './plan-export-bar';
import { PlanMetrics } from './plan-metrics';
import { SmogDayPlanPrint } from '../print';

function getValidReadings(
  readings?: readonly HourlyReading[]
): readonly HourlyReading[] {
  if (!readings || readings.length === 0) return [];
  const hasInvalid = readings.some(
    (r) =>
      !Number.isFinite(r.pm25) ||
      r.pm25 < 0 ||
      !Number.isFinite(r.pm10) ||
      r.pm10 < 0
  );
  return hasInvalid ? [] : readings;
}

/** Interactive 24-hour diurnal particulate curve and mitigation scheduling advisory panel. */
export function PlanPanel(): JSX.Element {
  const { selectedCity, hourlySeries, profile, language } = useAppStore(
    useShallow((s) => ({
      selectedCity: s.selectedCity,
      hourlySeries: s.hourlySeries,
      profile: s.profile,
      language: s.language,
    }))
  );
  const t = getTranslations(language);
  const dict = getPlanDict(language);

  const { aqi, plan } = useMemo(
    () => selectAqiAndPlan({ selectedCity, hourlySeries, profile }),
    [selectedCity, hourlySeries, profile]
  );
  const recommendations = useMemo(() => {
    const res = generateRecommendations(profile, aqi, plan, getActionCatalog());
    return res.ok ? res.value : undefined;
  }, [profile, aqi, plan]);
  const validReadings = useMemo(
    () => getValidReadings(hourlySeries?.readings),
    [hourlySeries]
  );
  const maxPm25 = useMemo(
    () => validReadings.reduce((mx, r) => (r.pm25 > mx ? r.pm25 : mx), 0),
    [validReadings]
  );
  const bestWindow = plan.outdoorWindows[0] ?? null;
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
          {dict.panel.subtitle}
        </p>
        <DiurnalChart
          readings={validReadings}
          hourlyAqi={plan.hourlyAqi}
          bestWindow={bestWindow}
          maxPm25={maxPm25}
          language={language}
        />
      </div>
      <PlanMetrics
        bestWindow={bestWindow}
        ventWindow={plan.bestVentilationWindow}
        purifierSchedule={plan.purifierSchedule}
        t={t}
        dict={dict}
      />
      <PlanExportBar
        plan={plan}
        {...(recommendations ? { recommendations } : {})}
        onPrint={handlePrint}
        language={language}
      />
      <SmogDayPlanPrint
        profile={profile}
        plan={plan}
        currentAqi={aqi.value}
        aqiCategory={aqi.category}
        dateFormatted={todayIsoDate}
        onPrint={handlePrint}
        language={language}
      />
    </section>
  );
}

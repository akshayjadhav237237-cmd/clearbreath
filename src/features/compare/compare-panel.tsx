import { useMemo, type JSX } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../app/store';
import { getActionCatalog } from '../../domain/actions';
import { generateRecommendations } from '../../domain/recommend';
import { Badge } from '../../shared/ui';
import { getTranslations } from '../../shared/i18n';
import type {
  AqiResult,
  DailyPlan,
  RecommendationResult,
} from '../../domain/contracts';
import { BaselineScenarioCard, MitigatedScenarioCard } from './scenario-cards';

const MOCK_AQI: AqiResult = {
  value: 200,
  category: 'moderate',
  dominant: 'pm25',
};

const MOCK_PLAN: DailyPlan = {
  outdoorWindows: [],
  bestVentilationWindow: null,
  purifierSchedule: [],
  hourlyAqi: [],
  advisorySummary: '',
};

function calculateTotals(
  allItems: RecommendationResult['items'],
  completedActionIds: readonly string[],
  baselineDoseUg: number
) {
  const activeItems = allItems.filter((i) =>
    completedActionIds.includes(i.action.id)
  );

  const totalDoseReductionUg = activeItems.reduce(
    (acc, i) => acc + i.dailyDoseReductionUg,
    0
  );
  const totalCostRupees = activeItems.reduce(
    (acc, i) => acc + i.action.costRupees,
    0
  );
  const totalEmissionsSavedG = activeItems.reduce(
    (acc, i) => acc + i.co2eSavedGramsPerDay,
    0
  );

  const mitigatedDoseUg = Math.max(0, baselineDoseUg - totalDoseReductionUg);
  const doseSavedPct =
    baselineDoseUg > 0
      ? Math.round((totalDoseReductionUg / baselineDoseUg) * 100)
      : 0;

  return {
    activeCount: activeItems.length,
    totalDoseReductionUg,
    totalCostRupees,
    totalEmissionsSavedG,
    mitigatedDoseUg,
    doseSavedPct,
  };
}

interface HeaderProps {
  readonly title: string;
  readonly doseSavedPct: number;
  readonly activeCount: number;
  readonly estimateNote: string;
}

function CompareHeader({
  title,
  doseSavedPct,
  activeCount,
  estimateNote,
}: HeaderProps): JSX.Element {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2
        id="compare-heading"
        className="text-xl font-bold text-slate-900 dark:text-slate-50"
      >
        {title}
      </h2>
      <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
        Compare modelled status quo and mitigated household exposure estimates
        under stated IAQ assumptions.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Badge severity="good" size="md">
          -{doseSavedPct}% Total Inhaled Dose
        </Badge>
        <span className="text-xs text-slate-700 dark:text-slate-300">
          Based on {activeCount} actions implemented
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">
        {estimateNote}
      </p>
    </div>
  );
}

/** Side-by-side comparative impact modeling evaluating baseline vs mitigated scenario outcomes. */
export function ComparePanel(): JSX.Element {
  const { profile, hourlySeries, completedActionIds, language } = useAppStore(
    useShallow((s) => ({
      profile: s.profile,
      hourlySeries: s.hourlySeries,
      completedActionIds: s.completedActionIds,
      language: s.language,
    }))
  );
  const t = getTranslations(language);

  const outdoorPm25 = hourlySeries?.readings[12]?.pm25 ?? 180;
  const baselineIndoorPm25 = Math.round(outdoorPm25 * 0.82);
  const baselineDoseUg = Math.round(
    profile.members.length * baselineIndoorPm25 * 16 * 0.5 +
      profile.lifestyle.outdoorMinutesPerDay * outdoorPm25 * 0.02
  );

  const allItems = useMemo(() => {
    const recRes = generateRecommendations(
      profile,
      MOCK_AQI,
      MOCK_PLAN,
      getActionCatalog()
    );
    return recRes.ok ? recRes.value.items : [];
  }, [profile]);

  const {
    activeCount,
    totalDoseReductionUg,
    totalCostRupees,
    totalEmissionsSavedG,
    mitigatedDoseUg,
    doseSavedPct,
  } = useMemo(
    () => calculateTotals(allItems, completedActionIds, baselineDoseUg),
    [allItems, completedActionIds, baselineDoseUg]
  );

  const mitigatedIndoorPm25 = Math.max(
    25,
    baselineIndoorPm25 - Math.round(totalDoseReductionUg * 0.05)
  );

  return (
    <section aria-labelledby="compare-heading" className="space-y-6">
      <CompareHeader
        title={t.compare.title}
        doseSavedPct={doseSavedPct}
        activeCount={activeCount}
        estimateNote={t.common.estimateNote}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <BaselineScenarioCard
          baselineIndoorPm25={baselineIndoorPm25}
          baselineDoseUg={baselineDoseUg}
          title={t.compare.baseline}
        />
        <MitigatedScenarioCard
          mitigatedIndoorPm25={mitigatedIndoorPm25}
          mitigatedDoseUg={mitigatedDoseUg}
          totalDoseReductionUg={totalDoseReductionUg}
          totalCostRupees={totalCostRupees}
          totalEmissionsSavedG={totalEmissionsSavedG}
          baselineIndoorPm25={baselineIndoorPm25}
          activeCount={activeCount}
          title={t.compare.mitigated}
        />
      </div>
    </section>
  );
}

import { useMemo, useState, type JSX } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../app/store';
import { generateRecommendations } from '../../domain/recommend';
import { getActionCatalog } from '../../domain/actions';
import { MetricCard } from '../../shared/ui';
import { getTranslations } from '../../shared/i18n';
import type {
  ActionCategory,
  AqiResult,
  DailyPlan,
} from '../../domain/contracts';
import { RecommendationItemCard, type RecItem } from './recommendation-card';

interface HeaderProps {
  readonly title: string;
  readonly totalAvoidedDoseUg: number;
  readonly totalEmissionsSavedG: number;
  readonly completedCount: number;
  readonly selectedCategory: ActionCategory | 'all';
  readonly onSelectCategory: (cat: ActionCategory | 'all') => void;
  readonly categories: readonly { id: ActionCategory | 'all'; label: string }[];
  readonly t: ReturnType<typeof getTranslations>;
}

function RecommendationsHeader({
  title,
  totalAvoidedDoseUg,
  totalEmissionsSavedG,
  completedCount,
  selectedCategory,
  onSelectCategory,
  categories,
  t,
}: HeaderProps): JSX.Element {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2
        id="recommendations-heading"
        className="text-xl font-bold text-slate-900 dark:text-slate-50"
      >
        {title}
      </h2>
      <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
        Prioritized by estimated cost-effectiveness (modelled inhaled dose
        reduction per rupee spent).
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <MetricCard
          label={t.actions.avoidedDose}
          value={totalAvoidedDoseUg.toLocaleString('en-IN')}
          unit="µg / day"
          deltaType="positive"
          delta={`${completedCount} actions applied`}
        />
        <MetricCard
          label={t.actions.avoidedCo2}
          value={totalEmissionsSavedG.toLocaleString('en-IN')}
          unit="g CO2e / day"
          deltaType="positive"
          delta="Community benefit"
        />
      </div>
      <nav aria-label="Action categories" className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`rounded-lg px-3 py-[6px] text-xs font-semibold transition-colors ${
              selectedCategory === cat.id
                ? 'bg-sky-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

const REC_MOCK_AQI: AqiResult = {
  value: 240,
  category: 'veryPoor',
  dominant: 'pm25',
};

const REC_MOCK_PLAN: DailyPlan = {
  outdoorWindows: [],
  bestVentilationWindow: null,
  purifierSchedule: [],
  hourlyAqi: [],
  advisorySummary: '',
};

/** Particulate mitigation action catalog, cost-effectiveness ranking, and implementation tracker. */
export function RecommendationsPanel(): JSX.Element {
  const { profile, completedActionIds, toggleActionCompleted, language } =
    useAppStore(
      useShallow((s) => ({
        profile: s.profile,
        completedActionIds: s.completedActionIds,
        toggleActionCompleted: s.toggleActionCompleted,
        language: s.language,
      }))
    );
  const t = getTranslations(language);
  const [selectedCategory, setSelectedCategory] = useState<
    ActionCategory | 'all'
  >('all');

  const items = useMemo((): readonly RecItem[] => {
    const res = generateRecommendations(
      profile,
      REC_MOCK_AQI,
      REC_MOCK_PLAN,
      getActionCatalog()
    );
    return res.ok ? res.value.items : [];
  }, [profile]);

  const filtered = useMemo(
    () =>
      selectedCategory === 'all'
        ? items
        : items.filter((item) => item.action.category === selectedCategory),
    [items, selectedCategory]
  );

  const { completedActions, totalAvoidedDoseUg, totalEmissionsSavedG } =
    useMemo(() => {
      const done = items.filter((item) =>
        completedActionIds.includes(item.action.id)
      );
      return {
        completedActions: done,
        totalAvoidedDoseUg: done.reduce(
          (acc, cur) => acc + cur.dailyDoseReductionUg,
          0
        ),
        totalEmissionsSavedG: done.reduce(
          (acc, cur) => acc + cur.co2eSavedGramsPerDay,
          0
        ),
      };
    }, [items, completedActionIds]);

  const categories: readonly { id: ActionCategory | 'all'; label: string }[] = [
    { id: 'all', label: t.actions.filterAll },
    { id: 'indoor', label: 'Indoor' },
    { id: 'mobility', label: 'Mobility' },
    { id: 'outdoor', label: 'Outdoor' },
    { id: 'household', label: 'Household' },
    { id: 'community', label: 'Community' },
  ];

  return (
    <section aria-labelledby="recommendations-heading" className="space-y-6">
      <RecommendationsHeader
        title={t.actions.title}
        totalAvoidedDoseUg={totalAvoidedDoseUg}
        totalEmissionsSavedG={totalEmissionsSavedG}
        completedCount={completedActions.length}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
        t={t}
      />

      <ul className="space-y-4">
        {filtered.map((item) => (
          <RecommendationItemCard
            key={item.action.id}
            item={item}
            isDone={completedActionIds.includes(item.action.id)}
            onToggle={toggleActionCompleted}
            estimateNote={t.common.estimateNote}
          />
        ))}
      </ul>
    </section>
  );
}

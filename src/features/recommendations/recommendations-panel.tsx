import { useMemo, useState, type JSX } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../app/store';
import { generateRecommendations } from '../../domain/recommend';
import { getActionCatalog } from '../../domain/actions';
import { getActionsDict } from '../../shared/i18n/actions-dict';
import { selectAqiAndPlan } from '../../shared/state/selectors';
import type { ActionCategory } from '../../domain/contracts';
import { RecommendationItemCard, type RecItem } from './recommendation-card';
import { RecommendationsHeader } from './recommendations-header';

function computeCompletionTotals(
  items: readonly RecItem[],
  completedActionIds: readonly string[]
) {
  const done = items.filter((item) =>
    completedActionIds.includes(item.action.id)
  );
  return {
    completedCount: done.length,
    totalAvoidedDoseUg: done.reduce(
      (acc, cur) => acc + cur.dailyDoseReductionUg,
      0
    ),
    totalEmissionsSavedG: done.reduce(
      (acc, cur) => acc + cur.co2eSavedGramsPerDay,
      0
    ),
  };
}

function useRecommendationsModel(selectedCategory: ActionCategory | 'all') {
  const state = useAppStore(
    useShallow((s) => ({
      profile: s.profile,
      hourlySeries: s.hourlySeries,
      selectedCity: s.selectedCity,
      completedActionIds: s.completedActionIds,
      toggleActionCompleted: s.toggleActionCompleted,
      language: s.language,
    }))
  );
  const { profile, hourlySeries, selectedCity, completedActionIds } = state;
  const { aqi, plan } = useMemo(
    () => selectAqiAndPlan({ selectedCity, hourlySeries, profile }),
    [selectedCity, hourlySeries, profile]
  );
  const items = useMemo((): readonly RecItem[] => {
    const res = generateRecommendations(profile, aqi, plan, getActionCatalog());
    return res.ok ? res.value.items : [];
  }, [profile, aqi, plan]);
  const filtered = useMemo(
    () =>
      selectedCategory === 'all'
        ? items
        : items.filter((item) => item.action.category === selectedCategory),
    [items, selectedCategory]
  );
  const totals = useMemo(
    () => computeCompletionTotals(items, completedActionIds),
    [items, completedActionIds]
  );

  return { ...state, aqi, filtered, totals };
}

/** Particulate mitigation action catalog, live AQI quantification, and implementation tracker. */
export function RecommendationsPanel(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<
    ActionCategory | 'all'
  >('all');
  const {
    selectedCity,
    completedActionIds,
    toggleActionCompleted,
    language,
    aqi,
    filtered,
    totals,
  } = useRecommendationsModel(selectedCategory);
  const dict = getActionsDict(language);
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';

  return (
    <section aria-labelledby="recommendations-heading" className="space-y-6">
      <RecommendationsHeader
        aqi={aqi}
        selectedCity={selectedCity}
        totalAvoidedDoseUg={totals.totalAvoidedDoseUg}
        totalEmissionsSavedG={totals.totalEmissionsSavedG}
        completedCount={totals.completedCount}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        dict={dict}
        locale={locale}
      />
      {filtered.length > 0 ? (
        <ul className="space-y-4">
          {filtered.map((item) => (
            <RecommendationItemCard
              key={item.action.id}
              item={item}
              isDone={completedActionIds.includes(item.action.id)}
              onToggle={toggleActionCompleted}
              dict={dict}
              locale={locale}
              language={language}
              estimateNote={dict.whyThis.estimateDisclaimer}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {dict.emptyCategory}
        </p>
      )}
    </section>
  );
}

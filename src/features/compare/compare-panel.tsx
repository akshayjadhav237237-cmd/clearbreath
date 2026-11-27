import { useMemo, useState, type JSX } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../app/store';
import { getActionCatalog } from '../../domain/actions';
import type { Action } from '../../domain/contracts';
import { aqiToPm25 } from '../../domain/recommend';
import type { Language } from '../../shared/i18n';
import { getTranslations } from '../../shared/i18n';
import {
  getCompareTranslations,
  type CompareTranslations,
} from '../../shared/i18n/compare-dict';
import { ActionComparisonPicker } from './action-comparison-picker';
import { CompareHeader } from './compare-header';
import {
  AssumptionsDisclosureCard,
  BaselineScenarioCard,
  MitigatedScenarioCard,
} from './scenario-cards';
import {
  buildCompareViewModel,
  evaluateActionComparison,
  type CompareViewModel,
} from './scenario-model';

const DEFAULT_CHOICE_A_ID = 'act-indoor-box-fan';
const DEFAULT_CHOICE_B_ID = 'act-mobility-electric-or-bus';

function ScenarioPairGrid({
  viewModel,
  baselineTitle,
  mitigatedTitle,
  dict,
  language,
}: {
  readonly viewModel: CompareViewModel;
  readonly baselineTitle: string;
  readonly mitigatedTitle: string;
  readonly dict: CompareTranslations;
  readonly language: Language;
}): JSX.Element {
  const { summary } = viewModel;
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <BaselineScenarioCard
        baselineIndoorPm25={summary.baselineIndoorPm25}
        baselineDoseUg={summary.baselineDoseUg}
        title={baselineTitle}
        dict={dict}
        locale={locale}
      />
      <MitigatedScenarioCard
        mitigatedIndoorPm25={summary.mitigatedIndoorPm25}
        mitigatedDoseUg={summary.mitigatedDoseUg}
        totalDoseReductionUg={viewModel.totalDoseReductionUg}
        totalCostRupees={summary.totalCostRupees}
        totalEmissionsSavedG={summary.totalCo2eSavedGrams}
        baselineIndoorPm25={summary.baselineIndoorPm25}
        activeCount={viewModel.activeCount}
        title={mitigatedTitle}
        dict={dict}
        locale={locale}
      />
    </div>
  );
}

function resolveActionPair(
  catalog: readonly Action[],
  choiceAId: string,
  choiceBId: string
): readonly [Action | undefined, Action | undefined] {
  const choiceA = catalog.find((a) => a.id === choiceAId) ?? catalog[0];
  const choiceB =
    catalog.find((a) => a.id === choiceBId) ?? catalog[1] ?? catalog[0];
  return [choiceA, choiceB];
}

/** Side-by-side comparative impact modeling evaluating baseline vs mitigated scenario outcomes. */
export function ComparePanel(): JSX.Element {
  const { profile, hourlySeries, selectedCity, completedActionIds, language } =
    useAppStore(
      useShallow((s) => ({
        profile: s.profile,
        hourlySeries: s.hourlySeries,
        selectedCity: s.selectedCity,
        completedActionIds: s.completedActionIds,
        language: s.language,
      }))
    );

  const t = getTranslations(language);
  const dict = getCompareTranslations(language);
  const catalog = useMemo(() => getActionCatalog(), []);
  const [choiceAId, setChoiceAId] = useState(DEFAULT_CHOICE_A_ID);
  const [choiceBId, setChoiceBId] = useState(DEFAULT_CHOICE_B_ID);

  const viewModel = useMemo(
    () =>
      buildCompareViewModel({
        profile,
        hourlySeries,
        selectedCity,
        completedActionIds,
      }),
    [profile, hourlySeries, selectedCity, completedActionIds]
  );

  const [choiceA, choiceB] = resolveActionPair(catalog, choiceAId, choiceBId);
  const liveOutdoorPm25 = aqiToPm25(viewModel.aqi.value);
  const comparison = useMemo(
    () =>
      choiceA && choiceB
        ? evaluateActionComparison({
            choiceA,
            choiceB,
            aqi: viewModel.aqi,
            profile,
          })
        : { doseDeltaUg: 0, emissionsDeltaGrams: 0, summary: '' },
    [choiceA, choiceB, viewModel.aqi, profile]
  );

  return (
    <section aria-labelledby="compare-heading" className="space-y-6">
      <CompareHeader
        title={t.compare.title}
        doseSavedPct={viewModel.doseSavedPct}
        activeCount={viewModel.activeCount}
        aqiValue={viewModel.aqi.value}
        outdoorPm25={viewModel.summary.outdoorPm25}
        estimateNote={t.common.estimateNote}
        dict={dict}
      />
      <ScenarioPairGrid
        viewModel={viewModel}
        baselineTitle={t.compare.baseline}
        mitigatedTitle={t.compare.mitigated}
        dict={dict}
        language={language}
      />
      {choiceA && choiceB ? (
        <ActionComparisonPicker
          actions={catalog}
          choiceA={choiceA}
          choiceB={choiceB}
          onSelectA={setChoiceAId}
          onSelectB={setChoiceBId}
          comparison={comparison}
          outdoorPm25={liveOutdoorPm25}
          home={profile.home}
          commuteKm={profile.lifestyle.commute.distanceKm}
          language={language}
          dict={dict}
        />
      ) : null}
      <AssumptionsDisclosureCard
        assumptions={viewModel.summary.assumptions}
        language={language}
        dict={dict}
      />
    </section>
  );
}

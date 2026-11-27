import { getActionCatalog } from '../../domain/actions';
import type {
  Action,
  AqiResult,
  DailyPlan,
  HouseholdProfile,
  HourlyReading,
} from '../../domain/contracts';
import {
  aqiToPm25,
  compareChoices,
  generateRecommendations,
  summarizeScenario,
  type ScenarioSummary,
} from '../../domain/recommend';
import type {
  ComparisonContext,
  ComparisonResult,
} from '../../domain/recommend/types';
import { basisPointsToWholePercent } from '../../domain/units';
import { selectCurrentAqi, selectDayPlan } from '../../shared/state/selectors';

/** Store slice required to construct live comparative scenario metrics. */
interface CompareModelInput {
  readonly profile: HouseholdProfile;
  readonly hourlySeries: {
    readonly readings: readonly HourlyReading[];
  } | null;
  readonly selectedCity: string;
  readonly completedActionIds: readonly string[];
}

/** Evaluated live scenario view model backing Compare panel cards. */
export interface CompareViewModel {
  readonly aqi: AqiResult;
  readonly plan: DailyPlan;
  readonly summary: ScenarioSummary;
  readonly activeCount: number;
  readonly totalDoseReductionUg: number;
  readonly doseSavedPct: number;
}

/** Input pair and live state required to compare two mitigation actions. */
interface ActionComparisonInput {
  readonly choiceA: Action;
  readonly choiceB: Action;
  readonly aqi: AqiResult;
  readonly profile: HouseholdProfile;
}

/** Builds live scenario metrics using shared selectors, summarizeScenario, and recommendations. */
export function buildCompareViewModel(
  input: CompareModelInput
): CompareViewModel {
  const selectorState = {
    selectedCity: input.selectedCity,
    hourlySeries: input.hourlySeries,
    profile: input.profile,
  };
  const aqi = selectCurrentAqi(selectorState);
  const plan = selectDayPlan(selectorState);
  const summary = summarizeScenario(
    input.profile,
    aqi,
    input.completedActionIds
  );
  const recRes = generateRecommendations(
    input.profile,
    aqi,
    plan,
    getActionCatalog()
  );
  const activeCount = recRes.ok
    ? recRes.value.items.filter((item) =>
        input.completedActionIds.includes(item.action.id)
      ).length
    : 0;
  const totalDoseReductionUg = Math.max(
    0,
    summary.baselineDoseUg - summary.mitigatedDoseUg
  );
  const doseSavedPct = basisPointsToWholePercent(summary.doseSavedBasisPoints);

  return {
    aqi,
    plan,
    summary,
    activeCount,
    totalDoseReductionUg,
    doseSavedPct,
  };
}

/** Evaluates a two-action comparison under live outdoor PM2.5, home envelope, and commute distance. */
export function evaluateActionComparison(
  input: ActionComparisonInput
): ComparisonResult {
  const outdoorPm25 = aqiToPm25(input.aqi.value);
  const context: ComparisonContext = {
    currentOutdoorPm25: outdoorPm25,
    home: input.profile.home,
    commuteKm: input.profile.lifestyle.commute.distanceKm,
  };
  return compareChoices(input.choiceA, input.choiceB, context);
}

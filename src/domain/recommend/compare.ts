import type { Action, HomeProfile } from '../contracts';
import { calculateIndoorPm25, calculateInhaledDose } from '../exposure';
import { toInteger } from '../units';
import { COMMUTE_EMISSION_FACTORS } from './constants';
import type { ComparisonContext, ComparisonResult } from './types';

/** Default architectural and atmospheric context for action comparison. */
const DEFAULT_CONTEXT: ComparisonContext = {
  commuteKm: 12,
  currentOutdoorPm25: 250,
  home: {
    type: 'apartment',
    floorAreaM2: 90,
    ceilingHeightCm: 280,
    sealing: 'average',
    purifierCadrM3h: null,
    hasKitchenExhaust: true,
    cookingFuel: 'png',
  },
};

/** Evaluates isolated single-action inhaled dose mitigation for a standard adult. */
function evaluateActionDose(
  action: Action,
  outdoorPm25: number,
  home: HomeProfile
): number {
  const indoorRes = calculateIndoorPm25(outdoorPm25, home, false);
  const indoorPm25 = indoorRes.ok
    ? indoorRes.value
    : toInteger(outdoorPm25 * 0.7);
  let saved = 0;

  for (const effect of action.effects) {
    if (effect.type === 'indoorPm25Reduction') {
      const factor = 1 - effect.reductionBasisPoints / 10000;
      const mitigated = Math.max(0, toInteger(indoorPm25 * factor));
      const base = calculateInhaledDose(indoorPm25, 1320, 'adult');
      const next = calculateInhaledDose(mitigated, 1320, 'adult');
      if (base.ok && next.ok) saved += base.value - next.value;
    } else if (effect.type === 'exposureReduction') {
      const base = calculateInhaledDose(outdoorPm25, 120, 'adult');
      const next = calculateInhaledDose(
        outdoorPm25,
        120,
        'adult',
        effect.reductionBasisPoints
      );
      if (base.ok && next.ok) saved += base.value - next.value;
    }
  }
  return toInteger(saved);
}

/** Evaluates isolated single-action round-trip CO2e savings. */
function evaluateActionEmissions(action: Action, commuteKm: number): number {
  const emissionsEffect = action.effects.find(
    (e) => e.type === 'emissionsReduction'
  );
  if (emissionsEffect && emissionsEffect.type === 'emissionsReduction') {
    const baselineFactor = COMMUTE_EMISSION_FACTORS.twoWheeler;
    const delta = Math.max(0, baselineFactor - emissionsEffect.co2eGramsPerKm);
    return toInteger(delta * commuteKm * 2);
  }
  if (action.id.toLowerCase().includes('metro')) {
    const delta = Math.max(
      0,
      COMMUTE_EMISSION_FACTORS.twoWheeler - COMMUTE_EMISSION_FACTORS.metro
    );
    return toInteger(delta * commuteKm * 2);
  }
  return 0;
}

/** Compares particulate dose and greenhouse emissions deltas between two actions. */
export function compareChoices(
  a: Action,
  b: Action,
  context: ComparisonContext = DEFAULT_CONTEXT
): ComparisonResult {
  const doseA = evaluateActionDose(a, context.currentOutdoorPm25, context.home);
  const doseB = evaluateActionDose(b, context.currentOutdoorPm25, context.home);
  const emissionsA = evaluateActionEmissions(a, context.commuteKm);
  const emissionsB = evaluateActionEmissions(b, context.commuteKm);

  const doseDeltaUg = doseA - doseB;
  const emissionsDeltaGrams = emissionsA - emissionsB;

  const doseText =
    doseDeltaUg >= 0
      ? `"${a.title}" delivers ${doseDeltaUg} µg greater dose reduction`
      : `"${b.title}" delivers ${Math.abs(doseDeltaUg)} µg greater dose reduction`;

  const emissionsText =
    emissionsDeltaGrams >= 0
      ? `saves ${emissionsDeltaGrams} g more CO2e daily`
      : `saves ${Math.abs(emissionsDeltaGrams)} g less CO2e daily`;

  const summary = `Option comparison: ${doseText} and ${emissionsText}.`;

  return {
    doseDeltaUg,
    emissionsDeltaGrams,
    summary,
  };
}

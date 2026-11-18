import type {
  Action,
  CookingFuel,
  CommuteMode,
  HouseholdProfile,
  SealingClass,
} from '../contracts';
import type { EligibilityResult } from './types';

/** Evaluates cooking fuel suitability for biomass cookstove interventions. */
export function isBiomassEligible(
  action: Action,
  fuel: CookingFuel
): EligibilityResult {
  const isBiomassAction =
    action.id.toLowerCase().includes('biomass') ||
    action.title.toLowerCase().includes('biomass');
  if (isBiomassAction && fuel !== 'biomass') {
    return {
      eligible: false,
      reason: `Biomass replacement requires biomass fuel; home uses '${fuel}'.`,
    };
  }
  return { eligible: true, reason: 'Biomass condition satisfied.' };
}

/** Evaluates household exhaust infrastructure for kitchen ventilation interventions. */
export function isKitchenExhaustEligible(
  action: Action,
  hasKitchenExhaust: boolean
): EligibilityResult {
  const isExhaustAction =
    action.id.toLowerCase().includes('exhaust') ||
    action.title.toLowerCase().includes('exhaust');
  if (isExhaustAction && !hasKitchenExhaust) {
    return {
      eligible: false,
      reason: 'Kitchen exhaust maintenance requires existing exhaust fan.',
    };
  }
  return { eligible: true, reason: 'Kitchen exhaust condition satisfied.' };
}

/** Evaluates commute modality transition compatibility for transit interventions. */
export function isCommuteShiftEligible(
  action: Action,
  currentMode: CommuteMode
): EligibilityResult {
  const idLower = action.id.toLowerCase();
  const titleLower = action.title.toLowerCase();
  const isMetroShift =
    (idLower.includes('metro') || titleLower.includes('metro')) &&
    action.category === 'mobility';
  if (isMetroShift && currentMode === 'metro') {
    return {
      eligible: false,
      reason:
        'Commute shift to metro inapplicable; already commuting via metro.',
    };
  }
  const isMotorizedShift =
    (idLower.includes('carpool') || isMetroShift) &&
    action.category === 'mobility';
  if (isMotorizedShift && (currentMode === 'walk' || currentMode === 'cycle')) {
    return {
      eligible: false,
      reason: `Already using zero-emission active mobility ('${currentMode}').`,
    };
  }
  return { eligible: true, reason: 'Commute transition condition satisfied.' };
}

/** Evaluates building envelope air tightness for sealing interventions. */
export function isSealingEligible(
  action: Action,
  sealing: SealingClass
): EligibilityResult {
  const isSealingAction =
    action.id.toLowerCase().includes('seal') ||
    action.id.toLowerCase().includes('weatherstrip') ||
    action.title.toLowerCase().includes('seal') ||
    action.title.toLowerCase().includes('weatherstrip');
  if (isSealingAction && sealing === 'tight') {
    return {
      eligible: false,
      reason: 'Building envelope is already tight; sealing gaps not needed.',
    };
  }
  return { eligible: true, reason: 'Building sealing condition satisfied.' };
}

/** Runs all household and architectural filtering rules for an action intervention. */
export function checkActionEligibility(
  action: Action,
  profile: HouseholdProfile
): EligibilityResult {
  const biomassCheck = isBiomassEligible(action, profile.home.cookingFuel);
  if (!biomassCheck.eligible) return biomassCheck;

  const exhaustCheck = isKitchenExhaustEligible(
    action,
    profile.home.hasKitchenExhaust
  );
  if (!exhaustCheck.eligible) return exhaustCheck;

  const commuteCheck = isCommuteShiftEligible(
    action,
    profile.lifestyle.commute.mode
  );
  if (!commuteCheck.eligible) return commuteCheck;

  const sealingCheck = isSealingEligible(action, profile.home.sealing);
  if (!sealingCheck.eligible) return sealingCheck;

  return {
    eligible: true,
    reason: 'Action meets all household eligibility criteria.',
  };
}

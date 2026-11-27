import { type Result, err, ok } from '../../shared/result';
import type {
  AiAnswer,
  AiError,
  AiPlanNarrative,
  GroundingFact,
} from '../contracts';
import { getActionById } from '../../domain/actions';

const DEVANAGARI_DIGITS = '०१२३४५६७८९';

/** Normalizes Devanagari digits to ASCII and strips pollutant/filter identifier numerals. */
function normalizeTextForGrounding(text: string): string {
  const asciiDigits = text.replace(/[०-९]/g, (ch) =>
    String(DEVANAGARI_DIGITS.indexOf(ch))
  );
  return asciiDigits
    .replace(/(?:\bPM|पीएम)\s*(?:2\.5|10)\b/gi, ' ')
    .replace(/(?:\bN\s*95|एन\s*95|\bFFP\s*2|\bMERV[-\s]*13)\b/gi, ' ')
    .replace(/\bCO2e?\b/gi, ' ')
    .replace(/m[²³23]/gi, ' ');
}

function extractStandaloneNumbers(text: string): number[] {
  const normalized = normalizeTextForGrounding(text);
  const matches = normalized.match(/(?<![A-Za-z0-9])\d+(?:\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

/** Extracts all numbers present in an array of grounding facts and their descriptive text. */
function collectAllowedNumbers(facts: readonly GroundingFact[]): Set<number> {
  const allowed = new Set<number>([0, 1, 24]);
  for (const f of facts) {
    if (typeof f.value === 'number' && !Number.isNaN(f.value)) {
      allowed.add(f.value);
      allowed.add(Math.round(f.value));
      allowed.add(Math.floor(f.value));
      allowed.add(Math.ceil(f.value));
    }
    for (const num of extractStandaloneNumbers(f.text)) {
      allowed.add(num);
    }
  }
  return allowed;
}

/** Validates that all numerals in a text string originate from the allowed facts set. */
function validateNumeralsInText(text: string, allowed: Set<number>): boolean {
  for (const num of extractStandaloneNumbers(text)) {
    if (!allowed.has(num)) {
      return false;
    }
  }
  return true;
}

/** Validates that all referenced action IDs exist in the catalog and supplied facts. */
function validateActionIds(
  actionIds: readonly string[],
  facts: readonly GroundingFact[]
): boolean {
  const factIds = new Set(facts.map((f) => f.id));
  for (const id of actionIds) {
    if (!factIds.has(id) || !getActionById(id)) {
      return false;
    }
  }
  return true;
}

/** Validates AI plan narrative grounding against domain catalog and facts. */
export function validatePlanGrounding(
  narrative: AiPlanNarrative,
  facts: readonly GroundingFact[]
): Result<AiPlanNarrative, AiError> {
  const actionIds = narrative.highlights.map((h) => h.actionId);
  if (!validateActionIds(actionIds, facts)) {
    return err({
      code: 'groundingViolation',
      message: 'Unknown or ungrounded actionId in plan narrative highlights.',
    });
  }

  const allowedNumbers = collectAllowedNumbers(facts);
  const textBlob = `${narrative.summary} ${narrative.caution} ${narrative.highlights.map((h) => h.reason).join(' ')}`;
  if (!validateNumeralsInText(textBlob, allowedNumbers)) {
    return err({
      code: 'groundingViolation',
      message: 'Unverified numeric claim present in plan narrative.',
    });
  }

  return ok(narrative);
}

/** Validates AI answer grounding against domain catalog and facts. */
export function validateAnswerGrounding(
  answer: AiAnswer,
  facts: readonly GroundingFact[]
): Result<AiAnswer, AiError> {
  if (!validateActionIds(answer.usedActionIds, facts)) {
    return err({
      code: 'groundingViolation',
      message: 'Unknown or ungrounded actionId in answer response.',
    });
  }

  const allowedNumbers = collectAllowedNumbers(facts);
  if (!validateNumeralsInText(answer.answer, allowedNumbers)) {
    return err({
      code: 'groundingViolation',
      message: 'Unverified numeric claim present in answer.',
    });
  }

  return ok(answer);
}

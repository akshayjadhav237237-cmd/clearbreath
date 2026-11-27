import type {
  AiAnswer,
  AiError,
  AiPlanNarrative,
  AiProvider,
  LlmSafeContext,
} from '../contracts';
import { type Result, ok } from '../../shared/result';
import {
  EN_CAUTION_NOTES,
  EN_DEFAULT_ANSWERS,
  EN_SEVERITY_SUMMARIES,
} from './local-text-en';
import {
  HI_CAUTION_NOTES,
  HI_DEFAULT_ANSWERS,
  HI_SEVERITY_SUMMARIES,
} from './local-text-hi';

const HI_CITIES: Readonly<Record<string, string>> = {
  Delhi: 'दिल्ली',
  Gurugram: 'गुरुग्राम',
  Noida: 'नोएडा',
  Mumbai: 'मुंबई',
  Pune: 'पुणे',
  Kolkata: 'कोलकाता',
  Lucknow: 'लखनऊ',
  Patna: 'पटना',
  Ahmedabad: 'अहमदाबाद',
  Bengaluru: 'बेंगलुरु',
  Chennai: 'चेन्नई',
  Hyderabad: 'हैदराबाद',
};

const MEDICAL_KEYWORDS: readonly string[] = [
  'fever',
  'cough',
  'chest pain',
  'medicine',
  'inhaler',
  'बुखार',
  'खांसी',
  'खाँसी',
  'सीने में दर्द',
  'दवाई',
  'इनहेलर',
  'सांस',
];

function isMedicalQuery(question: string | null): boolean {
  const q = (question ?? '').toLowerCase();
  return MEDICAL_KEYWORDS.some((kw) => q.includes(kw));
}

function formatCityLabel(city: string, isHi: boolean): string {
  return isHi ? (HI_CITIES[city] ?? city) : city;
}

/** Local deterministic AI provider generating explanations from verified facts without network calls. */
export class LocalProvider implements AiProvider {
  readonly id = 'local' as const;

  /** Synthesizes an explanatory daily narrative from allowlisted context facts. */
  async explainPlan(
    ctx: LlmSafeContext
  ): Promise<Result<AiPlanNarrative, AiError>> {
    const isHi = ctx.language === 'hi';
    const summaries = isHi ? HI_SEVERITY_SUMMARIES : EN_SEVERITY_SUMMARIES;
    const cautions = isHi ? HI_CAUTION_NOTES : EN_CAUTION_NOTES;

    const baseSummary = summaries[ctx.aqiCategory] ?? summaries.moderate;
    const summary = `${formatCityLabel(ctx.city, isHi)}: ${baseSummary}`;
    const caution = cautions[ctx.sensitivityLevel] ?? cautions.low ?? '';

    const actionFacts = ctx.facts
      .filter((f) => f.kind === 'action')
      .slice(0, 5);
    const highlights = actionFacts.map((f) => ({
      actionId: f.id,
      reason: f.text.slice(0, 200),
    }));

    return ok({ summary, highlights, caution });
  }

  /** Formulates a grounded response to user questions using supplied facts. */
  async answer(ctx: LlmSafeContext): Promise<Result<AiAnswer, AiError>> {
    const isHi = ctx.language === 'hi';
    const defaults = isHi ? HI_DEFAULT_ANSWERS : EN_DEFAULT_ANSWERS;

    if (isMedicalQuery(ctx.question)) {
      return ok({
        answer: defaults.medicalDisclaimer,
        usedActionIds: [],
        refusal: false,
      });
    }

    const actionFacts = ctx.facts
      .filter((f) => f.kind === 'action')
      .slice(0, 3);
    const usedActionIds = actionFacts.map((f) => f.id);
    const answer =
      actionFacts.length > 0
        ? `${defaults.general} ${actionFacts.map((f) => f.text).join(' ')}`.slice(
            0,
            600
          )
        : defaults.general;

    return ok({
      answer,
      usedActionIds,
      refusal: false,
    });
  }
}

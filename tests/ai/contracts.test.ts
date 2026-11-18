import { describe, expect, it } from 'vitest';
import type {
  AiAnswer,
  AiError,
  AiErrorCode,
  AiPlanNarrative,
  AiProvider,
  AirDataError,
  AirDataErrorCode,
  AirDataProvider,
  BudgetBand,
  GroundingFact,
  HourlySeries,
  Language,
  LlmSafeContext,
} from '../../src/ai';
import { AI_LAYER, aiAnswerSchema, aiPlanNarrativeSchema } from '../../src/ai';

describe('AI marker and narrative schema validation', () => {
  it('validates AI layer marker token', () => {
    expect(AI_LAYER).toBe('ai');
  });

  it('validates a conformant plan narrative payload', () => {
    const validNarrative: AiPlanNarrative = {
      summary: 'Stay indoors during morning inversion.',
      highlights: [
        {
          actionId: 'act-indoor-seal-gaps',
          reason: 'Prevents 20% infiltration.',
        },
      ],
      caution: 'Children should avoid outdoor exertion.',
    };

    const parsed = aiPlanNarrativeSchema.safeParse(validNarrative);
    expect(parsed.success).toBe(true);
  });

  it('rejects a plan narrative exceeding character limits', () => {
    const invalidNarrative = {
      summary: 'A'.repeat(401),
      highlights: [],
      caution: 'Caution message.',
    };

    const parsed = aiPlanNarrativeSchema.safeParse(invalidNarrative);
    expect(parsed.success).toBe(false);
  });
});

describe('AI answer schema validation', () => {
  it('validates a conformant question answer payload', () => {
    const validAnswer: AiAnswer = {
      answer: 'Use the Metro for commute to reduce emissions by 122g CO2e/km.',
      usedActionIds: ['act-mobility-metro-shift'],
      refusal: false,
    };

    const parsed = aiAnswerSchema.safeParse(validAnswer);
    expect(parsed.success).toBe(true);
  });

  it('rejects an answer exceeding character limits', () => {
    const invalidAnswer = {
      answer: 'A'.repeat(601),
      usedActionIds: [],
      refusal: false,
    };

    const parsed = aiAnswerSchema.safeParse(invalidAnswer);
    expect(parsed.success).toBe(false);
  });
});

describe('AI and air data contract interfaces', () => {
  it('validates type compatibility for AI and Air Data contracts', () => {
    const lang: Language = 'hi';
    const errCode: AiErrorCode = 'rateLimited';
    const aiErr: AiError = { code: errCode, message: 'Too many requests' };
    const airErrCode: AirDataErrorCode = 'invalidCity';
    const airErr: AirDataError = { code: airErrCode, message: 'Unknown city' };
    const fact: GroundingFact = {
      id: 'f1',
      kind: 'aqi',
      text: 'AQI 350',
      value: 350,
    };
    const band: BudgetBand = 'medium';
    const ctx: LlmSafeContext = {
      city: 'Delhi',
      aqiCategory: 'severe',
      aqiValue: 420,
      sensitivityLevel: 'high',
      ageGroupsPresent: ['child', 'older'],
      homeType: 'apartment',
      sealing: 'average',
      cookingFuel: 'png',
      commuteMode: 'metro',
      budgetBand: band,
      language: lang,
      facts: [fact],
      question: 'Should I open windows?',
    };
    const series: HourlySeries = {
      city: 'Delhi',
      readings: [{ hour: 0, pm25: 180, pm10: 290 }],
      isSample: true,
    };
    const provider: AiProvider = {
      id: 'local',
      explainPlan: async () => ({
        ok: true,
        value: { summary: 's', highlights: [], caution: 'c' },
      }),
      answer: async () => ({
        ok: true,
        value: { answer: 'a', usedActionIds: [], refusal: false },
      }),
    };
    const airProvider: AirDataProvider = {
      id: 'sample',
      fetchHourly: async () => ({ ok: true, value: series }),
    };

    expect(aiErr.code).toBe('rateLimited');
    expect(airErr.code).toBe('invalidCity');
    expect(ctx.city).toBe('Delhi');
    expect(series.isSample).toBe(true);
    expect(provider.id).toBe('local');
    expect(airProvider.id).toBe('sample');
  });
});

import { describe, expect, it } from 'vitest';
import type { FetchPort } from '../../../src/shared/ports';
import { isErr, isOk } from '../../../src/shared/result';
import type { LlmSafeContext } from '../../../src/ai/contracts';
import { GeminiProvider, LocalProvider } from '../../../src/ai/providers';

const TEST_API_KEY = 'secret-gemini-api-key-value';
const API_KEY_HEADER = 'x-goog-api-key';
const FORBIDDEN = [
  'temperature',
  'topP',
  'top_p',
  'topK',
  'top_k',
  'thinkingBudget',
  'candidateCount',
  'candidate_count',
] as const;

const CTX: LlmSafeContext = {
  city: 'Delhi',
  aqiCategory: 'severe',
  aqiValue: 430,
  sensitivityLevel: 'high',
  ageGroupsPresent: ['child', 'older'],
  homeType: 'apartment',
  sealing: 'average',
  cookingFuel: 'png',
  commuteMode: 'metro',
  budgetBand: 'medium',
  language: 'en',
  facts: [{ id: 'act-indoor-seal-gaps', kind: 'action', text: 'Seal gaps.' }],
  question: null,
};

const OK_PLAN = { summary: 'Good', highlights: [], caution: 'Safe' };
const OK_ANS = { answer: 'Stay in.', usedActionIds: [], refusal: false };

interface Capture {
  url: string;
  headers: Record<string, string>;
  rawBody: string;
  genConfig: Record<string, unknown>;
}

function captureFetch(payload: unknown): { fetch: FetchPort; cap: Capture } {
  const cap: Capture = { url: '', headers: {}, rawBody: '', genConfig: {} };
  const fetch: FetchPort = {
    fetch: async (input, init) => {
      cap.url = String(input);
      cap.headers = (init?.headers as Record<string, string>) ?? {};
      cap.rawBody = typeof init?.body === 'string' ? init.body : '';
      const b = JSON.parse(cap.rawBody || '{}') as {
        generationConfig?: Record<string, unknown>;
      };
      cap.genConfig = b.generationConfig ?? {};
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            { content: { parts: [{ text: JSON.stringify(payload) }] } },
          ],
        }),
      } as unknown as Response;
    },
  };
  return { fetch, cap };
}

const mkProvider = (fetch: FetchPort) =>
  new GeminiProvider(TEST_API_KEY, fetch);

describe('LocalProvider deterministic explanations and answers', () => {
  it('generates English and Hindi plan narratives', async () => {
    const provider = new LocalProvider();
    const en = await provider.explainPlan(CTX);
    expect(isOk(en)).toBe(true);
    if (isOk(en)) {
      expect(en.value.summary).toContain('Delhi');
      expect(en.value.highlights).toHaveLength(1);
    }
    const hi = await provider.explainPlan({ ...CTX, language: 'hi' });
    expect(isOk(hi)).toBe(true);
    if (isOk(hi)) expect(hi.value.summary).toContain('Delhi');
  });

  it('provides a medical disclaimer when symptoms are mentioned', async () => {
    const res = await new LocalProvider().answer({
      ...CTX,
      question: 'I have severe cough and fever, what medicine should I take?',
    });
    expect(isOk(res)).toBe(true);
    if (isOk(res)) {
      expect(res.value.answer.toLowerCase()).toContain('medical');
      expect(res.value.usedActionIds).toHaveLength(0);
    }
  });
});

describe('GeminiProvider REST headers, thinkingLevel, and forbidden params', () => {
  it('puts API key only in x-goog-api-key header and omits legacy params', async () => {
    const { fetch, cap } = captureFetch(OK_PLAN);
    expect(isOk(await mkProvider(fetch).explainPlan(CTX))).toBe(true);
    expect(cap.url).not.toContain(TEST_API_KEY);
    expect(cap.rawBody).not.toContain(TEST_API_KEY);
    expect(cap.headers[API_KEY_HEADER]).toBe(TEST_API_KEY);
    for (const [k, v] of Object.entries(cap.headers)) {
      if (k !== API_KEY_HEADER) expect(v).not.toContain(TEST_API_KEY);
    }
    const tc = (cap.genConfig.thinkingConfig ?? {}) as Record<string, unknown>;
    expect(tc.thinkingLevel).toBe('low');
    expect(cap.genConfig.responseMimeType).toBe('application/json');
    const serialized = JSON.stringify(cap.genConfig);
    for (const key of FORBIDDEN) {
      expect(key in cap.genConfig).toBe(false);
      expect(key in tc).toBe(false);
      expect(serialized).not.toContain(`"${key}"`);
    }
  });
});

describe('GeminiProvider REST schema and response validation', () => {
  it('sends responseJsonSchema for plan and answer and rejects bad JSON', async () => {
    const planCap = captureFetch(OK_PLAN);
    await mkProvider(planCap.fetch).explainPlan(CTX);
    const pSchema = planCap.cap.genConfig.responseJsonSchema as {
      required?: string[];
    };
    expect(pSchema.required).toEqual(['summary', 'highlights', 'caution']);

    const ansCap = captureFetch(OK_ANS);
    const ansRes = await mkProvider(ansCap.fetch).answer({
      ...CTX,
      question: 'Should I stay indoors?',
    });
    expect(isOk(ansRes)).toBe(true);
    const aSchema = ansCap.cap.genConfig.responseJsonSchema as {
      required?: string[];
    };
    expect(aSchema.required).toEqual(['answer', 'usedActionIds', 'refusal']);

    const badFetch: FetchPort = {
      fetch: async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: 'bad' }] } }],
          }),
        }) as unknown as Response,
    };
    const errRes = await mkProvider(badFetch).explainPlan(CTX);
    expect(isErr(errRes)).toBe(true);
    if (isErr(errRes)) expect(errRes.error.code).toBe('schema');
  });
});

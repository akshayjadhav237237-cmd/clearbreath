import { describe, expect, it } from 'vitest';
import type { FetchPort } from '../../../src/shared/ports';
import { isErr, isOk } from '../../../src/shared/result';
import type { LlmSafeContext } from '../../../src/ai/contracts';
import { GeminiProvider, LocalProvider } from '../../../src/ai/providers';

const BASE_CONTEXT: LlmSafeContext = {
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
  facts: [
    { id: 'act-indoor-seal-gaps', kind: 'action', text: 'Seal window gaps.' },
  ],
  question: null,
};

describe('LocalProvider deterministic explanations and answers', () => {
  it('generates an English plan narrative with highlights and caution', async () => {
    const provider = new LocalProvider();
    const res = await provider.explainPlan(BASE_CONTEXT);
    expect(isOk(res)).toBe(true);
    if (isOk(res)) {
      expect(res.value.summary).toContain('Delhi');
      expect(res.value.highlights).toHaveLength(1);
      expect(res.value.highlights[0]?.actionId).toBe('act-indoor-seal-gaps');
      expect(res.value.caution.length).toBeGreaterThan(0);
    }
  });

  it('generates a Hindi plan narrative when requested', async () => {
    const provider = new LocalProvider();
    const res = await provider.explainPlan({ ...BASE_CONTEXT, language: 'hi' });
    expect(isOk(res)).toBe(true);
    if (isOk(res)) {
      expect(res.value.summary).toContain('Delhi');
      expect(res.value.summary.length).toBeGreaterThan(10);
    }
  });

  it('provides a medical disclaimer when health symptoms are mentioned', async () => {
    const provider = new LocalProvider();
    const res = await provider.answer({
      ...BASE_CONTEXT,
      question: 'I have severe cough and fever, what medicine should I take?',
    });
    expect(isOk(res)).toBe(true);
    if (isOk(res)) {
      expect(res.value.answer.toLowerCase()).toContain('medical');
      expect(res.value.usedActionIds).toHaveLength(0);
    }
  });
});

describe('GeminiProvider REST request headers and schema', () => {
  it('sends POST request with x-goog-api-key header and validates schema', async () => {
    let capturedUrl = '';
    let capturedHeader = '';
    const fakeFetcher: FetchPort = {
      fetch: async (input, init) => {
        capturedUrl = String(input);
        capturedHeader =
          (init?.headers as Record<string, string>)['x-goog-api-key'] ?? '';
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        summary: 'Good day',
                        highlights: [],
                        caution: 'Safe',
                      }),
                    },
                  ],
                },
              },
            ],
          }),
        } as unknown as Response;
      },
    };

    const provider = new GeminiProvider('test-key', fakeFetcher);
    const res = await provider.explainPlan(BASE_CONTEXT);
    expect(isOk(res)).toBe(true);
    expect(capturedUrl).not.toContain('test-key');
    expect(capturedHeader).toBe('test-key');
  });

  it('rejects schema violations and malformed JSON payloads', async () => {
    const fakeFetcher: FetchPort = {
      fetch: async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: 'not json' }] } }],
          }),
        }) as unknown as Response,
    };

    const provider = new GeminiProvider('test-key', fakeFetcher);
    const res = await provider.explainPlan(BASE_CONTEXT);
    expect(isErr(res)).toBe(true);
    if (isErr(res)) expect(res.error.code).toBe('schema');
  });
});

describe('GeminiProvider HTTP error code mappings', () => {
  it('maps HTTP 401/403 to invalidKey and 429 to rateLimited', async () => {
    const fakeFetcher: FetchPort = {
      fetch: async (_input, init) => {
        const key = (init?.headers as Record<string, string>)['x-goog-api-key'];
        const status = key === 'bad-key' ? 401 : 429;
        return { ok: false, status } as Response;
      },
    };

    const authProvider = new GeminiProvider('bad-key', fakeFetcher);
    const authRes = await authProvider.explainPlan(BASE_CONTEXT);
    expect(isErr(authRes)).toBe(true);
    if (isErr(authRes)) expect(authRes.error.code).toBe('invalidKey');

    const rateProvider = new GeminiProvider('valid-key', fakeFetcher);
    const rateRes = await rateProvider.explainPlan(BASE_CONTEXT);
    expect(isErr(rateRes)).toBe(true);
    if (isErr(rateRes)) expect(rateRes.error.code).toBe('rateLimited');
  });
});

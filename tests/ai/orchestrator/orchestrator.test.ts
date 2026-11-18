import { describe, expect, it } from 'vitest';
import type {
  Clock,
  FetchPort,
  RandomPort,
  SleepPort,
} from '../../../src/shared/ports';
import type { LlmSafeContext } from '../../../src/ai/contracts';
import { ApiKeyHolder } from '../../../src/ai/key-holder';
import { LocalProvider } from '../../../src/ai/providers/local-provider';
import { AiOrchestrator } from '../../../src/ai/orchestrator/orchestrator';

const VALID_KEY = 'valid-key';
const ACTION_SEAL_GAPS = 'act-indoor-seal-gaps';

function createMockDeps(
  fetchImpl: (input: RequestInfo | URL) => Promise<Response>
) {
  const clock: Clock = { now: () => 1000 };
  const sleepPort: SleepPort = {
    sleep: async (ms: number, signal?: AbortSignal) => {
      return new Promise((resolve) => {
        const timer = setTimeout(resolve, ms);
        signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          resolve();
        });
      });
    },
  };
  const randomPort: RandomPort = { random: () => 0 };
  const keyHolder = new ApiKeyHolder();
  const localProvider = new LocalProvider();
  const fetcher: FetchPort = { fetch: fetchImpl };
  return { clock, sleepPort, randomPort, keyHolder, localProvider, fetcher };
}

const sampleContext: LlmSafeContext = {
  city: 'Delhi',
  aqiCategory: 'severe',
  aqiValue: 412,
  sensitivityLevel: 'high',
  ageGroupsPresent: ['child', 'older'],
  homeType: 'apartment',
  sealing: 'average',
  cookingFuel: 'lpg',
  commuteMode: 'metro',
  budgetBand: 'medium',
  language: 'en',
  facts: [
    { id: 'aqi-1', kind: 'aqi', text: 'Severe AQI 412', value: 412 },
    { id: ACTION_SEAL_GAPS, kind: 'action', text: 'Seal window gaps' },
  ],
  question: null,
};

describe('AiOrchestrator consent and key fallbacks', () => {
  it('makes zero network requests when consent is false', async () => {
    let fetchCalled = false;
    const deps = createMockDeps(async () => {
      fetchCalled = true;
      return new Response('{}', { status: 200 });
    });
    deps.keyHolder.setKey(VALID_KEY);
    const orchestrator = new AiOrchestrator(deps);

    const res = await orchestrator.getPlanNarrative(sampleContext, {
      consent: false,
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.source).toBe('local');
    expect(fetchCalled).toBe(false);
  });

  it('falls back to local provider when API key is missing', async () => {
    let fetchCalled = false;
    const deps = createMockDeps(async () => {
      fetchCalled = true;
      return new Response('{}', { status: 200 });
    });
    const orchestrator = new AiOrchestrator(deps);

    const res = await orchestrator.getPlanNarrative(sampleContext, {
      consent: true,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.source).toBe('local');
      expect(res.value.fallbackReason).toContain('API key');
    }
    expect(fetchCalled).toBe(false);
  });
});

describe('AiOrchestrator cloud narrative generation', () => {
  it('serves cloud narrative and caches subsequent requests', async () => {
    let fetchCalls = 0;
    const validGeminiJson = JSON.stringify({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  summary: 'Plan for Severe AQI 412 in Delhi.',
                  highlights: [
                    {
                      actionId: ACTION_SEAL_GAPS,
                      reason: 'Reduces particulate infiltration.',
                    },
                  ],
                  caution: 'Keep windows shut.',
                }),
              },
            ],
          },
        },
      ],
    });

    const deps = createMockDeps(async () => {
      fetchCalls += 1;
      return new Response(validGeminiJson, { status: 200 });
    });
    deps.keyHolder.setKey(VALID_KEY);
    const orchestrator = new AiOrchestrator(deps);

    const res1 = await orchestrator.getPlanNarrative(sampleContext, {
      consent: true,
    });
    expect(res1.ok).toBe(true);
    if (res1.ok) expect(res1.value.source).toBe('gemini');
    expect(fetchCalls).toBe(1);

    const res2 = await orchestrator.getPlanNarrative(sampleContext, {
      consent: true,
    });
    expect(res2.ok).toBe(true);
    if (res2.ok) expect(res2.value.source).toBe('gemini');
    expect(fetchCalls).toBe(1);
  });
});

describe('AiOrchestrator cloud question answering', () => {
  it('serves grounded answer from cloud Gemini and caches it', async () => {
    const validAnswerJson = JSON.stringify({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  answer: 'Air quality in Delhi is severe with AQI 412.',
                  usedActionIds: [ACTION_SEAL_GAPS],
                  refusal: false,
                }),
              },
            ],
          },
        },
      ],
    });

    const deps = createMockDeps(
      async () => new Response(validAnswerJson, { status: 200 })
    );
    deps.keyHolder.setKey(VALID_KEY);
    const orchestrator = new AiOrchestrator(deps);
    const qContext = {
      ...sampleContext,
      question: 'What is the air quality today?',
    };

    const res = await orchestrator.getAnswer(qContext, { consent: true });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.source).toBe('gemini');
      expect(res.value.data.answer).toContain('severe');
    }
  });
});

import { describe, expect, it } from 'vitest';
import type {
  Clock,
  FetchPort,
  RandomPort,
  SleepPort,
} from '../../../src/shared/ports';
import { isErr, isOk } from '../../../src/shared/result';
import type { LlmSafeContext } from '../../../src/ai/contracts';
import { ApiKeyHolder } from '../../../src/ai/key-holder';
import { AiOrchestrator } from '../../../src/ai/orchestrator';
import { GeminiProvider, LocalProvider } from '../../../src/ai/providers';

const TEST_API_KEY = 'secret-gemini-api-key-value';
const MODEL_UNAVAILABLE_CODE = 'modelUnavailable';

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
  question: 'What should we do today?',
};

function createOrchestratorDeps(fetcher: FetchPort) {
  const clock: Clock = { now: () => 1000 };
  const sleepPort: SleepPort = {
    sleep: (ms) => (ms >= 10000 ? new Promise(() => {}) : Promise.resolve()),
  };
  const randomPort: RandomPort = { random: () => 0 };
  const keyHolder = new ApiKeyHolder();
  keyHolder.setKey(TEST_API_KEY);
  return {
    clock,
    sleepPort,
    randomPort,
    keyHolder,
    localProvider: new LocalProvider(),
    fetcher,
  };
}

const makeHttpFetch = (status: number, body: string): FetchPort => ({
  fetch: async () =>
    ({ ok: false, status, text: async () => body }) as Response,
});

describe('GeminiProvider auth, rate limit, and unavailable status mappings', () => {
  it('maps HTTP 401/403 to invalidKey and 429 to rateLimited', async () => {
    const fakeFetcher: FetchPort = {
      fetch: async (_input, init) => {
        const key = (init?.headers as Record<string, string>)['x-goog-api-key'];
        return { ok: false, status: key === 'bad-key' ? 401 : 429 } as Response;
      },
    };

    const authRes = await new GeminiProvider(
      'bad-key',
      fakeFetcher
    ).explainPlan(BASE_CONTEXT);
    expect(isErr(authRes)).toBe(true);
    if (isErr(authRes)) expect(authRes.error.code).toBe('invalidKey');

    const rateRes = await new GeminiProvider(
      TEST_API_KEY,
      fakeFetcher
    ).explainPlan(BASE_CONTEXT);
    expect(isErr(rateRes)).toBe(true);
    if (isErr(rateRes)) expect(rateRes.error.code).toBe('rateLimited');
  });

  it('maps 404, deprecated body to modelUnavailable and non-object JSON to schema', async () => {
    const nfRes = await new GeminiProvider(
      TEST_API_KEY,
      makeHttpFetch(404, 'models/gemini-old is not found')
    ).explainPlan(BASE_CONTEXT);
    expect(isErr(nfRes) && nfRes.error.code).toBe(MODEL_UNAVAILABLE_CODE);

    const dpRes = await new GeminiProvider(
      TEST_API_KEY,
      makeHttpFetch(400, 'Model is deprecated or unsupported')
    ).explainPlan(BASE_CONTEXT);
    expect(isErr(dpRes) && dpRes.error.code).toBe(MODEL_UNAVAILABLE_CODE);

    for (const raw of ['null', '"hello"', '[1,2]']) {
      const schemaRes = await new GeminiProvider(TEST_API_KEY, {
        fetch: async () => new Response(raw, { status: 200 }),
      }).explainPlan(BASE_CONTEXT);
      expect(isErr(schemaRes) && schemaRes.error.code).toBe('schema');
    }
  });
});

describe('GeminiProvider HTTP 400 error and AiOrchestrator fallback', () => {
  it('maps HTTP 400 bad request to a distinct UI-safe error without modelUnavailable', async () => {
    const badReqFetcher: FetchPort = {
      fetch: async () =>
        ({
          ok: false,
          status: 400,
          text: async () =>
            'INVALID_ARGUMENT: unsupported parameter key=secret',
        }) as Response,
    };
    const res = await new GeminiProvider(
      TEST_API_KEY,
      badReqFetcher
    ).explainPlan(BASE_CONTEXT);
    expect(isErr(res)).toBe(true);
    if (isErr(res)) {
      expect(res.error.code).toBe('schema');
      expect(res.error.code).not.toBe(MODEL_UNAVAILABLE_CODE);
      expect(res.error.message.length).toBeGreaterThan(0);
      expect(res.error.message).toContain('400');
      expect(res.error.message).not.toContain('INVALID_ARGUMENT');
      expect(res.error.message).not.toContain('secret');
    }
  });

  it('surfaces non-empty UI-safe fallbackReason through AiOrchestrator on HTTP 400', async () => {
    let calls = 0;
    const fetcher: FetchPort = {
      fetch: async () => {
        calls += 1;
        return {
          ok: false,
          status: 400,
          text: async () => 'INVALID_ARGUMENT: bad payload trace=internal',
        } as Response;
      },
    };
    const orchestrator = new AiOrchestrator(createOrchestratorDeps(fetcher));
    const res = await orchestrator.getAnswer(BASE_CONTEXT, { consent: true });
    expect(calls).toBe(1);
    expect(isOk(res)).toBe(true);
    if (isOk(res)) {
      expect(res.value.source).toBe('local');
      expect(res.value.fallbackReason).toBeTruthy();
      expect(res.value.fallbackReason).not.toBe(MODEL_UNAVAILABLE_CODE);
      expect(res.value.fallbackReason).toContain('400');
      expect(res.value.fallbackReason).not.toContain('trace=internal');
    }
  });
});

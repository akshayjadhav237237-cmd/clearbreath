import { describe, expect, it } from 'vitest';
import { err } from '../../src/shared/result';
import type {
  AiProvider,
  AiAnswer,
  AiPlanNarrative,
  LlmSafeContext,
} from '../../src/ai/contracts';
import { ApiKeyHolder } from '../../src/ai/key-holder';
import { LocalProvider } from '../../src/ai/providers/local-provider';
import {
  executeAnswerCloud,
  executePlanCloud,
} from '../../src/ai/orchestrator/cloud-invoker';
import type { OrchestratorDependencies } from '../../src/ai/orchestrator/types';

const TEST_KEY = 'secret-test-key';

const baseCtx: LlmSafeContext = {
  city: 'Delhi',
  aqiCategory: 'severe',
  aqiValue: 410,
  sensitivityLevel: 'high',
  ageGroupsPresent: ['child'],
  homeType: 'apartment',
  sealing: 'average',
  cookingFuel: 'lpg',
  commuteMode: 'metro',
  budgetBand: 'medium',
  language: 'en',
  facts: [
    { id: 'aqi-1', kind: 'aqi', text: 'AQI 410', value: 410 },
    {
      id: 'act-indoor-seal-gaps',
      kind: 'action',
      text: 'Seal window gaps.',
    },
  ],
  question: 'How to protect child?',
};

const failingLocal: AiProvider = {
  id: 'local',
  explainPlan: async () => err({ code: 'network', message: 'Local plan fail' }),
  answer: async () => err({ code: 'network', message: 'Local ans fail' }),
};

function makeDeps(
  fetchImpl: () => Promise<Response>,
  withKey = true,
  localProvider: AiProvider = new LocalProvider()
): OrchestratorDependencies {
  const keyHolder = new ApiKeyHolder();
  if (withKey) keyHolder.setKey(TEST_KEY);
  return {
    localProvider,
    keyHolder,
    fetcher: { fetch: fetchImpl },
    sleepPort: {
      sleep: (ms) => (ms >= 10000 ? new Promise(() => {}) : Promise.resolve()),
    },
    randomPort: { random: () => 0 },
    clock: { now: () => 1000 },
  };
}

function geminiJson(payload: AiAnswer | AiPlanNarrative): Response {
  return new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }],
    }),
    { status: 200 }
  );
}

describe('executeAnswerCloud branches', () => {
  it('returns grounded gemini answer when validation passes', async () => {
    const deps = makeDeps(async () =>
      geminiJson({
        answer: 'AQI 410 requires indoor air sealing.',
        usedActionIds: ['act-indoor-seal-gaps'],
        refusal: false,
      })
    );
    const res = await executeAnswerCloud(baseCtx, deps, { consent: true });
    expect(res.source).toBe('gemini');
    expect(res.data.answer).toContain('410');
  });

  it('falls back to local and empty answer on grounding failure', async () => {
    const ungrounded = async () =>
      geminiJson({
        answer: 'Magic 8888 is safe.',
        usedActionIds: [],
        refusal: false,
      });
    const localRes = await executeAnswerCloud(baseCtx, makeDeps(ungrounded), {
      consent: true,
    });
    expect(localRes.source).toBe('local');
    expect(localRes.fallbackReason).toContain('numeric claim');

    const emptyRes = await executeAnswerCloud(
      baseCtx,
      makeDeps(ungrounded, true, failingLocal),
      { consent: true }
    );
    expect(emptyRes.data.answer).toBe('Answer unavailable.');
  });

  it('handles modelUnavailable and aborted failures', async () => {
    const unavailRes = await executeAnswerCloud(
      baseCtx,
      makeDeps(async () => new Response('not found', { status: 404 })),
      { consent: true }
    );
    expect(unavailRes.fallbackReason).toBe('modelUnavailable');

    const controller = new AbortController();
    controller.abort();
    const emptyFetch = async () => new Response('{}', { status: 200 });
    const abortRes = await executeAnswerCloud(
      baseCtx,
      makeDeps(emptyFetch, false, failingLocal),
      { consent: true, signal: controller.signal }
    );
    expect(abortRes.data.answer).toBe('Answer unavailable.');
    expect(abortRes.fallbackReason).toContain('aborted');
  });
});

describe('executePlanCloud branches', () => {
  it('falls back to empty plan when grounding or key fails', async () => {
    const badPlan = async () =>
      geminiJson({
        summary: 'Fake 9876 AQI.',
        highlights: [],
        caution: 'Stay indoors.',
      });
    const groundEmpty = await executePlanCloud(
      baseCtx,
      makeDeps(badPlan, true, failingLocal),
      { consent: true }
    );
    expect(groundEmpty.data.summary).toBe('Plan unavailable.');
    expect(groundEmpty.fallbackReason).toContain('numeric claim');

    const emptyFetch = async () => new Response('{}', { status: 200 });
    const noKeyRes = await executePlanCloud(
      baseCtx,
      makeDeps(emptyFetch, false, failingLocal),
      { consent: true }
    );
    expect(noKeyRes.data.summary).toBe('Plan unavailable.');
    expect(noKeyRes.fallbackReason).toContain('API key');
  });
});

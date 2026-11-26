import { describe, expect, it } from 'vitest';
import { AiOrchestrator } from '../../../src/ai/orchestrator/orchestrator';
import {
  ACTION_SEAL_GAPS,
  SAMPLE_CONTEXT,
  VALID_KEY,
  createMockDeps,
} from './fixtures';

describe('AiOrchestrator consent and key fallbacks', () => {
  it('makes zero network requests when consent is false', async () => {
    let fetchCalled = false;
    const deps = createMockDeps(async () => {
      fetchCalled = true;
      return new Response('{}', { status: 200 });
    });
    deps.keyHolder.setKey(VALID_KEY);
    const orchestrator = new AiOrchestrator(deps);

    const res = await orchestrator.getPlanNarrative(SAMPLE_CONTEXT, {
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

    const res = await orchestrator.getPlanNarrative(SAMPLE_CONTEXT, {
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

    const res1 = await orchestrator.getPlanNarrative(SAMPLE_CONTEXT, {
      consent: true,
    });
    expect(res1.ok).toBe(true);
    if (res1.ok) expect(res1.value.source).toBe('gemini');
    expect(fetchCalls).toBe(1);

    const res2 = await orchestrator.getPlanNarrative(SAMPLE_CONTEXT, {
      consent: true,
    });
    expect(res2.ok).toBe(true);
    if (res2.ok) expect(res2.value.source).toBe('gemini');
    expect(fetchCalls).toBe(1);
  });
});

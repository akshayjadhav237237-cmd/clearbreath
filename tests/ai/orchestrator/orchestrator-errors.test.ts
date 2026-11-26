import { describe, expect, it } from 'vitest';
import { AiOrchestrator } from '../../../src/ai/orchestrator/orchestrator';
import { BASE_CONTEXT, createMockDeps } from './fixtures';

const TEST_KEY = 'test-key';

describe('AiOrchestrator cloud malformed response fallbacks', () => {
  it('falls back to local when Gemini returns malformed JSON', async () => {
    const deps = createMockDeps(
      async () =>
        new Response(
          '{"candidates":[{"content":{"parts":[{"text":"bad-json"}]}}]}',
          { status: 200 }
        ),
      { key: TEST_KEY }
    );
    const orchestrator = new AiOrchestrator(deps);
    const res = await orchestrator.getPlanNarrative(BASE_CONTEXT, {
      consent: true,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.source).toBe('local');
      expect(res.value.fallbackReason).toBeDefined();
    }
  });

  it('falls back to local when schema validation fails', async () => {
    const invalidSchemaJson = JSON.stringify({
      candidates: [
        {
          content: { parts: [{ text: JSON.stringify({ invalid: 'field' }) }] },
        },
      ],
    });
    const deps = createMockDeps(
      async () => new Response(invalidSchemaJson, { status: 200 }),
      { key: TEST_KEY }
    );
    const orchestrator = new AiOrchestrator(deps);
    const res = await orchestrator.getPlanNarrative(BASE_CONTEXT, {
      consent: true,
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.source).toBe('local');
  });
});

describe('AiOrchestrator cloud HTTP status fallbacks', () => {
  it('falls back to local on HTTP server errors', async () => {
    const deps = createMockDeps(
      async () => new Response('Server error', { status: 503 }),
      { key: TEST_KEY }
    );
    const orchestrator = new AiOrchestrator(deps);
    const res = await orchestrator.getPlanNarrative(BASE_CONTEXT, {
      consent: true,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.source).toBe('local');
      expect(res.value.fallbackReason).toContain('503');
    }
  });

  it('falls back to local with modelUnavailable when Gemini returns 404', async () => {
    const deps = createMockDeps(
      async () => new Response('model not found', { status: 404 }),
      { key: TEST_KEY }
    );
    const orchestrator = new AiOrchestrator(deps);
    const res = await orchestrator.getPlanNarrative(BASE_CONTEXT, {
      consent: true,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.source).toBe('local');
      expect(res.value.fallbackReason).toBe('modelUnavailable');
    }
  });
});

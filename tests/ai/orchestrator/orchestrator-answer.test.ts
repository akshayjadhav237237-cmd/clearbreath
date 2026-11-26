import { describe, expect, it } from 'vitest';
import { AiOrchestrator } from '../../../src/ai/orchestrator/orchestrator';
import {
  ACTION_SEAL_GAPS,
  SAMPLE_CONTEXT,
  VALID_KEY,
  createMockDeps,
} from './fixtures';

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
      ...SAMPLE_CONTEXT,
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

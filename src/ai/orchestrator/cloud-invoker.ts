import type { AiAnswer, AiPlanNarrative, LlmSafeContext } from '../contracts';
import { GeminiProvider } from '../providers/gemini-provider';
import {
  validateAnswerGrounding,
  validatePlanGrounding,
} from '../guard/grounding';
import { withTimeout } from '../runtime/timeout';
import { withRetry } from '../runtime/retry';
import { AI_REQUEST_TIMEOUT_MS } from '../../config/constants';
import type {
  OrchestrationOptions,
  OrchestratorDependencies,
  OrchestratedResult,
} from './types';

const SOURCE_LOCAL = 'local' as const;
const SOURCE_GEMINI = 'gemini' as const;

/** Executes cloud Gemini plan generation with timeout, retry, and grounding validation. */
export async function executePlanCloud(
  ctx: LlmSafeContext,
  deps: OrchestratorDependencies,
  options: OrchestrationOptions
): Promise<OrchestratedResult<AiPlanNarrative>> {
  const key = deps.keyHolder.getKey() ?? '';
  const gemini = new GeminiProvider(key, deps.fetcher);

  const cloudRes = await withTimeout(
    (sig) =>
      withRetry(() => gemini.explainPlan(ctx, sig), {
        sleepPort: deps.sleepPort,
        randomPort: deps.randomPort,
        signal: sig,
      }),
    AI_REQUEST_TIMEOUT_MS,
    deps.sleepPort,
    options.signal
  );

  const empty: AiPlanNarrative = {
    summary: 'Plan unavailable.',
    highlights: [],
    caution: 'Take precautions.',
  };
  if (cloudRes.ok) {
    const ground = validatePlanGrounding(cloudRes.value, ctx.facts);
    if (ground.ok) {
      return { data: ground.value, source: SOURCE_GEMINI };
    }
    const local = await deps.localProvider.explainPlan(ctx, options.signal);
    return {
      data: local.ok ? local.value : empty,
      source: SOURCE_LOCAL,
      fallbackReason: ground.error.message,
    };
  }

  const local = await deps.localProvider.explainPlan(ctx, options.signal);
  return {
    data: local.ok ? local.value : empty,
    source: SOURCE_LOCAL,
    fallbackReason: cloudRes.error.message,
  };
}

/** Executes cloud Gemini Q&A with timeout, retry, and grounding validation. */
export async function executeAnswerCloud(
  ctx: LlmSafeContext,
  deps: OrchestratorDependencies,
  options: OrchestrationOptions
): Promise<OrchestratedResult<AiAnswer>> {
  const key = deps.keyHolder.getKey() ?? '';
  const gemini = new GeminiProvider(key, deps.fetcher);

  const cloudRes = await withTimeout(
    (sig) =>
      withRetry(() => gemini.answer(ctx, sig), {
        sleepPort: deps.sleepPort,
        randomPort: deps.randomPort,
        signal: sig,
      }),
    AI_REQUEST_TIMEOUT_MS,
    deps.sleepPort,
    options.signal
  );

  const empty: AiAnswer = {
    answer: 'Answer unavailable.',
    usedActionIds: [],
    refusal: false,
  };
  if (cloudRes.ok) {
    const ground = validateAnswerGrounding(cloudRes.value, ctx.facts);
    if (ground.ok) {
      return { data: ground.value, source: SOURCE_GEMINI };
    }
    const local = await deps.localProvider.answer(ctx, options.signal);
    return {
      data: local.ok ? local.value : empty,
      source: SOURCE_LOCAL,
      fallbackReason: ground.error.message,
    };
  }

  const local = await deps.localProvider.answer(ctx, options.signal);
  return {
    data: local.ok ? local.value : empty,
    source: SOURCE_LOCAL,
    fallbackReason: cloudRes.error.message,
  };
}

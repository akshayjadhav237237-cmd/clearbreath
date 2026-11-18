import { type Result, ok } from '../../shared/result';
import type {
  AiAnswer,
  AiError,
  AiPlanNarrative,
  LlmSafeContext,
} from '../contracts';
import { sanitizeUserQuestion } from '../guard/sanitizer';
import { RateLimiter } from '../runtime/rate-limiter';
import { LruCache, serializeContext } from '../runtime/lru-cache';
import { RequestDeduplicator } from '../runtime/deduplicator';
import { executeAnswerCloud, executePlanCloud } from './cloud-invoker';
import type {
  OrchestrationOptions,
  OrchestratorDependencies,
  OrchestratedResult,
} from './types';

const SOURCE_LOCAL = 'local' as const;
const SOURCE_GEMINI = 'gemini' as const;

/** Coordinates AI inference lifecycle including caching, rate limiting, retries, and local fallbacks. */
export class AiOrchestrator {
  private readonly rateLimiter: RateLimiter;
  private readonly cache = new LruCache<AiPlanNarrative | AiAnswer>();
  private readonly planDedupe = new RequestDeduplicator<
    OrchestratedResult<AiPlanNarrative>
  >();
  private readonly answerDedupe = new RequestDeduplicator<
    OrchestratedResult<AiAnswer>
  >();

  constructor(private readonly deps: OrchestratorDependencies) {
    this.rateLimiter = new RateLimiter(deps.clock);
  }

  /** Synthesizes an explanatory diurnal plan narrative using Gemini with deterministic fallback. */
  async getPlanNarrative(
    ctx: LlmSafeContext,
    options: OrchestrationOptions
  ): Promise<Result<OrchestratedResult<AiPlanNarrative>, AiError>> {
    const cacheKey = `plan:${serializeContext(ctx)}`;
    const cached = this.cache.get(cacheKey) as AiPlanNarrative | undefined;
    if (cached !== undefined)
      return ok({ data: cached, source: SOURCE_GEMINI });

    const fallbackCheck = this.checkPrerequisites(options.consent);
    if (fallbackCheck !== null) {
      const local = await this.deps.localProvider.explainPlan(
        ctx,
        options.signal
      );
      const empty = {
        summary: 'Plan unavailable.',
        highlights: [],
        caution: 'Take precautions.',
      };
      return ok({
        data: local.ok ? local.value : empty,
        source: SOURCE_LOCAL,
        fallbackReason: fallbackCheck,
      });
    }

    return ok(
      await this.planDedupe.execute(cacheKey, async () => {
        this.rateLimiter.recordRequest();
        const res = await executePlanCloud(ctx, this.deps, options);
        if (res.source === SOURCE_GEMINI) this.cache.set(cacheKey, res.data);
        return res;
      })
    );
  }

  /** Answers user questions strictly bounded by contextual grounding facts. */
  async getAnswer(
    ctx: LlmSafeContext,
    options: OrchestrationOptions
  ): Promise<Result<OrchestratedResult<AiAnswer>, AiError>> {
    const sanitized = sanitizeUserQuestion(ctx.question);
    if (!sanitized.ok) {
      return ok({
        data: {
          answer: 'Disallowed input or safety violation.',
          usedActionIds: [],
          refusal: true,
        },
        source: SOURCE_LOCAL,
        fallbackReason: sanitized.error.message,
      });
    }

    const cleanCtx: LlmSafeContext = { ...ctx, question: sanitized.value };
    const cacheKey = `ans:${serializeContext(cleanCtx)}`;
    const cached = this.cache.get(cacheKey) as AiAnswer | undefined;
    if (cached !== undefined)
      return ok({ data: cached, source: SOURCE_GEMINI });

    const fallbackCheck = this.checkPrerequisites(options.consent);
    if (fallbackCheck !== null) {
      const local = await this.deps.localProvider.answer(
        cleanCtx,
        options.signal
      );
      const empty = {
        answer: 'Answer unavailable.',
        usedActionIds: [],
        refusal: false,
      };
      return ok({
        data: local.ok ? local.value : empty,
        source: SOURCE_LOCAL,
        fallbackReason: fallbackCheck,
      });
    }

    return ok(
      await this.answerDedupe.execute(cacheKey, async () => {
        this.rateLimiter.recordRequest();
        const res = await executeAnswerCloud(cleanCtx, this.deps, options);
        if (res.source === SOURCE_GEMINI) this.cache.set(cacheKey, res.data);
        return res;
      })
    );
  }

  /** Verifies cloud prerequisites: user consent, key presence, and rate limit availability. */
  private checkPrerequisites(consent: boolean): string | null {
    if (!consent) return 'AI cloud features require user consent.';
    if (!this.deps.keyHolder.hasKey()) return 'No Gemini API key configured.';
    const rateCheck = this.rateLimiter.checkLimit();
    if (!rateCheck.ok) return rateCheck.error.message;
    return null;
  }
}

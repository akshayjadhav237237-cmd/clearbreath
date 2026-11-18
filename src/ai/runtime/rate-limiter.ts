import type { Clock } from '../../shared/ports';
import { err, ok, type Result } from '../../shared/result';
import type { AiError } from '../contracts';
import {
  AI_MAX_REQUESTS_PER_SESSION,
  AI_MIN_INTERVAL_MS,
} from '../../config/constants';

/** Configuration parameters governing client-side AI throttling limits. */
export interface RateLimiterOptions {
  readonly minIntervalMs?: number;
  readonly maxRequestsPerSession?: number;
}

/** Client-side rate limiter enforcing minimal intervals and maximum session request budgets. */
export class RateLimiter {
  private lastRequestTimestamp = 0;
  private sessionRequestCount = 0;
  private readonly minIntervalMs: number;
  private readonly maxRequestsPerSession: number;

  constructor(
    private readonly clock: Clock,
    options?: RateLimiterOptions
  ) {
    this.minIntervalMs = options?.minIntervalMs ?? AI_MIN_INTERVAL_MS;
    this.maxRequestsPerSession =
      options?.maxRequestsPerSession ?? AI_MAX_REQUESTS_PER_SESSION;
  }

  /** Verifies whether an immediate AI request is permitted under throttle constraints. */
  checkLimit(): Result<void, AiError> {
    if (this.sessionRequestCount >= this.maxRequestsPerSession) {
      return err({
        code: 'rateLimited',
        message: `Session AI limit reached (${this.maxRequestsPerSession} requests).`,
      });
    }

    const elapsed = this.clock.now() - this.lastRequestTimestamp;
    if (this.lastRequestTimestamp > 0 && elapsed < this.minIntervalMs) {
      const waitSeconds = Math.ceil((this.minIntervalMs - elapsed) / 1000);
      return err({
        code: 'rateLimited',
        message: `Please wait ${waitSeconds}s before sending another request.`,
      });
    }

    return ok(undefined);
  }

  /** Records the occurrence of a dispatched AI request, updating timestamps and counters. */
  recordRequest(): void {
    this.lastRequestTimestamp = this.clock.now();
    this.sessionRequestCount += 1;
  }

  /** Returns the remaining number of allowed requests for the current session. */
  getRemainingRequests(): number {
    return Math.max(0, this.maxRequestsPerSession - this.sessionRequestCount);
  }

  /** Resets session counters and timestamps to initial clean state. */
  reset(): void {
    this.lastRequestTimestamp = 0;
    this.sessionRequestCount = 0;
  }
}

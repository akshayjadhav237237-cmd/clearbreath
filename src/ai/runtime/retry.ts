import type { RandomPort, SleepPort } from '../../shared/ports';
import { type Result } from '../../shared/result';
import type { AiError } from '../contracts';
import { AI_MAX_RETRIES, AI_RETRY_BASE_DELAY_MS } from '../../config/constants';

/** Configuration options governing retry attempts with jittered exponential backoff. */
export interface RetryOptions {
  readonly sleepPort: SleepPort;
  readonly randomPort: RandomPort;
  readonly maxRetries?: number;
  readonly baseDelayMs?: number;
  readonly signal?: AbortSignal;
}

/** Determines whether a given AI failure is transient and eligible for retry. */
function isRetriable(error: AiError): boolean {
  return error.code === 'network' || error.code === 'http';
}

/** Computes exponential backoff delay with half-amplitude random jitter. */
function computeDelay(
  baseMs: number,
  attempt: number,
  randomPort: RandomPort
): number {
  const multiplier = 2 ** attempt;
  const jitter = Math.round(randomPort.random() * baseMs * 0.5);
  return baseMs * multiplier + jitter;
}

/** Retries an asynchronous AI operation upon encountering transient network or 5xx errors. */
export async function withRetry<T>(
  operation: (attempt: number) => Promise<Result<T, AiError>>,
  options: RetryOptions
): Promise<Result<T, AiError>> {
  const maxRetries = options.maxRetries ?? AI_MAX_RETRIES;
  const baseMs = options.baseDelayMs ?? AI_RETRY_BASE_DELAY_MS;

  let attempt = 0;
  while (attempt <= maxRetries) {
    if (options.signal?.aborted) {
      return {
        ok: false,
        error: { code: 'aborted', message: 'Retry cancelled by signal.' },
      };
    }

    const result = await operation(attempt);
    if (result.ok) {
      return result;
    }

    if (attempt >= maxRetries || !isRetriable(result.error)) {
      return result;
    }

    const delayMs = computeDelay(baseMs, attempt, options.randomPort);
    await options.sleepPort.sleep(delayMs, options.signal);
    attempt += 1;
  }

  return operation(attempt);
}

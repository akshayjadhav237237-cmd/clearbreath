import type { SleepPort } from '../../shared/ports';
import { err, type Result } from '../../shared/result';
import type { AiError } from '../contracts';

/** Connects parent abort signal to child controller, aborting early if already triggered. */
function bindParentSignal(
  controller: AbortController,
  parentSignal?: AbortSignal
): Result<never, AiError> | null {
  if (!parentSignal) return null;
  if (parentSignal.aborted) {
    return err({ code: 'aborted', message: 'Operation aborted by caller.' });
  }
  parentSignal.addEventListener('abort', () => controller.abort(), {
    once: true,
  });
  return null;
}

/** Maps runtime caught errors to typed AI timeout, abort, or network errors. */
function mapCatchError(
  controller: AbortController,
  parentSignal: AbortSignal | undefined,
  timeoutMs: number,
  caught: unknown
): AiError {
  if (controller.signal.aborted && parentSignal?.aborted) {
    return { code: 'aborted', message: 'Operation aborted by caller.' };
  }
  if (controller.signal.aborted) {
    return {
      code: 'timeout',
      message: `Request timed out after ${timeoutMs}ms.`,
    };
  }
  const message =
    caught instanceof Error ? caught.message : 'Unknown runtime failure.';
  return { code: 'network', message };
}

/** Wraps an asynchronous operation with an injected sleep-based timeout and optional cancellation signal. */
export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<Result<T, AiError>>,
  timeoutMs: number,
  sleepPort: SleepPort,
  parentSignal?: AbortSignal
): Promise<Result<T, AiError>> {
  const controller = new AbortController();
  const earlyAbort = bindParentSignal(controller, parentSignal);
  if (earlyAbort) return earlyAbort;

  let timerDone = false;
  const timeoutPromise = sleepPort
    .sleep(timeoutMs, controller.signal)
    .then(() => {
      if (!timerDone) {
        controller.abort();
        return err<AiError>({
          code: 'timeout',
          message: `Request timed out after ${timeoutMs}ms.`,
        });
      }
      return null;
    });

  try {
    const opPromise = operation(controller.signal);
    const raced = await Promise.race([opPromise, timeoutPromise]);
    timerDone = true;
    if (raced !== null) {
      return raced;
    }
    return await opPromise;
  } catch (caught: unknown) {
    timerDone = true;
    return err(mapCatchError(controller, parentSignal, timeoutMs, caught));
  }
}

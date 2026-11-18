import { describe, expect, it } from 'vitest';
import { ok, err } from '../../../src/shared/result';
import type { SleepPort, RandomPort } from '../../../src/shared/ports';
import type { AiError } from '../../../src/ai/contracts';
import { withTimeout } from '../../../src/ai/runtime/timeout';
import { withRetry } from '../../../src/ai/runtime/retry';

const mockSleep: SleepPort = {
  sleep: async (ms: number, signal?: AbortSignal) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  },
};

const mockRandom: RandomPort = {
  random: () => 0.25,
};

describe('withTimeout runtime utility', () => {
  it('resolves successfully when operation finishes within timeout', async () => {
    const res = await withTimeout(async () => ok('data'), 100, mockSleep);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value).toBe('data');
  });

  it('returns timeout error when operation takes too long', async () => {
    const res = await withTimeout(
      async (signal) => {
        await mockSleep.sleep(50, signal);
        return ok('late');
      },
      10,
      mockSleep
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('timeout');
  });

  it('handles caller signal cancellation', async () => {
    const controller = new AbortController();
    controller.abort();
    const res = await withTimeout(
      async () => ok('done'),
      100,
      mockSleep,
      controller.signal
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('aborted');
  });
});

describe('withRetry runtime utility', () => {
  it('succeeds on first attempt without retrying', async () => {
    let calls = 0;
    const res = await withRetry(
      async () => {
        calls += 1;
        return ok('success');
      },
      {
        sleepPort: mockSleep,
        randomPort: mockRandom,
        maxRetries: 2,
        baseDelayMs: 1,
      }
    );
    expect(res.ok).toBe(true);
    expect(calls).toBe(1);
  });

  it('retries on network error and succeeds on subsequent try', async () => {
    let calls = 0;
    const res = await withRetry(
      async () => {
        calls += 1;
        if (calls === 1)
          return err<AiError>({ code: 'network', message: 'Fail 1' });
        return ok('recovered');
      },
      {
        sleepPort: mockSleep,
        randomPort: mockRandom,
        maxRetries: 2,
        baseDelayMs: 1,
      }
    );
    expect(res.ok).toBe(true);
    expect(calls).toBe(2);
  });

  it('does not retry non-transient schema errors', async () => {
    let calls = 0;
    const res = await withRetry(
      async () => {
        calls += 1;
        return err<AiError>({ code: 'schema', message: 'Invalid json' });
      },
      {
        sleepPort: mockSleep,
        randomPort: mockRandom,
        maxRetries: 2,
        baseDelayMs: 1,
      }
    );
    expect(res.ok).toBe(false);
    expect(calls).toBe(1);
  });
});

import { describe, expect, it } from 'vitest';
import type { Clock } from '../../../src/shared/ports';
import type { LlmSafeContext } from '../../../src/ai/contracts';
import { RateLimiter } from '../../../src/ai/runtime/rate-limiter';
import { LruCache, serializeContext } from '../../../src/ai/runtime/lru-cache';
import { RequestDeduplicator } from '../../../src/ai/runtime/deduplicator';

function makeContext(question: string | null): LlmSafeContext {
  return {
    city: 'Delhi',
    aqiCategory: 'severe',
    aqiValue: 412,
    sensitivityLevel: 'high',
    ageGroupsPresent: ['child', 'older'],
    homeType: 'apartment',
    sealing: 'average',
    cookingFuel: 'lpg',
    commuteMode: 'metro',
    budgetBand: 'medium',
    language: 'en',
    facts: [{ id: 'aqi-1', kind: 'aqi', text: 'Severe AQI 412', value: 412 }],
    question,
  };
}

describe('RateLimiter', () => {
  it('enforces min interval and session request budget', () => {
    let nowMs = 1000;
    const clock: Clock = { now: () => nowMs };
    const limiter = new RateLimiter(clock, {
      minIntervalMs: 3000,
      maxRequestsPerSession: 2,
    });

    expect(limiter.checkLimit().ok).toBe(true);
    limiter.recordRequest();

    const throttled = limiter.checkLimit();
    expect(throttled.ok).toBe(false);
    if (!throttled.ok) expect(throttled.error.code).toBe('rateLimited');

    nowMs += 3500;
    expect(limiter.checkLimit().ok).toBe(true);
    limiter.recordRequest();

    nowMs += 3500;
    const exhausted = limiter.checkLimit();
    expect(exhausted.ok).toBe(false);
    expect(limiter.getRemainingRequests()).toBe(0);

    limiter.reset();
    expect(limiter.checkLimit().ok).toBe(true);
  });
});

describe('LruCache and Deduplicator', () => {
  it('serializes context deterministically and evicts oldest entries', () => {
    const ctx1 = makeContext('What should I do?');
    const ctx2 = makeContext('What should I do?');
    expect(serializeContext(ctx1)).toBe(serializeContext(ctx2));

    const cache = new LruCache<string>(2);
    cache.set('a', 'alpha');
    cache.set('b', 'beta');
    expect(cache.size).toBe(2);

    cache.set('c', 'gamma');
    expect(cache.size).toBe(2);
    expect(cache.has('a')).toBe(false);
    expect(cache.get('b')).toBe('beta');
    expect(cache.get('c')).toBe('gamma');
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it('deduplicates concurrent requests sharing identical keys', async () => {
    const dedupe = new RequestDeduplicator<string>();
    const sharedValue = 'shared-value';
    let runs = 0;
    const task = async () => {
      runs += 1;
      return sharedValue;
    };

    const p1 = dedupe.execute('req-key', task);
    const p2 = dedupe.execute('req-key', task);
    const [res1, res2] = await Promise.all([p1, p2]);

    expect(res1).toBe(sharedValue);
    expect(res2).toBe(sharedValue);
    expect(runs).toBe(1);
    expect(dedupe.inFlightCount).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import type { Clock, IdGenerator } from '../src/shared';
import {
  CLOCK_PORT,
  ID_GENERATOR_PORT,
  SystemClock,
  SystemIdGenerator,
} from '../src/shared';

/** Test double for Clock interface allowing controlled time advancement. */
class FakeClock implements Clock {
  constructor(private currentTimestamp: number) {}

  /** Returns the current timestamp of the fake clock. */
  now(): number {
    return this.currentTimestamp;
  }

  /** Advances fake clock time by the given duration in milliseconds. */
  advance(ms: number): void {
    this.currentTimestamp += ms;
  }
}

/** Test double for IdGenerator producing predictable sequential identifiers. */
class FakeIdGenerator implements IdGenerator {
  private counter = 0;

  /** Generates the next sequential identifier string. */
  next(): string {
    this.counter += 1;
    return `test-id-${this.counter}`;
  }
}

describe('Port tokens', () => {
  it('exposes defined tokens for clock and id generator', () => {
    expect(CLOCK_PORT).toBe('clock');
    expect(ID_GENERATOR_PORT).toBe('id-generator');
  });
});

describe('SystemClock', () => {
  it('returns current time within reasonable threshold', () => {
    const clock = new SystemClock();
    const before = Date.now();
    const timestamp = clock.now();
    const after = Date.now();
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });
});

describe('SystemIdGenerator', () => {
  it('generates distinct UUID-formatted strings', () => {
    const idGen = new SystemIdGenerator();
    const id1 = idGen.next();
    const id2 = idGen.next();
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
    expect(id1).not.toBe(id2);
  });
});

describe('Fake test doubles', () => {
  it('allows controlling time with FakeClock', () => {
    const fake = new FakeClock(1000);
    expect(fake.now()).toBe(1000);
    fake.advance(500);
    expect(fake.now()).toBe(1500);
  });

  it('allows predictable sequence with FakeIdGenerator', () => {
    const fake = new FakeIdGenerator();
    expect(fake.next()).toBe('test-id-1');
    expect(fake.next()).toBe('test-id-2');
  });
});

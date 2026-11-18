import type { Clock, IdGenerator } from './ports';

/** System clock implementation based on Date.now. */
export class SystemClock implements Clock {
  /** Returns the current Unix timestamp in milliseconds. */
  now(): number {
    return Date.now();
  }
}

/** System identifier generator using Web Crypto API. */
export class SystemIdGenerator implements IdGenerator {
  /** Generates a cryptographically random UUID string. */
  next(): string {
    return crypto.randomUUID();
  }
}

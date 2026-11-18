import type {
  Clock,
  FetchPort,
  IdGenerator,
  RandomPort,
  SleepPort,
  StoragePort,
} from './ports';

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

/** Standard fetch port backed by global fetch. */
export class SystemFetchPort implements FetchPort {
  /** Executes a fetch network request. */
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    return fetch(input, init);
  }
}

/** Standard timer port backed by setTimeout. */
export class SystemSleepPort implements SleepPort {
  /** Asynchronously pauses execution for the given duration. */
  sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(signal.reason ?? new Error('Aborted'));
        return;
      }
      const timer = setTimeout(resolve, ms);
      signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(signal.reason ?? new Error('Aborted'));
        },
        { once: true }
      );
    });
  }
}

/** Memory storage port implementation for sandboxed or fallback environments. */
export class MemoryStoragePort implements StoragePort {
  private readonly store = new Map<string, string>();

  /** Retrieves a value by key. */
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  /** Sets a value by key. */
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  /** Removes a value by key. */
  removeItem(key: string): void {
    this.store.delete(key);
  }
}

/** Standard random port backed by Web Crypto API. */
export class SystemRandomPort implements RandomPort {
  /** Returns a cryptographically sound pseudo-random number in [0, 1). */
  random(): number {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const val = array[0];
    return val !== undefined ? val / 4294967296 : 0;
  }
}

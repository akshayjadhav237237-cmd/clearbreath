/** Clock port token. */
export const CLOCK_PORT = 'clock';

/** Id generator port token. */
export const ID_GENERATOR_PORT = 'id-generator';

/** System clock interface. */
export interface Clock {
  /** Returns the current timestamp in milliseconds. */
  now(): number;
}

/** Unique identifier generator interface. */
export interface IdGenerator {
  /** Generates a new unique identifier string. */
  next(): string;
}

/** Injected network fetch port interface. */
export interface FetchPort {
  /** Performs an HTTP network request. */
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

/** Injected asynchronous sleep port interface. */
export interface SleepPort {
  /** Resolves after specified milliseconds or aborts if signaled. */
  sleep(ms: number, signal?: AbortSignal): Promise<void>;
}

/** Injected key-value persistence storage port interface. */
export interface StoragePort {
  /** Retrieves a stored string item by key or null if missing. */
  getItem(key: string): string | null;
  /** Stores a string item by key. */
  setItem(key: string, value: string): void;
  /** Removes a stored item by key. */
  removeItem(key: string): void;
}

/** Injected pseudo-random number generator port interface. */
export interface RandomPort {
  /** Returns a pseudo-random floating-point number between 0 and 1. */
  random(): number;
}

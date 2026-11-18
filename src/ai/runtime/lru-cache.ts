import type { LlmSafeContext } from '../contracts';
import { AI_CACHE_MAX_ENTRIES } from '../../config/constants';

/** Computes a deterministic canonical cache key from an anonymized AI context payload. */
export function serializeContext(ctx: LlmSafeContext): string {
  const normalized = {
    c: ctx.city,
    cat: ctx.aqiCategory,
    aqi: ctx.aqiValue,
    s: ctx.sensitivityLevel,
    ag: [...ctx.ageGroupsPresent].sort(),
    h: ctx.homeType,
    seal: ctx.sealing,
    fuel: ctx.cookingFuel,
    comm: ctx.commuteMode,
    b: ctx.budgetBand,
    lang: ctx.language,
    q: ctx.question ? ctx.question.trim().toLowerCase() : null,
    f: [...ctx.facts]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((fact) => `${fact.id}:${fact.value ?? ''}`),
  };
  return JSON.stringify(normalized);
}

/** In-memory least-recently-used cache bounded by a maximum capacity constraint. */
export class LruCache<T> {
  private readonly entries = new Map<string, T>();
  private readonly maxEntries: number;

  constructor(maxEntries = AI_CACHE_MAX_ENTRIES) {
    this.maxEntries = maxEntries;
  }

  /** Retrieves a cached item by key and marks it as recently accessed. */
  get(key: string): T | undefined {
    const value = this.entries.get(key);
    if (value === undefined) {
      return undefined;
    }
    this.entries.delete(key);
    this.entries.set(key, value);
    return value;
  }

  /** Inserts or updates a cached item, evicting the oldest entry when at capacity. */
  set(key: string, value: T): void {
    if (this.entries.has(key)) {
      this.entries.delete(key);
    } else if (this.entries.size >= this.maxEntries) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey !== undefined) {
        this.entries.delete(oldestKey);
      }
    }
    this.entries.set(key, value);
  }

  /** Checks whether an entry exists in the cache without altering LRU order. */
  has(key: string): boolean {
    return this.entries.has(key);
  }

  /** Clears all entries from the cache. */
  clear(): void {
    this.entries.clear();
  }

  /** Returns current number of items residing in the cache. */
  get size(): number {
    return this.entries.size;
  }
}

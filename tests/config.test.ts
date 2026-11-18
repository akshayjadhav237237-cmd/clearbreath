import { describe, expect, it } from 'vitest';
import type { CityCoordinate } from '../src/config';
import {
  AI_CACHE_MAX_ENTRIES,
  AI_MAX_REQUESTS_PER_SESSION,
  AI_MAX_RETRIES,
  AI_MIN_INTERVAL_MS,
  AI_REQUEST_TIMEOUT_MS,
  AI_RETRY_BASE_DELAY_MS,
  AIR_DATA_TIMEOUT_MS,
  APP_NAME,
  CITIES,
  CITIES_BY_ID,
  DEFAULT_HOUSEHOLD_PERSONA,
  GEMINI_ENDPOINT_BASE,
  GEMINI_MODEL_ID,
  MAX_QUESTION_LENGTH,
  OPEN_METEO_AIR_QUALITY_ENDPOINT,
  OPEN_METEO_ATTRIBUTION_TEXT,
  STORAGE_KEYS,
  getCityById,
} from '../src/config';

describe('Global configuration constants and exports', () => {
  it('exposes defined application metadata and model identifiers', () => {
    expect(APP_NAME).toBe('Clearbreath');
    expect(GEMINI_MODEL_ID).toBe('gemini-1.5-flash');
    expect(GEMINI_ENDPOINT_BASE).toContain('generativelanguage.googleapis.com');
  });

  it('exposes air data endpoints and CC BY 4.0 attribution', () => {
    expect(OPEN_METEO_AIR_QUALITY_ENDPOINT).toContain('open-meteo.com');
    expect(OPEN_METEO_ATTRIBUTION_TEXT).toContain('CC BY 4.0');
    expect(AIR_DATA_TIMEOUT_MS).toBeGreaterThan(0);
  });

  it('exposes runtime limits and thresholds', () => {
    expect(AI_REQUEST_TIMEOUT_MS).toBeGreaterThan(0);
    expect(AI_MAX_RETRIES).toBeGreaterThanOrEqual(1);
    expect(AI_RETRY_BASE_DELAY_MS).toBeGreaterThanOrEqual(100);
    expect(AI_MIN_INTERVAL_MS).toBeGreaterThanOrEqual(1000);
    expect(AI_MAX_REQUESTS_PER_SESSION).toBeGreaterThanOrEqual(10);
    expect(AI_CACHE_MAX_ENTRIES).toBeGreaterThanOrEqual(5);
    expect(MAX_QUESTION_LENGTH).toBe(300);
    expect(STORAGE_KEYS.SETTINGS).toBeDefined();
  });

  it('re-exports cities registry and default persona', () => {
    expect(CITIES).toHaveLength(12);
    expect(CITIES_BY_ID.size).toBe(12);
    const city: CityCoordinate | undefined = getCityById('delhi');
    expect(city?.name).toBe('Delhi');
    expect(DEFAULT_HOUSEHOLD_PERSONA.members).toHaveLength(3);
  });
});

import { describe, expect, it } from 'vitest';
import type { Clock, FetchPort } from '../../../src/shared/ports';
import { isErr, isOk } from '../../../src/shared/result';
import {
  ManualProvider,
  OpenMeteoProvider,
  SampleProvider,
  fetchAirDataWithFallback,
} from '../../../src/ai/airdata';

const FIXED_TIMESTAMP = new Date('2026-11-18T10:00:00Z').getTime();
const fakeClock: Clock = { now: () => FIXED_TIMESTAMP };

describe('SampleProvider scenario simulations', () => {
  it('generates 24-hour diurnal readings for severe Delhi scenario', async () => {
    const provider = new SampleProvider('delhiSevere');
    const res = await provider.fetchHourly('Delhi');
    expect(isOk(res)).toBe(true);
    if (isOk(res)) {
      expect(res.value.readings).toHaveLength(24);
      expect(res.value.isSample).toBe(true);
      expect(res.value.readings[0]?.pm25).toBeGreaterThan(100);
    }
  });

  it('generates clean scenario with low particulate values', async () => {
    const provider = new SampleProvider('cleanDay');
    const res = await provider.fetchHourly('Bengaluru');
    expect(isOk(res)).toBe(true);
    if (isOk(res)) {
      expect(res.value.readings).toHaveLength(24);
      expect(res.value.readings[12]?.pm25).toBeLessThanOrEqual(30);
    }
  });
});

describe('ManualProvider user input synthesis', () => {
  it('generates a flat 24-hour reading series', async () => {
    const provider = new ManualProvider({
      pm25: 120,
      pm10: 200,
      shape: 'flat',
    });
    const res = await provider.fetchHourly('Custom City');
    expect(isOk(res)).toBe(true);
    if (isOk(res)) {
      expect(res.value.readings).toHaveLength(24);
      expect(res.value.readings[0]?.pm25).toBe(120);
      expect(res.value.readings[12]?.pm25).toBe(120);
    }
  });

  it('generates a diurnal curve from manual baseline', async () => {
    const provider = new ManualProvider({ pm25: 100, shape: 'diurnal' });
    const res = await provider.fetchHourly('Custom City');
    expect(isOk(res)).toBe(true);
    if (isOk(res)) {
      expect(res.value.readings).toHaveLength(24);
      // Diurnal curve has higher values at morning inversion than midday
      const morningVal = res.value.readings[5]?.pm25 ?? 0;
      const middayVal = res.value.readings[13]?.pm25 ?? 0;
      expect(morningVal).toBeGreaterThan(middayVal);
    }
  });
});

describe('OpenMeteoProvider REST integration and fallback chain', () => {
  it('fetches and normalizes hourly air data from Open-Meteo', async () => {
    const fakeTimes = Array.from({ length: 48 }, (_, i) => {
      const d = new Date(FIXED_TIMESTAMP + i * 3600000);
      return d.toISOString().slice(0, 19);
    });
    const fakeFetcher: FetchPort = {
      fetch: async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({
            utc_offset_seconds: 19800,
            hourly: {
              time: fakeTimes,
              pm2_5: fakeTimes.map(() => 85.6),
              pm10: fakeTimes.map(() => 152.2),
            },
          }),
        }) as unknown as Response,
    };

    const provider = new OpenMeteoProvider(fakeFetcher, fakeClock);
    const res = await provider.fetchHourly('Delhi');
    expect(isOk(res)).toBe(true);
    if (isOk(res)) {
      expect(res.value.readings).toHaveLength(24);
      expect(res.value.isSample).toBe(false);
      expect(res.value.readings[0]?.pm25).toBe(86);
      expect(res.value.readings[0]?.pm10).toBe(152);
    }
  });

  it('rejects unregistered city names with invalidCity error', async () => {
    const fakeFetcher: FetchPort = { fetch: async () => ({}) as Response };
    const provider = new OpenMeteoProvider(fakeFetcher, fakeClock);
    const res = await provider.fetchHourly('Unknown Nonexistent City');
    expect(isErr(res)).toBe(true);
    if (isErr(res)) expect(res.error.code).toBe('invalidCity');
  });

  it('falls back to sample simulation when live provider fails', async () => {
    const failingLive: OpenMeteoProvider = new OpenMeteoProvider(
      { fetch: async () => ({ ok: false, status: 503 }) as Response },
      fakeClock
    );
    const sample = new SampleProvider('delhiSevere');

    const result = await fetchAirDataWithFallback(failingLive, sample, 'Delhi');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.source).toBe('sample');
      expect(result.value.series.isSample).toBe(true);
      expect(result.value.fallbackReason?.code).toBe('http');
    }
  });
});

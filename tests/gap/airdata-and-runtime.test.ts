import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { cleanup, render } from '@testing-library/react';
import { err, ok } from '../../src/shared/result';
import type { Clock, FetchPort, SleepPort } from '../../src/shared/ports';
import { withTimeout } from '../../src/ai/runtime/timeout';
import {
  OpenMeteoProvider,
  fetchAirDataWithFallback,
} from '../../src/ai/airdata';
import { interpolateHourlySeries } from '../../src/domain/planner';
import { AirNowPanel } from '../../src/features/air-now';
import { useAppStore } from '../../src/app/store';

const FIXED_MS = new Date('2026-11-18T10:00:00Z').getTime();
const fakeClock: Clock = { now: () => FIXED_MS };
const timerSleep: SleepPort = {
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
};

function rejectOnAbort(sig: AbortSignal, msg: string): Promise<never> {
  return new Promise((_, reject) => {
    sig.addEventListener('abort', () => reject(new Error(msg)), { once: true });
  });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('withTimeout abort and error mapping', () => {
  it('propagates mid-flight parent abort signal and handles late timer', async () => {
    const parent = new AbortController();
    const pendingSleep: SleepPort = { sleep: () => new Promise(() => {}) };
    const p = withTimeout(
      (sig) => rejectOnAbort(sig, 'Aborted'),
      5000,
      pendingSleep,
      parent.signal
    );
    parent.abort();
    const res = await p;
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('aborted');

    vi.useFakeTimers();
    const fast = await withTimeout(async () => ok('fast'), 20, timerSleep);
    await vi.advanceTimersByTimeAsync(30);
    expect(fast.ok).toBe(true);
  });

  it('maps timeout rejection, Error throw, and non-Error throw', async () => {
    vi.useFakeTimers();
    const timed = withTimeout((sig) => rejectOnAbort(sig, 'T'), 50, timerSleep);
    await vi.advanceTimersByTimeAsync(60);
    const tRes = await timed;
    expect(tRes.ok).toBe(false);
    if (!tRes.ok) expect(tRes.error.code).toBe('timeout');

    const eRes = await withTimeout(
      async () => {
        throw new Error('Socket drop');
      },
      50,
      timerSleep
    );
    expect(eRes.ok).toBe(false);
    if (!eRes.ok) expect(eRes.error.message).toBe('Socket drop');

    const sRes = await withTimeout(
      async () => {
        throw 'non-error';
      },
      50,
      timerSleep
    );
    expect(sRes.ok).toBe(false);
    if (!sRes.ok) expect(sRes.error.message).toBe('Unknown runtime failure.');
  });
});

describe('OpenMeteoProvider HTTP, schema, and defaults', () => {
  it('handles invalidCity, signal, HTTP 500, and schema failure', async () => {
    const provider500 = new OpenMeteoProvider(
      { fetch: async () => new Response('err', { status: 500 }) },
      fakeClock
    );
    const badCity = await provider500.fetchHourly('NowhereCity');
    expect(badCity.ok).toBe(false);
    if (!badCity.ok) expect(badCity.error.code).toBe('invalidCity');
    const ac = new AbortController();
    const httpErr = await provider500.fetchHourly('Delhi', ac.signal);
    expect(httpErr.ok).toBe(false);
    if (!httpErr.ok) expect(httpErr.error.code).toBe('http');

    const badSchema = await new OpenMeteoProvider(
      { fetch: async () => new Response(JSON.stringify({ wrong: 1 })) },
      fakeClock
    ).fetchHourly('Delhi');
    expect(badSchema.ok).toBe(false);
    if (!badSchema.ok) expect(badSchema.error.code).toBe('schema');
  });

  it('handles missing day matches and null/negative defaults', async () => {
    const payload = {
      utc_offset_seconds: 0,
      hourly: {
        time: ['2020-01-01T00:00', '2020-01-01T01:00', '2020-01-01T02:00'],
        pm2_5: [null, -4, 90],
        pm10: [null, 50, 70],
      },
    };
    const fetcher: FetchPort = {
      fetch: async () => new Response(JSON.stringify(payload)),
    };
    const res = await new OpenMeteoProvider(fetcher, fakeClock).fetchHourly(
      'Delhi'
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.readings[0]).toEqual({ hour: 0, pm25: 25, pm10: 40 });
      expect(res.value.readings[1]).toEqual({ hour: 1, pm25: 0, pm10: 50 });
      expect(res.value.readings[2]).toEqual({ hour: 2, pm25: 90, pm10: 90 });
    }
  });
});

describe('OpenMeteoProvider fetch errors and interpolation', () => {
  it('maps AbortError, TimeoutError, and generic network errors', async () => {
    const namedErr = (name: string) => Object.assign(new Error(name), { name });
    const cases: Array<[unknown, string]> = [
      [namedErr('AbortError'), 'aborted'],
      [namedErr('TimeoutError'), 'timeout'],
      ['plain-failure', 'network'],
    ];
    for (const [thrown, code] of cases) {
      const res = await new OpenMeteoProvider(
        { fetch: () => Promise.reject(thrown) },
        fakeClock
      ).fetchHourly('Delhi');
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe(code);
    }
  });

  it('fills leading/trailing hours and rejects out-of-range series', () => {
    const res = interpolateHourlySeries([
      { hour: 2, pm25: 80, pm10: 120 },
      { hour: 20, pm25: 140, pm10: 210 },
    ]);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value[0]?.pm25).toBe(80);
      expect(res.value[23]?.pm25).toBe(140);
    }
    expect(interpolateHourlySeries([{ hour: -1, pm25: 50, pm10: 80 }])).toEqual(
      err({
        code: 'EMPTY_READINGS',
        message: 'No valid hourly readings within 0 to 23 hours range.',
      })
    );
  });
});

describe('Air data abort short-circuit and AirNowPanel cache', () => {
  it('skips SampleProvider on aborted live fetch and skips refetch when live city cached', async () => {
    const sampleFetch = vi.fn(async () =>
      ok({ city: 'Delhi', isSample: true, readings: [] })
    );
    const abortRes = await fetchAirDataWithFallback(
      {
        id: 'open-meteo',
        fetchHourly: async () => err({ code: 'aborted', message: 'Aborted' }),
      },
      { id: 'sample', fetchHourly: sampleFetch },
      'Delhi'
    );
    expect(abortRes.ok).toBe(false);
    expect(sampleFetch).not.toHaveBeenCalled();

    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const readings = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      pm25: 120,
      pm10: 200,
    }));
    useAppStore.setState({
      selectedCity: 'Delhi',
      hourlySeries: { city: 'Delhi', isSample: false, readings },
    });
    render(createElement(AirNowPanel));
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

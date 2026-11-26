import type { AirDataError, AirDataProvider, HourlySeries } from '../contracts';
import { type Result, ok } from '../../shared/result';

/** Result envelope returning hourly data with source provenance and fallback metadata. */
export interface AirDataFetchResult {
  readonly series: HourlySeries;
  readonly source: 'live' | 'sample';
  readonly fallbackReason?: AirDataError;
}

/** Fetches atmospheric data from the primary provider, falling back to scenario simulations on failure. */
export async function fetchAirDataWithFallback(
  liveProvider: AirDataProvider,
  sampleProvider: AirDataProvider,
  city: string,
  signal?: AbortSignal
): Promise<Result<AirDataFetchResult, AirDataError>> {
  const liveResult = await liveProvider.fetchHourly(city, signal);
  if (liveResult.ok || liveResult.error.code === 'aborted') {
    return liveResult.ok
      ? ok({ series: liveResult.value, source: 'live' })
      : liveResult;
  }

  const sampleResult = await sampleProvider.fetchHourly(city, signal);
  if (sampleResult.ok) {
    return ok({
      series: { ...sampleResult.value, isSample: true },
      source: 'sample',
      fallbackReason: liveResult.error,
    });
  }

  return sampleResult;
}

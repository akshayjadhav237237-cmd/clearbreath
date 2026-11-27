import * as z from 'zod/mini';
import type { HourlyReading } from '../../domain/contracts';
import { toInteger } from '../../domain/units';
import type { Clock, FetchPort } from '../../shared/ports';
import { type Result, err, ok } from '../../shared/result';
import {
  OPEN_METEO_AIR_QUALITY_ENDPOINT,
  OPEN_METEO_ATTRIBUTION_TEXT,
} from '../../config/constants';
import { getCityById } from '../../config/cities';
import type { AirDataError, AirDataProvider, HourlySeries } from '../contracts';

const openMeteoSchema = z.object({
  utc_offset_seconds: z.prefault(z.number(), 19800),
  hourly: z.object({
    time: z.array(z.string()),
    pm2_5: z.array(z.nullable(z.number())),
    pm10: z.array(z.nullable(z.number())),
  }),
});

/** Ambient atmospheric data provider backed by the Open-Meteo Air Quality REST API. */
export class OpenMeteoProvider implements AirDataProvider {
  readonly id = 'open-meteo' as const;

  constructor(
    private readonly fetcher: FetchPort,
    private readonly clock: Clock,
    private readonly endpoint = OPEN_METEO_AIR_QUALITY_ENDPOINT
  ) {}

  /** Retrieves 24-hour diurnal particulate readings for an allowlisted Indian city. */
  async fetchHourly(
    city: string,
    signal?: AbortSignal
  ): Promise<Result<HourlySeries, AirDataError>> {
    const coords = getCityById(city);
    if (!coords) {
      return err({
        code: 'invalidCity',
        message: `City '${city}' is not registered.`,
      });
    }

    const url =
      `${this.endpoint}?latitude=${coords.latitude}&longitude=${coords.longitude}` +
      '&hourly=pm2_5,pm10&timezone=auto&forecast_days=1&past_days=1';

    try {
      const init: RequestInit = signal ? { signal } : {};
      const response = await this.fetcher.fetch(url, init);
      if (!response.ok) {
        return err({
          code: 'http',
          message: `Open-Meteo returned status ${response.status}.`,
        });
      }

      const json: unknown = await response.json();
      const parsed = openMeteoSchema.safeParse(json);
      if (!parsed.success) {
        return err({
          code: 'schema',
          message: 'Failed to parse Open-Meteo schema.',
        });
      }

      const readings = this.extractDayReadings(parsed.data);
      return ok({
        city,
        readings,
        isSample: false,
        attribution: OPEN_METEO_ATTRIBUTION_TEXT,
      });
    } catch (error: unknown) {
      return err(this.mapError(error));
    }
  }

  /** Selects and normalizes the 24-hour readings for the current local calendar day. */
  private extractDayReadings(
    data: z.infer<typeof openMeteoSchema>
  ): readonly HourlyReading[] {
    const { time, pm2_5, pm10 } = data.hourly;
    const offsetMs = data.utc_offset_seconds * 1000;
    const localNow = new Date(this.clock.now() + offsetMs);
    const localDateStr = localNow.toISOString().slice(0, 10);

    const dayIndices: number[] = [];
    time.forEach((t, i) => {
      if (t.startsWith(localDateStr)) {
        dayIndices.push(i);
      }
    });

    const targetIndices =
      dayIndices.length >= 24
        ? dayIndices.slice(0, 24)
        : time.map((_, i) => i).slice(0, 24);

    return targetIndices.map((idx, hour) => {
      const rawPm25 = pm2_5[idx];
      const rawPm10 = pm10[idx];
      const pm25 =
        rawPm25 !== null && rawPm25 !== undefined
          ? toInteger(Math.max(0, rawPm25))
          : 25;
      const pm10Val =
        rawPm10 !== null && rawPm10 !== undefined
          ? toInteger(Math.max(pm25, rawPm10))
          : toInteger(pm25 * 1.6);
      return { hour, pm25, pm10: pm10Val };
    });
  }

  /** Maps fetch exceptions to structured AirDataError objects. */
  private mapError(error: unknown): AirDataError {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { code: 'aborted', message: 'Request aborted.' };
      }
      if (error.name === 'TimeoutError') {
        return { code: 'timeout', message: 'Air data request timed out.' };
      }
    }
    return {
      code: 'network',
      message: 'Failed to connect to air data service.',
    };
  }
}

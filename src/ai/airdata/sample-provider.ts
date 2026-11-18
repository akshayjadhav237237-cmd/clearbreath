import type { HourlyReading } from '../../domain/contracts';
import { type Result, ok } from '../../shared/result';
import type { AirDataError, AirDataProvider, HourlySeries } from '../contracts';

/** Standard winter diurnal particulate dispersion factors (hour 0 to 23). */
const WINTER_DIURNAL_FACTORS: readonly number[] = [
  1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.4, 1.3, 1.1, 0.9, 0.75, 0.65, 0.6,
  0.65, 0.7, 0.8, 0.95, 1.1, 1.25, 1.3, 1.35, 1.3, 1.25,
];

/** Synthesizes a 24-hour diurnal particulate time-series from a base concentration. */
function generateDiurnalSeries(basePm25: number): readonly HourlyReading[] {
  return WINTER_DIURNAL_FACTORS.map((factor, hour) => {
    const pm25 = Math.round(basePm25 * factor);
    const pm10 = Math.round(pm25 * 1.6);
    return { hour, pm25, pm10 };
  });
}

/** Pre-computed sample scenarios for reliable offline demonstration and testing. */
export const SAMPLE_SCENARIOS = {
  delhiSevere: generateDiurnalSeries(240),
  puneModerate: generateDiurnalSeries(45),
  cleanDay: generateDiurnalSeries(15),
} as const;

/** Deterministic air data provider serving clearly labeled scenario simulation fixtures. */
export class SampleProvider implements AirDataProvider {
  readonly id = 'sample' as const;

  constructor(
    private readonly scenario: keyof typeof SAMPLE_SCENARIOS = 'delhiSevere'
  ) {}

  /** Retrieves 24-hour diurnal readings for a chosen sample scenario. */
  async fetchHourly(city: string): Promise<Result<HourlySeries, AirDataError>> {
    const readings =
      SAMPLE_SCENARIOS[this.scenario] ?? SAMPLE_SCENARIOS.delhiSevere;
    return ok({
      city,
      readings,
      isSample: true,
      attribution: 'Sample atmospheric scenario simulation',
    });
  }
}

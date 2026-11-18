import type { HourlyReading } from '../../domain/contracts';
import { type Result, ok } from '../../shared/result';
import type { AirDataError, AirDataProvider, HourlySeries } from '../contracts';

/** Options for manual air quality series generation. */
export interface ManualAirDataOptions {
  readonly pm25: number;
  readonly pm10?: number;
  readonly shape?: 'flat' | 'diurnal';
}

/** Standard normalized winter inversion scaling coefficients across 24 hours. */
const DIURNAL_COEFFICIENTS: readonly number[] = [
  1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.35, 1.25, 1.1, 0.9, 0.75, 0.65, 0.6, 0.65,
  0.7, 0.8, 0.9, 1.05, 1.15, 1.25, 1.3, 1.25, 1.2, 1.15,
];

/** Manual air data provider generating series from direct user input. */
export class ManualProvider implements AirDataProvider {
  readonly id = 'manual' as const;

  constructor(private readonly options: ManualAirDataOptions) {}

  /** Formulates a 24-hour diurnal series based on user-entered concentrations. */
  async fetchHourly(city: string): Promise<Result<HourlySeries, AirDataError>> {
    const basePm25 = Math.max(0, Math.round(this.options.pm25));
    const basePm10 = Math.max(
      basePm25,
      Math.round(this.options.pm10 ?? basePm25 * 1.6)
    );
    const isDiurnal = this.options.shape === 'diurnal';

    const readings: HourlyReading[] = [];
    for (let hour = 0; hour < 24; hour += 1) {
      const coeff = isDiurnal ? (DIURNAL_COEFFICIENTS[hour] ?? 1.0) : 1.0;
      readings.push({
        hour,
        pm25: Math.round(basePm25 * coeff),
        pm10: Math.round(basePm10 * coeff),
      });
    }

    return ok({
      city,
      readings,
      isSample: true,
      attribution: 'User manual input specification',
    });
  }
}

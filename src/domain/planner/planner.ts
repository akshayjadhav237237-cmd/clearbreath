import type { Result } from '../../shared/result';
import { err, ok } from '../../shared/result';
import { calculateAqi } from '../aqi';
import type {
  AqiResult,
  DailyPlan,
  DomainError,
  GenerateDailyPlanFn,
  HourlyReading,
  Lifestyle,
  SensitivityLevel,
} from '../contracts';
import { generateAdvisorySummary } from './advisory';
import { interpolateHourlySeries } from './interpolation';
import { detectOutdoorWindows } from './outdoor-windows';
import { computePurifierSchedule } from './purifier-schedule';
import { detectBestVentilationWindow } from './ventilation';

/** Computes per-hour AQI results across a 24-hour reading series. */
function computeHourlyAqi(
  series: readonly HourlyReading[]
): Result<readonly AqiResult[], DomainError> {
  const hourlyAqi: AqiResult[] = [];
  for (const r of series) {
    const aqiRes = calculateAqi({ pm25: r.pm25, pm10: r.pm10 });
    if (!aqiRes.ok) {
      return err(aqiRes.error);
    }
    hourlyAqi.push(aqiRes.value);
  }
  return ok(hourlyAqi);
}

/** Generates personalized diurnal activity, ventilation, and air purifier schedule. */
export const generateDailyPlan: GenerateDailyPlanFn = (
  readings: readonly HourlyReading[],
  sensitivity: SensitivityLevel,
  lifestyle: Lifestyle
): Result<DailyPlan, DomainError> => {
  const seriesResult = interpolateHourlySeries(readings);
  if (!seriesResult.ok) {
    return err(seriesResult.error);
  }

  const hourlyAqiResult = computeHourlyAqi(seriesResult.value);
  if (!hourlyAqiResult.ok) {
    return err(hourlyAqiResult.error);
  }

  const hourlyAqi = hourlyAqiResult.value;
  const isAllSevere = hourlyAqi.every(
    (a) => a.value > 400 || a.category === 'severe'
  );

  const outdoorWindows = detectOutdoorWindows(
    hourlyAqi,
    sensitivity,
    lifestyle
  );
  const bestVentilationWindow = detectBestVentilationWindow(
    seriesResult.value,
    hourlyAqi
  );
  const purifierSchedule = computePurifierSchedule(hourlyAqi);
  const advisorySummary = generateAdvisorySummary(
    isAllSevere,
    outdoorWindows,
    bestVentilationWindow,
    sensitivity
  );

  return ok({
    outdoorWindows,
    bestVentilationWindow,
    purifierSchedule,
    hourlyAqi,
    advisorySummary,
  });
};

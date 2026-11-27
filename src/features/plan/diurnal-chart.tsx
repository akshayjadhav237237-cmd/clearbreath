import type { JSX } from 'react';
import type { DailyPlan, HourlyReading } from '../../domain/contracts';
import type { Language } from '../../shared/i18n';
import { getPlanDict } from '../../shared/i18n/plan-dict';

type OutdoorWindow = DailyPlan['outdoorWindows'][number];

interface DiurnalBar {
  readonly hour: number;
  readonly value: number;
}

/** Props for the 24-hour diurnal particulate bar chart component. */
export interface DiurnalChartProps {
  readonly readings: readonly HourlyReading[];
  readonly hourlyAqi?: DailyPlan['hourlyAqi'];
  readonly bestWindow: OutdoorWindow | null;
  readonly maxPm25: number;
  readonly language?: Language;
}

function buildDiurnalSeries(
  readings: readonly HourlyReading[],
  hourlyAqi: DailyPlan['hourlyAqi'] | undefined,
  maxPm25: number
): {
  readonly mode: 'pm25' | 'aqi';
  readonly bars: readonly DiurnalBar[];
  readonly peakValue: number;
} {
  if (readings.length > 0) {
    return {
      mode: 'pm25',
      bars: readings.map((r) => ({ hour: r.hour, value: r.pm25 })),
      peakValue: maxPm25,
    };
  }
  const aqiBars = (hourlyAqi ?? []).map((a, hour) => ({
    hour,
    value: a.value,
  }));
  const peakAqi = aqiBars.reduce((mx, b) => (b.value > mx ? b.value : mx), 0);
  return { mode: 'aqi', bars: aqiBars, peakValue: peakAqi };
}

function formatAxisHourLabel(hour: number, language: Language): string {
  if (hour % 6 !== 0) return '';
  return `${hour}${language === 'hi' ? 'ब' : 'h'}`;
}

/** Visual diurnal curve rendering hourly PM2.5 levels and the safest outdoor window. */
export function DiurnalChart({
  readings,
  hourlyAqi,
  bestWindow,
  maxPm25,
  language = 'en',
}: DiurnalChartProps): JSX.Element {
  const dict = getPlanDict(language);
  const { mode, bars, peakValue } = buildDiurnalSeries(
    readings,
    hourlyAqi,
    maxPm25
  );
  const profileTitle =
    mode === 'pm25' ? dict.chart.profilePm25 : dict.chart.profileAqi;
  const peakDisplay =
    mode === 'pm25'
      ? `${peakValue} ${dict.chart.ugM3Unit}`
      : `${dict.chart.aqiUnit} ${peakValue}`;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span>{profileTitle}</span>
        <span>
          {dict.chart.peakLabel}: {peakDisplay}
        </span>
      </div>
      <div className="mt-3 flex h-28 items-end gap-1 rounded-xl bg-slate-50 p-2 dark:bg-slate-950">
        {bars.map((bar) => {
          const heightPct = Math.min(
            100,
            Math.round((bar.value / Math.max(1, peakValue)) * 100)
          );
          const isBestWindow =
            bestWindow !== null &&
            bar.hour >= bestWindow.startHour &&
            bar.hour <= bestWindow.endHour;
          return (
            <div
              key={bar.hour}
              className="group relative flex-1 flex flex-col items-center justify-end h-full"
            >
              <div
                style={{ height: `${heightPct}%` }}
                className={`w-full rounded-t-sm transition-all ${
                  isBestWindow
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-rose-400 hover:bg-rose-500 dark:bg-rose-600'
                }`}
              />
              <span className="mt-1 text-[9px] text-slate-700 dark:text-slate-300">
                {formatAxisHourLabel(bar.hour, language)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import type { JSX } from 'react';
import type { DailyPlan, HourlyReading } from '../../domain/contracts';

type OutdoorWindow = DailyPlan['outdoorWindows'][number];

/** Props for the 24-hour diurnal particulate bar chart component. */
export interface DiurnalChartProps {
  readonly readings: readonly HourlyReading[];
  readonly bestWindow: OutdoorWindow;
  readonly maxPm25: number;
}

/** Visual diurnal curve rendering hourly PM2.5 levels and the safest outdoor window. */
export function DiurnalChart({
  readings,
  bestWindow,
  maxPm25,
}: DiurnalChartProps): JSX.Element {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span>24h Diurnal Particulate Profile (PM2.5)</span>
        <span>Peak: {maxPm25} µg/m³</span>
      </div>
      <div className="mt-3 flex h-28 items-end gap-1 rounded-xl bg-slate-50 p-2 dark:bg-slate-950">
        {readings.map((r) => {
          const heightPct = Math.min(
            100,
            Math.round((r.pm25 / Math.max(1, maxPm25)) * 100)
          );
          const isBestWindow =
            r.hour >= bestWindow.startHour && r.hour <= bestWindow.endHour;
          return (
            <div
              key={r.hour}
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
                {r.hour % 6 === 0 ? `${r.hour}h` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

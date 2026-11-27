import type { JSX } from 'react';
import { CITIES } from '../../config/cities';
import type { AqiResult } from '../../domain/contracts';
import type { getTranslations } from '../../shared/i18n';
import { Badge } from '../../shared/ui';

interface AirNowHeaderProps {
  readonly selectedCity: string;
  readonly onSelectCity: (city: string) => void;
  readonly aqi: AqiResult;
  readonly isSample: boolean;
  readonly guidance: string;
  readonly aqiLabel: string;
  readonly t: ReturnType<typeof getTranslations>;
}

/** Header card displaying selected city, AQI status badges, and sensitivity guidance. */
export function AirNowHeader({
  selectedCity,
  onSelectCity,
  aqi,
  isSample,
  guidance,
  aqiLabel,
  t,
}: AirNowHeaderProps): JSX.Element {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="airnow-heading"
            className="text-xl font-bold text-slate-900 dark:text-slate-50"
          >
            {t.airNow.title} — {selectedCity}
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <Badge severity={aqi.category} size="md">
              {t.severity[aqi.category]} ({aqiLabel} {aqi.value})
            </Badge>
            <Badge severity={isSample ? 'neutral' : 'info'}>
              {isSample ? t.airNow.sampleBadge : t.airNow.liveBadge}
            </Badge>
          </div>
        </div>
        <div>
          <label
            htmlFor="city-select"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            {t.airNow.citySelect}
          </label>
          <select
            id="city-select"
            value={selectedCity}
            onChange={(e) => onSelectCity(e.target.value)}
            className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {CITIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-slate-700 dark:text-slate-300">
        {guidance}
      </p>
    </div>
  );
}

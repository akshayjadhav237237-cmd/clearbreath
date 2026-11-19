import { useEffect, type JSX } from 'react';
import { useAppStore } from '../../app/store';
import { CITIES } from '../../config/cities';
import { calculateAqi, getAqiGuidance } from '../../domain/aqi';
import { determineHouseholdSensitivity } from '../../domain/profile';
import { Badge, MetricCard } from '../../shared/ui';
import { getTranslations } from '../../shared/i18n';
import { fetchAirDataWithFallback } from '../../ai/airdata/fallback-chain';
import { OpenMeteoProvider } from '../../ai/airdata/open-meteo-provider';
import { SampleProvider } from '../../ai/airdata/sample-provider';
import { SystemClock, SystemFetchPort } from '../../shared/system-ports';
import { OPEN_METEO_ATTRIBUTION_TEXT } from '../../config/constants';
import type { AqiResult, HourlyReading } from '../../domain/contracts';

interface AirNowHeaderProps {
  readonly selectedCity: string;
  readonly onSelectCity: (city: string) => void;
  readonly aqi: AqiResult;
  readonly isSample: boolean;
  readonly guidance: string;
  readonly t: ReturnType<typeof getTranslations>;
}

function AirNowHeader({
  selectedCity,
  onSelectCity,
  aqi,
  isSample,
  guidance,
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
              {aqi.category.toUpperCase()} (AQI {aqi.value})
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

interface MetricsProps {
  readonly currentReading: HourlyReading;
  readonly aqi: AqiResult;
  readonly t: ReturnType<typeof getTranslations>;
}

function AirNowMetrics({ currentReading, aqi, t }: MetricsProps): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <MetricCard
        label={t.airNow.pm25}
        value={currentReading.pm25}
        unit="µg/m³"
        tooltip="CPCB NAQI 24h average breakpoint model"
      />
      <MetricCard
        label={t.airNow.pm10}
        value={currentReading.pm10}
        unit="µg/m³"
        tooltip="Inhalable coarse particle concentration"
      />
      <MetricCard
        label={t.airNow.dominant}
        value={aqi.dominant === 'pm25' ? 'PM2.5' : 'PM10'}
        tooltip="Governs total AQI value via highest sub-index"
      />
    </div>
  );
}

/** Interactive ambient air quality monitoring panel showing diurnal particulates and CPCB indices. */
export function AirNowPanel(): JSX.Element {
  const {
    selectedCity,
    setSelectedCity,
    hourlySeries,
    setHourlySeries,
    setAirDataLoading,
    profile,
    language,
  } = useAppStore();
  const t = getTranslations(language);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setAirDataLoading(true);
      const live = new OpenMeteoProvider(
        new SystemFetchPort(),
        new SystemClock()
      );
      const sample = new SampleProvider(
        selectedCity === 'Delhi' ? 'delhiSevere' : 'puneModerate'
      );
      const res = await fetchAirDataWithFallback(live, sample, selectedCity);
      if (!cancelled) {
        setAirDataLoading(false);
        if (res.ok) setHourlySeries(res.value.series);
      }
    }
    void loadData();
    return () => {
      cancelled = true;
    };
  }, [selectedCity, setAirDataLoading, setHourlySeries]);

  const currentReading = hourlySeries?.readings[12] ?? {
    hour: 12,
    pm25: 180,
    pm10: 290,
  };
  const aqiRes = calculateAqi(currentReading);
  const aqi: AqiResult = aqiRes.ok
    ? aqiRes.value
    : { value: 180, category: 'moderate', dominant: 'pm25' };
  const sensitivity = determineHouseholdSensitivity(profile.members);
  const guidance = getAqiGuidance(aqi.category, sensitivity);

  return (
    <section aria-labelledby="airnow-heading" className="space-y-6">
      <AirNowHeader
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        aqi={aqi}
        isSample={Boolean(hourlySeries?.isSample)}
        guidance={guidance}
        t={t}
      />
      <AirNowMetrics currentReading={currentReading} aqi={aqi} t={t} />

      <div className="text-center text-[11px] text-slate-700 dark:text-slate-300">
        <a
          href="https://open-meteo.com/en/docs/air-quality-api"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-slate-900 dark:hover:text-slate-100"
        >
          {OPEN_METEO_ATTRIBUTION_TEXT}
        </a>
      </div>
    </section>
  );
}

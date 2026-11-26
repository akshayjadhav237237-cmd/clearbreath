import { useEffect, type JSX } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AIR_DATA_TIMEOUT_MS } from '../../config';
import { useAppStore, type AppState } from '../../app/store';
import { calculateAqi, getAqiGuidance } from '../../domain/aqi';
import { determineHouseholdSensitivity } from '../../domain/profile';
import { MetricCard } from '../../shared/ui';
import { getTranslations } from '../../shared/i18n';
import { fetchAirDataWithFallback } from '../../ai/airdata/fallback-chain';
import { OpenMeteoProvider } from '../../ai/airdata/open-meteo-provider';
import { SampleProvider } from '../../ai/airdata/sample-provider';
import { SystemClock, SystemFetchPort } from '../../shared/system-ports';
import { OPEN_METEO_ATTRIBUTION_TEXT } from '../../config/constants';
import type { AqiResult, HourlyReading } from '../../domain/contracts';
import { AirNowHeader } from './air-now-header';

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
async function fetchCitySeries(city: string, signal: AbortSignal) {
  const live = new OpenMeteoProvider(new SystemFetchPort(), new SystemClock());
  const sample = new SampleProvider(
    city === 'Delhi' ? 'delhiSevere' : 'puneModerate'
  );
  return fetchAirDataWithFallback(live, sample, city, signal);
}

function useAirNowLoader(
  selectedCity: string,
  setAirDataLoading: AppState['setAirDataLoading'],
  setHourlySeries: AppState['setHourlySeries']
): void {
  useEffect(() => {
    const cached = useAppStore.getState().hourlySeries;
    if (cached && !cached.isSample && cached.city === selectedCity) {
      return;
    }
    let unmounted = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort(
        new DOMException('Air data request timed out.', 'TimeoutError')
      );
    }, AIR_DATA_TIMEOUT_MS);

    async function loadData(): Promise<void> {
      setAirDataLoading(true);
      try {
        const res = await fetchCitySeries(selectedCity, controller.signal);
        if (!unmounted) {
          setAirDataLoading(false);
          if (res.ok) setHourlySeries(res.value.series);
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    void loadData();
    return () => {
      unmounted = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [selectedCity, setAirDataLoading, setHourlySeries]);
}

/** Ambient air quality dashboard panel supporting live city telemetry and sample presets. */
export function AirNowPanel(): JSX.Element {
  const {
    selectedCity,
    setSelectedCity,
    hourlySeries,
    setHourlySeries,
    setAirDataLoading,
    profile,
    language,
  } = useAppStore(
    useShallow((s) => ({
      selectedCity: s.selectedCity,
      setSelectedCity: s.setSelectedCity,
      hourlySeries: s.hourlySeries,
      setHourlySeries: s.setHourlySeries,
      setAirDataLoading: s.setAirDataLoading,
      profile: s.profile,
      language: s.language,
    }))
  );
  const t = getTranslations(language);

  useAirNowLoader(selectedCity, setAirDataLoading, setHourlySeries);

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

import type { JSX } from 'react';
import { useAppStore } from '../../app/store';
import { calculateAqi } from '../../domain/aqi';
import { Badge } from '../../shared/ui';
import { getTranslations } from '../../shared/i18n';
import type { AqiResult } from '../../domain/contracts';

/** Generates shareable air quality advisories for residential welfare associations and community groups. */
export function CommunityPanel(): JSX.Element {
  const { selectedCity, hourlySeries, showToast, language } = useAppStore();
  const t = getTranslations(language);

  const sampleReading = hourlySeries?.readings[12];
  const aqiCalculation = calculateAqi(
    sampleReading ?? { hour: 12, pm25: 160, pm10: 260 }
  );
  const aqi: AqiResult = aqiCalculation.ok
    ? aqiCalculation.value
    : { value: 160, category: 'moderate', dominant: 'pm25' };

  const broadcastText =
    `📢 *Clearbreath Neighborhood Air Advisory — ${selectedCity}*\n\n` +
    `⚠️ Current AQI: *${aqi.value} (${aqi.category.toUpperCase()})*\n` +
    `☀️ Safest Outdoor Hours: *12:00 PM – 3:00 PM*\n\n` +
    `*Top Community Actions Today:*\n` +
    `1. 🚫 Prohibit open biomass or dry leaf burning in society grounds.\n` +
    `2. 🚗 Opt for carpooling or Metro to eliminate 2.4 kg CO2e per trip.\n` +
    `3. 🧹 Use wet-mopping rather than dry-sweeping in common corridors.\n\n` +
    `_Powered by Clearbreath • CPCB & EPA Clean Air Models_`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(broadcastText);
      showToast(t.community.copiedNotice);
    } catch {
      showToast('Could not access clipboard.');
    }
  };

  return (
    <section aria-labelledby="community-heading" className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2
          id="community-heading"
          className="text-xl font-bold text-slate-900 dark:text-slate-50"
        >
          {t.community.title}
        </h2>
        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
          {t.community.desc}
        </p>
      </div>

      <article className="rounded-2xl border border-sky-200 bg-sky-50/30 p-6 shadow-sm dark:border-sky-900 dark:bg-sky-950/20">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3 dark:border-sky-900">
          <div className="flex items-center gap-2">
            <span className="text-lg">📢</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              WhatsApp / RWA Broadcast Draft
            </h3>
          </div>
          <Badge severity={aqi.category}>{aqi.category.toUpperCase()}</Badge>
        </div>

        <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 font-mono text-xs text-slate-800 shadow-inner dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 leading-relaxed">
          {broadcastText}
        </pre>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            📋 {t.community.copyBroadcast}
          </button>
        </div>
      </article>
    </section>
  );
}

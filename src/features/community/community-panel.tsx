import { useMemo, type JSX } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../app/store';
import { Badge } from '../../shared/ui';
import { getTranslations } from '../../shared/i18n';
import {
  formatCommunityBroadcast,
  getShellDict,
} from '../../shared/i18n/shell-dict';
import { selectCurrentAqi, selectDayPlan } from '../../shared/state/selectors';

/** Generates shareable air quality advisories for residential welfare associations and community groups. */
export function CommunityPanel(): JSX.Element {
  const { selectedCity, hourlySeries, profile, showToast, language } =
    useAppStore(
      useShallow((s) => ({
        selectedCity: s.selectedCity,
        hourlySeries: s.hourlySeries,
        profile: s.profile,
        showToast: s.showToast,
        language: s.language,
      }))
    );
  const t = getTranslations(language);
  const shell = getShellDict(language);

  const aqi = useMemo(
    () => selectCurrentAqi({ selectedCity, hourlySeries, profile }),
    [selectedCity, hourlySeries, profile]
  );
  const dayPlan = useMemo(
    () => selectDayPlan({ selectedCity, hourlySeries, profile }),
    [selectedCity, hourlySeries, profile]
  );

  const categoryLabel = t.severity[aqi.category];
  const bestWin = dayPlan.outdoorWindows[0];
  const broadcastText = formatCommunityBroadcast({
    language,
    city: selectedCity,
    aqiValue: aqi.value,
    categoryLabel,
    ...(bestWin ? { outdoorWindow: bestWin } : {}),
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(broadcastText);
      showToast(t.community.copiedNotice);
    } catch {
      showToast(shell.clipboardError);
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
              {shell.draftHeading}
            </h3>
          </div>
          <Badge severity={aqi.category}>{categoryLabel}</Badge>
        </div>

        <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 font-mono text-xs leading-relaxed text-slate-800 shadow-inner dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          {broadcastText}
        </pre>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="rounded-xl bg-sky-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            📋 {t.community.copyBroadcast}
          </button>
        </div>
      </article>
    </section>
  );
}

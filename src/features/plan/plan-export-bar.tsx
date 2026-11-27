import type { JSX } from 'react';
import { useAppStore } from '../../app/store';
import type { DailyPlan, RecommendationResult } from '../../domain/contracts';
import type { Language } from '../../shared/i18n';
import { getPlanDict, type PlanDict } from '../../shared/i18n/plan-dict';
import { usePlanExports } from './use-plan-exports';

interface ActionButtonsProps {
  readonly labels: PlanDict['exports'];
  readonly onExportCsv: () => void;
  readonly onExportIcs: () => void;
  readonly onExportJson: () => void;
  readonly onImportClick: () => void;
  readonly onPrint: () => void;
}

function ActionButtons({
  labels,
  onExportCsv,
  onExportIcs,
  onExportJson,
  onImportClick,
  onPrint,
}: ActionButtonsProps): JSX.Element {
  const btnClass =
    'rounded-lg border border-slate-200 bg-slate-50 px-3 py-[6px] text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onExportCsv}
        aria-label={labels.exportCsv}
        className={btnClass}
      >
        {labels.exportCsv}
      </button>
      <button
        type="button"
        onClick={onExportIcs}
        aria-label={labels.exportCalendar}
        className={btnClass}
      >
        {labels.exportCalendar}
      </button>
      <button
        type="button"
        onClick={onExportJson}
        aria-label={labels.backupProfile}
        className={btnClass}
      >
        {labels.backupProfile}
      </button>
      <button
        type="button"
        onClick={onImportClick}
        aria-label={labels.restoreProfile}
        className={btnClass}
      >
        {labels.restoreProfile}
      </button>
      <button
        type="button"
        onClick={onPrint}
        aria-label={labels.printFamilyPlan}
        className="rounded-lg bg-sky-700 px-3.5 py-[6px] text-xs font-bold text-white hover:bg-sky-800"
      >
        {labels.printFamilyPlan}
      </button>
    </div>
  );
}

/** Props for the plan export and import action bar. */
export interface PlanExportBarProps {
  readonly plan: DailyPlan;
  readonly recommendations?: RecommendationResult;
  readonly onPrint: () => void;
  readonly language?: Language;
}

/** Accessible export, backup, and print toolbar with live-region status announcements. */
export function PlanExportBar({
  plan,
  recommendations,
  onPrint,
  language,
}: PlanExportBarProps): JSX.Element {
  const storeLanguage = useAppStore((s) => s.language);
  const activeLanguage = language ?? storeLanguage;
  const dict = getPlanDict(activeLanguage);
  const {
    statusMessage,
    fileInputRef,
    handleExportCsv,
    handleExportIcs,
    handleExportJson,
    handleImportJson,
  } = usePlanExports(plan, recommendations, activeLanguage);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {dict.exports.heading}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {dict.exports.subtitle}
          </p>
        </div>
        <ActionButtons
          labels={dict.exports}
          onExportCsv={handleExportCsv}
          onExportIcs={handleExportIcs}
          onExportJson={handleExportJson}
          onImportClick={() => fileInputRef.current?.click()}
          onPrint={onPrint}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          aria-label={dict.exports.uploadAriaLabel}
          className="sr-only"
          onChange={handleImportJson}
        />
      </div>
      <div
        role="status"
        aria-live="polite"
        className="mt-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 empty:hidden"
      >
        {statusMessage}
      </div>
    </div>
  );
}

import type { JSX } from 'react';
import type { DailyPlan, RecommendationResult } from '../../domain/contracts';
import { usePlanExports } from './use-plan-exports';

interface ActionButtonsProps {
  readonly onExportCsv: () => void;
  readonly onExportIcs: () => void;
  readonly onExportJson: () => void;
  readonly onImportClick: () => void;
  readonly onPrint: () => void;
}

function ActionButtons({
  onExportCsv,
  onExportIcs,
  onExportJson,
  onImportClick,
  onPrint,
}: ActionButtonsProps): JSX.Element {
  const btnClass =
    'rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onExportCsv}
        aria-label="Export CSV"
        className={btnClass}
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={onExportIcs}
        aria-label="Export Calendar"
        className={btnClass}
      >
        Export Calendar
      </button>
      <button
        type="button"
        onClick={onExportJson}
        aria-label="Backup Profile"
        className={btnClass}
      >
        Backup Profile
      </button>
      <button
        type="button"
        onClick={onImportClick}
        aria-label="Restore Profile"
        className={btnClass}
      >
        Restore Profile
      </button>
      <button
        type="button"
        onClick={onPrint}
        aria-label="Print Family Plan"
        className="rounded-lg bg-sky-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-800"
      >
        Print Family Plan
      </button>
    </div>
  );
}

/** Props for the plan export and import action bar. */
export interface PlanExportBarProps {
  readonly plan: DailyPlan;
  readonly recommendations?: RecommendationResult;
  readonly onPrint: () => void;
}

/** Accessible export, backup, and print toolbar with live-region status announcements. */
export function PlanExportBar({
  plan,
  recommendations,
  onPrint,
}: PlanExportBarProps): JSX.Element {
  const {
    statusMessage,
    fileInputRef,
    handleExportCsv,
    handleExportIcs,
    handleExportJson,
    handleImportJson,
  } = usePlanExports(plan, recommendations);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Export &amp; Print Routine
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Save schedule to calendar, export CSV data, or print family advisory
            card.
          </p>
        </div>
        <ActionButtons
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
          aria-label="Upload JSON Profile Backup"
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

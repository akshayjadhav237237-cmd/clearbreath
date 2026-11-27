import { useState, useRef, type ChangeEvent } from 'react';
import { useAppStore } from '../../app/store';
import {
  MAX_IMPORT_SIZE_BYTES,
  exportPlanCsv,
  exportDailyPlanIcs,
  exportProfileJson,
  importProfileJson,
  triggerBlobDownload,
  type RecommendationExportItem,
} from '../../exports';
import { SystemClock, SystemIdGenerator } from '../../shared/system-ports';
import type { Language } from '../../shared/i18n';
import { getPlanDict, type PlanDict } from '../../shared/i18n/plan-dict';
import type {
  DailyPlan,
  HouseholdProfile,
  RecommendationResult,
} from '../../domain/contracts';
import { ACTION_CATALOG } from '../../domain/actions';
import { generateRecommendations } from '../../domain/recommend';
import { selectCurrentAqi } from '../../shared/state/selectors';

interface ParseFileContext {
  readonly file: File;
  readonly language: Language;
  readonly messages: PlanDict['exports'];
  readonly onSuccess: (p: HouseholdProfile) => void;
  readonly onError: (msg: string) => void;
}

function parseAndLoadFile(ctx: ParseFileContext): void {
  if (ctx.file.size > MAX_IMPORT_SIZE_BYTES) {
    ctx.onError(ctx.messages.maxFileSizeError);
    return;
  }
  const reader = new FileReader();
  reader.onerror = (): void => ctx.onError(ctx.messages.readFileError);
  reader.onload = (ev): void => {
    const text = ev.target?.result;
    if (typeof text !== 'string') {
      ctx.onError(ctx.messages.invalidFileContent);
      return;
    }
    const res = importProfileJson(text, ctx.language);
    if (res.ok) ctx.onSuccess(res.value);
    else ctx.onError(res.error);
  };
  reader.readAsText(ctx.file);
}

function buildCsvItems(
  profile: HouseholdProfile,
  plan: DailyPlan,
  recommendations?: RecommendationResult
): readonly RecommendationExportItem[] {
  const source =
    recommendations ??
    (() => {
      const aqi = selectCurrentAqi({ profile, hourlySeries: null });
      const res = generateRecommendations(profile, aqi, plan, ACTION_CATALOG);
      return res.ok ? res.value : { items: [], decisionTrace: [] };
    })();
  return source.items.map((r) => ({
    action: r.action,
    dailyDoseReductionUg: r.dailyDoseReductionUg,
    doseReductionBasisPoints: r.doseReductionBasisPoints,
    co2eSavedGramsPerDay: r.co2eSavedGramsPerDay,
  }));
}

interface ImportContext {
  readonly file: File;
  readonly language: Language;
  readonly messages: PlanDict['exports'];
  readonly setProfile: (p: HouseholdProfile) => void;
  readonly showToast: (msg: string) => void;
  readonly setStatusMessage: (msg: string) => void;
}

function runProfileImport(ctx: ImportContext): void {
  parseAndLoadFile({
    file: ctx.file,
    language: ctx.language,
    messages: ctx.messages,
    onSuccess: (p) => {
      ctx.setProfile(p);
      ctx.showToast(ctx.messages.profileImported);
      ctx.setStatusMessage(ctx.messages.profileImported);
    },
    onError: (err) => {
      const msg = `${ctx.messages.importErrorPrefix} ${err}`;
      ctx.showToast(msg);
      ctx.setStatusMessage(msg);
    },
  });
}

function runCsvExport(
  profile: HouseholdProfile,
  plan: DailyPlan,
  activeLang: Language,
  opts: {
    readonly recs?: RecommendationResult;
    readonly notice: string;
    readonly onDone: (msg: string) => void;
  }
): void {
  const items = buildCsvItems(profile, plan, opts.recs);
  triggerBlobDownload(
    'clearbreath-plan.csv',
    exportPlanCsv(items, plan, activeLang),
    'text/csv'
  );
  opts.onDone(opts.notice);
}

function runIcsExport(
  plan: DailyPlan,
  activeLang: Language,
  notice: string,
  onDone: (msg: string) => void
): void {
  const ics = exportDailyPlanIcs(
    plan,
    new SystemClock(),
    new SystemIdGenerator(),
    activeLang
  );
  triggerBlobDownload('clearbreath-schedule.ics', ics, 'text/calendar');
  onDone(notice);
}

/** Custom hook managing plan export, calendar sync, backup, and restore routines. */
export function usePlanExports(
  plan: DailyPlan,
  recommendations?: RecommendationResult,
  language?: Language
) {
  const profile = useAppStore((s) => s.profile);
  const storeLanguage = useAppStore((s) => s.language);
  const setProfile = useAppStore((s) => s.setProfile);
  const showToast = useAppStore((s) => s.showToast);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeLang = language ?? storeLanguage;
  const dict = getPlanDict(activeLang);

  const handleExportCsv = (): void => {
    runCsvExport(profile, plan, activeLang, {
      ...(recommendations ? { recs: recommendations } : {}),
      notice: dict.exports.csvDownloaded,
      onDone: setStatusMessage,
    });
  };
  const handleExportIcs = (): void =>
    runIcsExport(
      plan,
      activeLang,
      dict.exports.icsDownloaded,
      setStatusMessage
    );
  const handleExportJson = (): void => {
    triggerBlobDownload(
      'clearbreath-profile.json',
      exportProfileJson(profile),
      'application/json'
    );
    setStatusMessage(dict.exports.jsonDownloaded);
  };
  const handleImportJson = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    runProfileImport({
      file,
      language: activeLang,
      messages: dict.exports,
      setProfile,
      showToast,
      setStatusMessage,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return {
    statusMessage,
    fileInputRef,
    handleExportCsv,
    handleExportIcs,
    handleExportJson,
    handleImportJson,
  };
}

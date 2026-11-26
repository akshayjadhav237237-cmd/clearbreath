import { useState, useRef, type ChangeEvent } from 'react';
import { useAppStore } from '../../app/store';
import { MAX_IMPORT_SIZE_BYTES } from '../../exports';
import {
  exportPlanCsv,
  exportDailyPlanIcs,
  exportProfileJson,
  importProfileJson,
  triggerBlobDownload,
  type RecommendationExportItem,
} from '../../exports';
import { SystemClock, SystemIdGenerator } from '../../shared/system-ports';
import type {
  DailyPlan,
  HouseholdProfile,
  RecommendationResult,
} from '../../domain/contracts';
import { ACTION_CATALOG } from '../../domain/actions';

function parseAndLoadFile(
  file: File,
  onSuccess: (p: HouseholdProfile) => void,
  onError: (msg: string) => void
): void {
  if (file.size > MAX_IMPORT_SIZE_BYTES) {
    onError('Import file exceeds maximum allowed size (50 KiB)');
    return;
  }
  const reader = new FileReader();
  reader.onerror = (): void => {
    onError('Failed to read import file.');
  };
  reader.onload = (ev): void => {
    const text = ev.target?.result;
    if (typeof text !== 'string') {
      onError('Invalid file content.');
      return;
    }
    const res = importProfileJson(text);
    if (res.ok) {
      onSuccess(res.value);
    } else {
      onError(res.error);
    }
  };
  reader.readAsText(file);
}

function buildCsvItems(
  recommendations?: RecommendationResult
): readonly RecommendationExportItem[] {
  if (recommendations) {
    return recommendations.items.map((r) => ({
      action: r.action,
      dailyDoseReductionUg: r.dailyDoseReductionUg,
      doseReductionBasisPoints: r.doseReductionBasisPoints,
      co2eSavedGramsPerDay: r.co2eSavedGramsPerDay,
    }));
  }
  return ACTION_CATALOG.slice(0, 5).map((action) => ({
    action,
    dailyDoseReductionUg: 300,
    doseReductionBasisPoints: 1000,
    co2eSavedGramsPerDay: 200,
  }));
}

/** Custom hook managing plan export, calendar sync, backup, and restore routines. */
export function usePlanExports(
  plan: DailyPlan,
  recommendations?: RecommendationResult
) {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const showToast = useAppStore((s) => s.showToast);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCsv = (): void => {
    const csv = exportPlanCsv(buildCsvItems(recommendations), plan);
    triggerBlobDownload('clearbreath-plan.csv', csv, 'text/csv');
    setStatusMessage('Plan CSV downloaded successfully.');
  };

  const handleExportIcs = (): void => {
    const ics = exportDailyPlanIcs(
      plan,
      new SystemClock(),
      new SystemIdGenerator()
    );
    triggerBlobDownload('clearbreath-schedule.ics', ics, 'text/calendar');
    setStatusMessage('Calendar schedule ICS downloaded successfully.');
  };

  const handleExportJson = (): void => {
    const json = exportProfileJson(profile);
    triggerBlobDownload('clearbreath-profile.json', json, 'application/json');
    setStatusMessage('Household profile JSON downloaded successfully.');
  };

  const handleImportJson = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseAndLoadFile(
      file,
      (p) => {
        setProfile(p);
        showToast('Profile imported.');
        setStatusMessage('Profile imported.');
      },
      (err) => {
        showToast(`Import error: ${err}`);
        setStatusMessage(`Import error: ${err}`);
      }
    );
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

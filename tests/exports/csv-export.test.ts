import { describe, it, expect } from 'vitest';
import type { Action, DailyPlan } from '../../src/domain/contracts';
import {
  sanitizeCsvCell,
  exportPlanCsv,
  type RecommendationExportItem,
} from '../../src/exports';

describe('CSV export with formula-injection guard', () => {
  it('neutralizes formula injection characters by prefixing with single quote', () => {
    expect(sanitizeCsvCell('=1+1')).toBe("'=1+1");
    expect(sanitizeCsvCell('+cmd|')).toBe("'+cmd|");
    expect(sanitizeCsvCell('-5')).toBe("'-5");
    expect(sanitizeCsvCell('@SUM(A1:A10)')).toBe("'@SUM(A1:A10)");
    expect(sanitizeCsvCell('\tmalicious')).toBe("'\tmalicious");
    expect(sanitizeCsvCell('\rmalicious')).toBe('"\'\rmalicious"');
  });

  it('escapes cells containing commas, quotes, and newlines', () => {
    expect(sanitizeCsvCell('Hello, World')).toBe('"Hello, World"');
    expect(sanitizeCsvCell('Said "Hello"')).toBe('"Said ""Hello"""');
    expect(sanitizeCsvCell('Line 1\nLine 2')).toBe('"Line 1\nLine 2"');
  });

  it('generates compliant CSV with headers and data rows', () => {
    const mockAction: Action = {
      id: 'wear-n95-mask',
      category: 'mobility',
      title: 'Wear N95/FFP2 Mask',
      description: 'Wear during outdoor commute',
      costRupees: 250,
      effort: 1,
      effects: [],
      sourceIds: ['who-aqg-2021'],
      confidence: 'high',
    };

    const mockItem: RecommendationExportItem = {
      action: mockAction,
      dailyDoseReductionUg: 450,
      doseReductionBasisPoints: 1250,
      co2eSavedGramsPerDay: 300,
    };

    const mockPlan: DailyPlan = {
      outdoorWindows: [],
      bestVentilationWindow: null,
      purifierSchedule: [],
      hourlyAqi: [],
      advisorySummary: 'Severe smog warning; stay indoors.',
    };

    const csv = exportPlanCsv([mockItem], mockPlan);
    expect(csv).toContain('Action ID,Category,Title');
    expect(csv).toContain(
      'wear-n95-mask,mobility,Wear N95/FFP2 Mask,1,250,450,12.5,300,high'
    );
    expect(csv).toContain(
      'Advisory Summary: Severe smog warning; stay indoors.'
    );
    expect(csv).toContain('\r\n');
  });
});

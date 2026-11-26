import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { exportDailyPlanIcs, triggerBlobDownload } from '../../src/exports';
import { PlanExportBar } from '../../src/features/plan/plan-export-bar';
import { HouseholdHomeSpecs } from '../../src/features/household/household-specs';
import { ACTION_CATALOG } from '../../src/domain/actions';
import type {
  DailyPlan,
  RecommendationResult,
} from '../../src/domain/contracts';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../src/config/persona';
import { useAppStore } from '../../src/app/store';

const mockPlan: DailyPlan = {
  outdoorWindows: [],
  bestVentilationWindow: null,
  purifierSchedule: [],
  hourlyAqi: [],
  advisorySummary: 'Test plan.',
};

const urlObj = window.URL as unknown as Record<string, unknown>;
const origCreateUrl = urlObj['createObjectURL'];
const origRevokeUrl = urlObj['revokeObjectURL'];

function stubUrlHelpers(createRet: string) {
  const createMock = vi.fn(() => createRet);
  const revokeMock = vi.fn();
  urlObj['createObjectURL'] = createMock;
  urlObj['revokeObjectURL'] = revokeMock;
  const clickSpy = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {});
  return { createMock, revokeMock, clickSpy };
}

function makeRecommendations(): RecommendationResult {
  const action = ACTION_CATALOG[0];
  if (!action) throw new Error('Expected action catalog item');
  const explanation = {
    formulaId: 'f1',
    inputs: {},
    result: 420,
    unit: 'ug',
    assumptions: [],
    sourceIds: [],
  };
  return {
    items: [
      {
        action,
        dailyDoseReductionUg: 420,
        doseReductionBasisPoints: 1500,
        co2eSavedGramsPerDay: 300,
        explanation,
      },
    ],
    decisionTrace: [],
  };
}

beforeEach(() =>
  useAppStore.setState({
    profile: DEFAULT_HOUSEHOLD_PERSONA,
    toastMessage: null,
  })
);

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  urlObj['createObjectURL'] = origCreateUrl;
  urlObj['revokeObjectURL'] = origRevokeUrl;
});

describe('triggerBlobDownload utility', () => {
  it('clicks synthetic anchor and revokes object URL after 100ms', () => {
    vi.useFakeTimers();
    const { createMock, revokeMock, clickSpy } = stubUrlHelpers('blob:mock');
    triggerBlobDownload('plan.csv', 'a,b', 'text/csv');
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeMock).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(revokeMock).toHaveBeenCalledWith('blob:mock');
  });

  it('returns early when document is unavailable', () => {
    vi.stubGlobal('document', undefined);
    expect(() => triggerBlobDownload('a.csv', 'x', 'text/csv')).not.toThrow();
  });
});

const statusText = () => screen.getByRole('status').textContent;

describe('PlanExportBar recommendations and profile import', () => {
  it('uses provided recommendations when exporting CSV', () => {
    stubUrlHelpers('blob:csv-url');
    render(
      <PlanExportBar
        plan={mockPlan}
        recommendations={makeRecommendations()}
        onPrint={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /export csv/i }));
    expect(statusText()).toContain('Plan CSV');
  });

  it('imports valid and invalid JSON and ignores empty upload', async () => {
    render(<PlanExportBar plan={mockPlan} onPrint={() => {}} />);
    const input = screen.getByLabelText('Upload JSON Profile Backup');
    fireEvent.change(input, { target: { files: [] } });
    expect(statusText()).toBe('');

    const jsonType = { type: 'application/json' };
    const valid = new File(
      [JSON.stringify(DEFAULT_HOUSEHOLD_PERSONA)],
      'p.json',
      jsonType
    );
    fireEvent.change(input, { target: { files: [valid] } });
    await waitFor(() => expect(statusText()).toBe('Profile imported.'));

    const bad = new File(['{bad'], 'bad.json', jsonType);
    fireEvent.change(input, { target: { files: [bad] } });
    await waitFor(() => expect(statusText()).toContain('Import error:'));

    const readSpy = vi.spyOn(FileReader.prototype, 'readAsText');
    const big = new File(['{}'], 'big.json', jsonType);
    Object.defineProperty(big, 'size', { value: 60000 });
    fireEvent.change(input, { target: { files: [big] } });
    expect(statusText()).toContain('50 KiB');
    expect(readSpy).not.toHaveBeenCalled();

    readSpy.mockImplementation(function (this: FileReader) {
      this.onerror?.call(
        this,
        new ProgressEvent('error') as ProgressEvent<FileReader>
      );
    });
    fireEvent.change(input, { target: { files: [bad] } });
    expect(statusText()).toBe('Import error: Failed to read import file.');
  });

  it('escapes UID/bare CR and folds multibyte UTF-8 ICS lines at 75 octets', () => {
    const ics = exportDailyPlanIcs(
      {
        ...mockPlan,
        bestVentilationWindow: { startHour: 13, endHour: 14 },
        advisorySummary: `Alert\rLine ${'अ'.repeat(30)}`,
      },
      { now: () => 1700000000000 },
      { next: () => 'u1\n,;2' }
    );
    const unfolded = ics.replace(/\r\n /g, '');
    expect(unfolded).toContain('UID:u1\\n\\,\\;2');
    expect(unfolded).toContain('Alert\\nLine');
    for (const ln of ics.split('\r\n').filter((x) => x.length > 0)) {
      expect(new TextEncoder().encode(ln).length).toBeLessThanOrEqual(75);
    }
  });
});

describe('HouseholdHomeSpecs budget validation', () => {
  it('validates invalid budgets and forwards floored valid integers', () => {
    const onBudgetChange = vi.fn();
    render(
      <HouseholdHomeSpecs
        home={DEFAULT_HOUSEHOLD_PERSONA.home}
        budgetRupees={2000}
        title="Home Envelope"
        onBudgetChange={onBudgetChange}
      />
    );
    const input = screen.getByLabelText(/monthly mitigation budget/i);
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.getByRole('alert').textContent).toContain('500000');
    fireEvent.change(input, { target: { value: '600000' } });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    fireEvent.change(input, { target: { value: '3450.8' } });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(onBudgetChange).toHaveBeenCalledWith(3450);
  });
});

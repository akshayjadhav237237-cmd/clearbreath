import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { useAppStore } from '../../../src/app/store';
import type { DailyPlan } from '../../../src/domain/contracts';
import { PlanExportBar } from '../../../src/features/plan/plan-export-bar';
import * as exportsModule from '../../../src/exports';

const MOCK_PLAN: DailyPlan = {
  outdoorWindows: [],
  bestVentilationWindow: { startHour: 13, endHour: 14 },
  purifierSchedule: [],
  hourlyAqi: [],
  advisorySummary: 'Moderate advisory summary.',
};

beforeEach(() => {
  useAppStore.setState({ language: 'en' });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('PlanExportBar component (EN)', () => {
  it('triggers CSV download and updates live-region status', () => {
    const downloadSpy = vi
      .spyOn(exportsModule, 'triggerBlobDownload')
      .mockImplementation(() => {});

    render(<PlanExportBar plan={MOCK_PLAN} onPrint={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /export csv/i }));

    expect(downloadSpy).toHaveBeenCalledWith(
      'clearbreath-plan.csv',
      expect.any(String),
      'text/csv'
    );
    expect(screen.getByRole('status').textContent).toContain(
      'Plan CSV downloaded successfully.'
    );
  });

  it('triggers ICS calendar download and updates live-region status', () => {
    const downloadSpy = vi
      .spyOn(exportsModule, 'triggerBlobDownload')
      .mockImplementation(() => {});

    render(<PlanExportBar plan={MOCK_PLAN} onPrint={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /export calendar/i }));

    expect(downloadSpy).toHaveBeenCalledWith(
      'clearbreath-schedule.ics',
      expect.any(String),
      'text/calendar'
    );
    expect(screen.getByRole('status').textContent).toContain(
      'Calendar schedule ICS downloaded successfully.'
    );
  });

  it('triggers JSON profile backup download', () => {
    const downloadSpy = vi
      .spyOn(exportsModule, 'triggerBlobDownload')
      .mockImplementation(() => {});

    render(<PlanExportBar plan={MOCK_PLAN} onPrint={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /backup profile/i }));

    expect(downloadSpy).toHaveBeenCalledWith(
      'clearbreath-profile.json',
      expect.any(String),
      'application/json'
    );
    expect(screen.getByRole('status').textContent).toContain(
      'Household profile JSON downloaded successfully.'
    );
  });

  it('calls onPrint when Print Plan button is clicked', () => {
    const printSpy = vi.fn();
    render(<PlanExportBar plan={MOCK_PLAN} onPrint={printSpy} />);

    fireEvent.click(screen.getByRole('button', { name: /print family plan/i }));
    expect(printSpy).toHaveBeenCalledTimes(1);
  });
});

describe('PlanExportBar component (HI)', () => {
  it('localizes headings, buttons, input label, and status messages in Hindi', () => {
    vi.spyOn(exportsModule, 'triggerBlobDownload').mockImplementation(() => {});

    render(<PlanExportBar plan={MOCK_PLAN} onPrint={vi.fn()} language="hi" />);

    expect(screen.getByText('निर्यात एवं प्रिंट दिनचर्या')).toBeDefined();
    expect(
      screen.getByLabelText('JSON प्रोफाइल बैकअप अपलोड करें')
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'कैलेंडर निर्यात करें' })
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'प्रोफाइल बैकअप लें' })
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'प्रोफाइल रीस्टोर करें' })
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'पारिवारिक योजना प्रिंट करें' })
    ).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'CSV निर्यात करें' }));
    expect(screen.getByRole('status').textContent).toBe(
      'योजना CSV सफलतापूर्वक डाउनलोड हो गई।'
    );
  });
});

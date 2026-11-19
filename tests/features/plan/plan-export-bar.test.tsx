import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import type { DailyPlan } from '../../../src/domain/contracts';
import { PlanExportBar } from '../../../src/features/plan/plan-export-bar';
import * as exportsModule from '../../../src/exports';

afterEach(() => {
  cleanup();
});

describe('PlanExportBar component', () => {
  const mockPlan: DailyPlan = {
    outdoorWindows: [],
    bestVentilationWindow: { startHour: 13, endHour: 14 },
    purifierSchedule: [],
    hourlyAqi: [],
    advisorySummary: 'Moderate advisory summary.',
  };

  it('triggers CSV download and updates live-region status', () => {
    const downloadSpy = vi
      .spyOn(exportsModule, 'triggerBlobDownload')
      .mockImplementation(() => {});
    const printSpy = vi.fn();

    render(<PlanExportBar plan={mockPlan} onPrint={printSpy} />);

    const csvBtn = screen.getByRole('button', { name: /export csv/i });
    fireEvent.click(csvBtn);

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
    const printSpy = vi.fn();

    render(<PlanExportBar plan={mockPlan} onPrint={printSpy} />);

    const calBtn = screen.getByRole('button', {
      name: /export calendar/i,
    });
    fireEvent.click(calBtn);

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
    const printSpy = vi.fn();

    render(<PlanExportBar plan={mockPlan} onPrint={printSpy} />);

    const backupBtn = screen.getByRole('button', {
      name: /backup profile/i,
    });
    fireEvent.click(backupBtn);

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
    render(<PlanExportBar plan={mockPlan} onPrint={printSpy} />);

    const printBtn = screen.getByRole('button', {
      name: /print family plan/i,
    });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalledTimes(1);
  });
});

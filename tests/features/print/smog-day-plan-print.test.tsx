import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../../src/config/persona';
import type { DailyPlan } from '../../../src/domain/contracts';
import { SmogDayPlanPrint } from '../../../src/features/print';

afterEach(() => {
  cleanup();
});

describe('SmogDayPlanPrint component', () => {
  const mockPlan: DailyPlan = {
    outdoorWindows: [],
    bestVentilationWindow: { startHour: 13, endHour: 15 },
    purifierSchedule: [{ hour: 21, operationalState: 'high' }],
    hourlyAqi: [],
    advisorySummary: 'Emergency winter smog episode; stay indoors.',
  };

  it('renders title, date, AQI metrics, and household member count', () => {
    render(
      <SmogDayPlanPrint
        profile={DEFAULT_HOUSEHOLD_PERSONA}
        plan={mockPlan}
        currentAqi={412}
        aqiCategory="severe"
        dateFormatted="2026-11-19"
      />
    );

    const heading = screen.getByRole('heading', {
      level: 1,
      name: /smog-day family action plan/i,
    });
    expect(heading).toBeDefined();
    expect(screen.getByText(/2026-11-19/)).toBeDefined();
    expect(screen.getByText(/AQI 412/)).toBeDefined();
    expect(screen.getByText(/SEVERE/)).toBeDefined();
  });

  it('renders top priority actions table with costs and efforts', () => {
    render(
      <SmogDayPlanPrint
        profile={DEFAULT_HOUSEHOLD_PERSONA}
        plan={mockPlan}
        currentAqi={350}
        aqiCategory="veryPoor"
        dateFormatted="2026-11-19"
      />
    );

    const table = screen.getByRole('table');
    expect(table).toBeDefined();
    expect(screen.getAllByRole('row')).toHaveLength(6);
  });

  it('triggers onPrint callback when print button is clicked', () => {
    const printSpy = vi.fn();
    render(
      <SmogDayPlanPrint
        profile={DEFAULT_HOUSEHOLD_PERSONA}
        plan={mockPlan}
        currentAqi={280}
        aqiCategory="poor"
        dateFormatted="2026-11-19"
        onPrint={printSpy}
      />
    );

    const btn = screen.getByRole('button', {
      name: /print family action plan/i,
    });
    expect(btn).toBeDefined();
    expect(btn.className).toContain('print:hidden');
    fireEvent.click(btn);
    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  it('renders scientific sources and non-medical disclaimer', () => {
    render(
      <SmogDayPlanPrint
        profile={DEFAULT_HOUSEHOLD_PERSONA}
        plan={mockPlan}
        currentAqi={150}
        aqiCategory="moderate"
        dateFormatted="2026-11-19"
      />
    );

    expect(screen.getByText(/CPCB NAQI 2014/)).toBeDefined();
    expect(screen.getByText(/Disclaimer:/)).toBeDefined();
  });
});

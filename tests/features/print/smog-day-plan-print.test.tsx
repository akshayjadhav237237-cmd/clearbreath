import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../../src/config/persona';
import type { DailyPlan } from '../../../src/domain/contracts';
import { SmogDayPlanPrint } from '../../../src/features/print';

const TEST_DATE = '2026-11-19';

const MOCK_PLAN: DailyPlan = {
  outdoorWindows: [],
  bestVentilationWindow: { startHour: 13, endHour: 15 },
  purifierSchedule: [{ hour: 21, operationalState: 'high' }],
  hourlyAqi: [],
  advisorySummary: 'Emergency winter smog episode; stay indoors.',
};

afterEach(() => {
  cleanup();
});

describe('SmogDayPlanPrint component (EN default)', () => {
  it('renders title, date, AQI metrics, and household member count', () => {
    render(
      <SmogDayPlanPrint
        profile={DEFAULT_HOUSEHOLD_PERSONA}
        plan={MOCK_PLAN}
        currentAqi={412}
        aqiCategory="severe"
        dateFormatted={TEST_DATE}
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
        plan={MOCK_PLAN}
        currentAqi={350}
        aqiCategory="veryPoor"
        dateFormatted={TEST_DATE}
      />
    );

    expect(screen.getByRole('table')).toBeDefined();
    expect(screen.getAllByRole('row')).toHaveLength(6);
    expect(screen.getByText(/VERY POOR/)).toBeDefined();
  });

  it('triggers onPrint callback when print button is clicked', () => {
    const printSpy = vi.fn();
    render(
      <SmogDayPlanPrint
        profile={DEFAULT_HOUSEHOLD_PERSONA}
        plan={MOCK_PLAN}
        currentAqi={280}
        aqiCategory="poor"
        dateFormatted={TEST_DATE}
        onPrint={printSpy}
      />
    );

    const btn = screen.getByRole('button', {
      name: /print action plan/i,
    });
    expect(btn.className).toContain('print:hidden');
    fireEvent.click(btn);
    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  it('renders scientific sources and non-medical disclaimer', () => {
    render(
      <SmogDayPlanPrint
        profile={DEFAULT_HOUSEHOLD_PERSONA}
        plan={MOCK_PLAN}
        currentAqi={150}
        aqiCategory="moderate"
        dateFormatted={TEST_DATE}
      />
    );

    expect(screen.getByText(/CPCB NAQI 2014/)).toBeDefined();
    expect(screen.getByText(/Disclaimer:/)).toBeDefined();
  });
});

describe('SmogDayPlanPrint component (HI localization)', () => {
  it('renders localized Hindi headings, status badge, table, and footer', () => {
    render(
      <SmogDayPlanPrint
        profile={DEFAULT_HOUSEHOLD_PERSONA}
        plan={{ ...MOCK_PLAN, bestVentilationWindow: null }}
        currentAqi={412}
        aqiCategory="severe"
        dateFormatted={TEST_DATE}
        onPrint={() => {}}
        language="hi"
      />
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /स्मॉग-दिवस पारिवारिक कार्य योजना/,
      })
    ).toBeDefined();
    expect(screen.getByText(/तैयार की गई तिथि: 2026-11-19/)).toBeDefined();
    expect(screen.getByText(/परिवार के सदस्य: 3/)).toBeDefined();
    expect(screen.getByText(/एक्यूआई 412 • गंभीर/)).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'कार्य योजना प्रिंट करें' })
    ).toBeDefined();
    expect(screen.getByText('उपाय')).toBeDefined();
    expect(screen.getByText('श्रेणी')).toBeDefined();
    expect(screen.getByText('प्रयास')).toBeDefined();
    expect(screen.getByText('लागत')).toBeDefined();
    expect(screen.getAllByText('इनडोर').length).toBeGreaterThan(0);
    expect(
      screen.getByText('स्मॉग के घंटों में खिड़कियां बंद रखें')
    ).toBeDefined();
    expect(screen.getByText(/वैज्ञानिक आधार: CPCB NAQI 2014/)).toBeDefined();
    expect(screen.getByText(/अस्वीकरण:/)).toBeDefined();
  });
});

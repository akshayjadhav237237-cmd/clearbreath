import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { useAppStore } from '../../src/app/store';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../src/config/persona';
import type { HourlyReading } from '../../src/domain/contracts';
import { AirNowPanel } from '../../src/features/air-now';
import { PlanPanel } from '../../src/features/plan';
import { selectCurrentAqi } from '../../src/shared/state/selectors';

const DELHI_CITY = 'Delhi';

function buildReadings(
  middayPm25: number,
  middayPm10: number,
  otherPm25: number,
  otherPm10: number
): readonly HourlyReading[] {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    pm25: hour === 12 ? middayPm25 : otherPm25,
    pm10: hour === 12 ? middayPm10 : otherPm10,
  }));
}

beforeEach(() => {
  useAppStore.setState({
    selectedCity: DELHI_CITY,
    hourlySeries: null,
    profile: DEFAULT_HOUSEHOLD_PERSONA,
    language: 'en',
  });
});

afterEach(() => {
  cleanup();
});

describe('PlanPanel selector integration and layout', () => {
  it('renders selector fallback curve, windows, purifier schedule, and unified AQI', () => {
    render(<PlanPanel />);
    expect(
      screen.getByRole('heading', { name: /24-hour diurnal advisory/i })
    ).toBeDefined();
    expect(screen.getByText(/24h Diurnal AQI Profile/i)).toBeDefined();
    expect(screen.getByText(/lowest aqi window/i)).toBeDefined();
    expect(screen.getByText(/cross ventilation/i)).toBeDefined();
    expect(screen.getByText(/hepa cadr/i)).toBeDefined();
    expect(screen.getByText(/AQI 180 • MODERATE/)).toBeDefined();
  });

  it('matches Air Now headline AQI in Print view instead of diurnal peak AQI', () => {
    const readings = buildReadings(91, 150, 255, 400);
    const series = {
      city: DELHI_CITY,
      readings,
      isSample: false,
      attribution: 'Test telemetry',
    };
    useAppStore.setState({ hourlySeries: series });

    const expected = selectCurrentAqi({
      selectedCity: DELHI_CITY,
      hourlySeries: series,
      profile: DEFAULT_HOUSEHOLD_PERSONA,
    });
    expect(expected.value).toBe(201);
    expect(expected.category).toBe('poor');

    render(
      <>
        <AirNowPanel />
        <PlanPanel />
      </>
    );

    expect(screen.getByText(/poor \(aqi 201\)/i)).toBeDefined();
    expect(screen.getByText(/AQI 201 • POOR/)).toBeDefined();
    expect(screen.queryByText(/AQI 405/)).toBeNull();
    expect(screen.getByText(/Peak: 255 µg\/m³/)).toBeDefined();
  });
});

describe('PlanPanel localization and severe fallback states', () => {
  it('renders PlanPanel, DiurnalChart, Metrics, ExportBar, and Print in Hindi', () => {
    useAppStore.setState({ language: 'hi' });
    render(<PlanPanel />);

    expect(
      screen.getByRole('heading', { name: '24-घंटे का वायु गुणवत्ता चक्र' })
    ).toBeDefined();
    expect(screen.getByText(/न्यूनतम एक्यूआई समय/)).toBeDefined();
    expect(screen.getByText(/क्रॉस वेंटिलेशन/)).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'CSV निर्यात करें' })
    ).toBeDefined();
    expect(screen.getByText(/एक्यूआई 180 • मध्यम/)).toBeDefined();
  });

  it('renders indoor shelter guidance when all hours are severe', () => {
    useAppStore.setState({
      hourlySeries: {
        city: DELHI_CITY,
        readings: buildReadings(320, 480, 320, 480),
        isSample: false,
        attribution: 'Severe telemetry',
      },
    });
    render(<PlanPanel />);

    expect(screen.getByText('Stay Indoors')).toBeDefined();
    expect(screen.getByText('Sealed')).toBeDefined();
    expect(screen.getByText('Keep windows shut')).toBeDefined();
    expect(
      screen.getByText('Keep windows closed during smog hours')
    ).toBeDefined();
  });
});

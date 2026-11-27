import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ComparePanel } from '../../src/features/compare';
import { useAppStore } from '../../src/app/store';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../src/config/persona';

function makeReadings(pm25: number, pm10: number) {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    pm25,
    pm10,
  }));
}

afterEach(() => {
  cleanup();
  useAppStore.setState({
    language: 'en',
    selectedCity: 'Delhi',
    profile: DEFAULT_HOUSEHOLD_PERSONA,
    completedActionIds: [],
    hourlySeries: null,
  });
});

describe('ComparePanel live scenarios', () => {
  it('removes mock constants and heuristic scalars from compare sources', () => {
    const compareSrc = fs.readFileSync(
      path.resolve('src/features/compare/compare-panel.tsx'),
      'utf-8'
    );
    expect(compareSrc).not.toContain('MOCK_AQI');
    expect(compareSrc).not.toContain('MOCK_PLAN');
    expect(compareSrc).not.toContain('0.82');
    expect(compareSrc).not.toContain('0.05');
  });

  it('renders live scenario cards, assumptions, and estimate disclosure', () => {
    render(<ComparePanel />);
    expect(
      screen.getByRole('heading', { name: /mitigation impact comparison/i })
    ).toBeDefined();
    expect(screen.getByText('Status Quo (No Action)')).toBeDefined();
    expect(screen.getByText('With Planned Mitigations')).toBeDefined();
    expect(screen.getByText('Stated Model Assumptions')).toBeDefined();
    expect(
      screen.getByText(/estimate under stated assumptions/i)
    ).toBeDefined();
    expect(
      screen.getByText(/mass-balance assumptions rather than clinical/i)
    ).toBeDefined();
  });

  it('dynamically recomputes scenario numbers when hourlySeries changes (no stale -63%)', () => {
    useAppStore.setState({
      completedActionIds: ['act-indoor-no-incense-candles'],
      hourlySeries: {
        city: 'Delhi',
        readings: makeReadings(80, 120),
        isSample: true,
      },
    });

    const { rerender } = render(<ComparePanel />);
    expect(screen.queryByText('-63% Total Inhaled Dose')).toBeNull();
    expect(screen.getByText('-34% Total Inhaled Dose')).toBeDefined();
    expect(screen.getByText('1,341')).toBeDefined();
    expect(screen.getByText('880')).toBeDefined();
    expect(screen.getByText('-461 µg/day')).toBeDefined();
    expect(screen.getByText('25')).toBeDefined();
    expect(screen.getByText('14')).toBeDefined();

    useAppStore.setState({
      hourlySeries: {
        city: 'Delhi',
        readings: makeReadings(250, 350),
        isSample: false,
      },
    });
    rerender(<ComparePanel />);
    expect(screen.getByText('-36% Total Inhaled Dose')).toBeDefined();
    expect(screen.getByText('4,224')).toBeDefined();
    expect(screen.getByText('2,714')).toBeDefined();
    expect(screen.getByText('-1,510 µg/day')).toBeDefined();
    expect(screen.getByText('79')).toBeDefined();
    expect(screen.getByText('43')).toBeDefined();
  });
});

describe('ComparePanel picker and Hindi localization', () => {
  it('wires compareChoices picker to live outdoor PM2.5, home envelope, and commute km', () => {
    useAppStore.setState({
      hourlySeries: {
        city: 'Delhi',
        readings: makeReadings(80, 120),
        isSample: true,
      },
    });

    const { rerender } = render(<ComparePanel />);
    expect(screen.getByText('+240')).toBeDefined();
    expect(screen.getByText('-360')).toBeDefined();

    fireEvent.change(screen.getByLabelText('Option A'), {
      target: { value: 'act-indoor-seal-gaps' },
    });
    expect(screen.getByText('+59')).toBeDefined();

    useAppStore.setState({
      hourlySeries: {
        city: 'Delhi',
        readings: makeReadings(250, 350),
        isSample: false,
      },
      profile: {
        ...DEFAULT_HOUSEHOLD_PERSONA,
        lifestyle: {
          ...DEFAULT_HOUSEHOLD_PERSONA.lifestyle,
          commute: { mode: 'twoWheeler', distanceKm: 20, minutes: 45 },
        },
      },
    });
    rerender(<ComparePanel />);
    expect(screen.getByText('+189')).toBeDefined();
    expect(screen.getByText('-600')).toBeDefined();
  });

  it('localizes all cards, units, picker options, assumptions, and disclosures in Hindi', () => {
    useAppStore.setState({
      language: 'hi',
      completedActionIds: ['act-indoor-no-incense-candles'],
      hourlySeries: {
        city: 'Delhi',
        readings: makeReadings(80, 120),
        isSample: true,
      },
    });

    render(<ComparePanel />);
    expect(
      screen.getByRole('heading', { name: 'प्रदूषण रोकथाम प्रभाव तुलना' })
    ).toBeDefined();
    expect(screen.getByText('-34% कुल सांस खुराक')).toBeDefined();
    expect(
      screen.getByText('बिना किसी उपाय के (वर्तमान स्थिति)')
    ).toBeDefined();
    expect(screen.getByText('योजनाबद्ध उपायों के साथ')).toBeDefined();
    expect(screen.getAllByText('माइक्रोग्राम/मी³').length).toBeGreaterThan(0);
    expect(screen.getAllByText('माइक्रोग्राम/दिन').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ग्राम/दिन').length).toBeGreaterThan(0);
    expect(screen.getByText('दो उपायों की सीधी तुलना')).toBeDefined();
    expect(screen.getByLabelText('विकल्प ए')).toBeDefined();
    expect(screen.getByLabelText('विकल्प बी')).toBeDefined();
    expect(screen.getByText('मॉडल की निर्दिष्ट मान्यताएं')).toBeDefined();
    expect(
      screen.getByText(/प्यूरीफायर स्थिति: सक्रिय CADR 250 मी³\/घंटा/)
    ).toBeDefined();
    expect(
      screen.getByText(/निर्दिष्ट मान्यताओं के अंतर्गत मॉडल किया गया अनुमान/i)
    ).toBeDefined();
  });
});

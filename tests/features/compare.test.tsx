import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ComparePanel } from '../../src/features/compare';
import { useAppStore } from '../../src/app/store';

afterEach(() => {
  cleanup();
  useAppStore.setState({
    language: 'en',
    completedActionIds: [],
    hourlySeries: null,
  });
});

describe('ComparePanel', () => {
  it('renders side-by-side baseline and mitigated scenario comparison cards', () => {
    render(<ComparePanel />);
    expect(
      screen.getByRole('heading', { name: /mitigation impact comparison/i })
    ).toBeDefined();
    expect(screen.getByText('Status Quo (No Action)')).toBeDefined();
    expect(screen.getByText(/with planned mitigations/i)).toBeDefined();
    expect(screen.getByText(/total inhaled dose/i)).toBeDefined();
  });

  it('preserves compare numbers and labels results as estimate in EN and HI', () => {
    const readings = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      pm25: 80,
      pm10: 120,
    }));
    useAppStore.setState({
      completedActionIds: ['act-indoor-no-incense-candles'],
      hourlySeries: { city: 'Delhi', readings, isSample: true },
    });

    const { rerender } = render(<ComparePanel />);
    expect(screen.getByText('-63% Total Inhaled Dose')).toBeDefined();
    expect(screen.getByText('-1,048 µg/day')).toBeDefined();
    expect(screen.getByText('608')).toBeDefined();
    expect(screen.getByText('25')).toBeDefined();
    expect(
      screen.getByText(/estimate under stated assumptions/i)
    ).toBeDefined();

    useAppStore.setState({ language: 'hi' });
    rerender(<ComparePanel />);
    expect(
      screen.getByText(/निर्दिष्ट मान्यताओं के अंतर्गत मॉडल किया गया अनुमान/i)
    ).toBeDefined();
  });
});

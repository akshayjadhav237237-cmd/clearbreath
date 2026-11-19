import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AirNowPanel } from '../../src/features/air-now';
import { useAppStore } from '../../src/app/store';

afterEach(() => {
  cleanup();
});

describe('AirNowPanel', () => {
  it('renders ambient AQI monitoring view with metrics and attribution', () => {
    const { unmount } = render(<AirNowPanel />);
    expect(
      screen.getByRole('heading', { name: /ambient air quality/i })
    ).toBeDefined();
    expect(screen.getByLabelText(/select city/i)).toBeDefined();
    expect(screen.getByText(/open-meteo/i)).toBeDefined();
    unmount();
  });

  it('updates selected city in global store upon selection', () => {
    render(<AirNowPanel />);
    const select = screen.getByLabelText(/select city/i);
    fireEvent.change(select, { target: { value: 'Pune' } });
    expect(useAppStore.getState().selectedCity).toBe('Pune');
  });
});

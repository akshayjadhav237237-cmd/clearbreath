import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AirNowPanel } from '../../src/features/air-now';
import { useAppStore } from '../../src/app/store';

afterEach(() => {
  cleanup();
  useAppStore.setState({
    selectedCity: 'Delhi',
    hourlySeries: null,
    language: 'en',
  });
});

const MODERATE_180 = 'Moderate (AQI 180)';

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

  it('uses shared selector fallback for null and negative readings', () => {
    const { rerender } = render(<AirNowPanel />);
    expect(screen.getByText(MODERATE_180)).toBeDefined();
    expect(screen.getByText('84')).toBeDefined();
    expect(screen.getByText('140')).toBeDefined();

    useAppStore.setState({
      hourlySeries: {
        city: 'Delhi',
        isSample: false,
        readings: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          pm25: -5,
          pm10: 20,
        })),
      },
    });
    rerender(<AirNowPanel />);
    expect(screen.getByText(MODERATE_180)).toBeDefined();
  });

  it('renders live PM10-dominant reading and full Hindi translations', () => {
    useAppStore.setState({
      hourlySeries: {
        city: 'Delhi',
        isSample: true,
        readings: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          pm25: 20,
          pm10: 250,
        })),
      },
    });
    const { rerender } = render(<AirNowPanel />);
    expect(screen.getByText('Moderate (AQI 200)')).toBeDefined();
    expect(screen.getByText('PM10')).toBeDefined();

    useAppStore.setState({ language: 'hi' });
    rerender(<AirNowPanel />);
    expect(
      screen.getByRole('heading', { name: /परिवेशी वायु गुणवत्ता सूचकांक/i })
    ).toBeDefined();
    expect(screen.getByText('मध्यम (एक्यूआई 200)')).toBeDefined();
    expect(screen.getByText('पीएम 10')).toBeDefined();
    expect(screen.getByText(/ओपन-मेटियो/i)).toBeDefined();
  });
});

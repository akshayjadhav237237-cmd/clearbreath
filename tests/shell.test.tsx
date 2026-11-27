import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { App } from '../src/app';
import { useAppStore } from '../src/app/store';

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove('dark');
  useAppStore.setState({
    activeTab: 'airNow',
    language: 'en',
    theme: 'light',
    hourlySeries: null,
    selectedCity: 'Delhi',
  });
});

describe('App shell', () => {
  it('renders header, main, and footer landmarks with unified AQI badge', () => {
    const { rerender } = render(<App />);
    expect(screen.getByRole('banner')).toBeDefined();
    expect(screen.getByRole('main')).toBeDefined();
    expect(screen.getByRole('contentinfo')).toBeDefined();
    expect(screen.getByText('Winter Smog Assistant')).toBeDefined();
    expect(screen.getByText('AQI 180 (Moderate)')).toBeDefined();

    useAppStore.setState({
      hourlySeries: {
        city: 'Delhi',
        isSample: true,
        readings: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          pm25: 380,
          pm10: 520,
        })),
      },
    });
    rerender(<App />);
    expect(screen.getByText('AQI 500 (Severe)')).toBeDefined();
  });

  it('renders accessible skip link targeting main content', () => {
    render(<App />);
    const skipLink = screen.getByRole('link', {
      name: /skip to main content/i,
    });
    expect(skipLink).toBeDefined();
    expect(skipLink.getAttribute('href')).toBe('#main-content');
  });

  it('switches navigation tabs upon user click', async () => {
    render(<App />);
    const householdTab = screen.getByRole('button', { name: /household/i });
    fireEvent.click(householdTab);
    expect(
      await screen.findByRole('heading', { name: /household profile/i })
    ).toBeDefined();
  });

  it('toggles application language between English and Hindi across shell', () => {
    render(<App />);
    const hindiRadio = screen.getByRole('radio', { name: 'हिन्दी' });
    fireEvent.click(hindiRadio);
    expect(screen.getByText('परिवार प्रोफाइल')).toBeDefined();
    expect(screen.getByText('शीतकालीन स्मॉग सहायक')).toBeDefined();
    expect(screen.getByText('एक्यूआई 180 (मध्यम)')).toBeDefined();
    expect(
      screen.getByRole('navigation', { name: 'मुख्य नेविगेशन' })
    ).toBeDefined();
    expect(screen.getByText(/© 2026 क्लियरब्रेथ/)).toBeDefined();
  });

  it('toggles theme between light and dark modes', () => {
    render(<App />);
    const toDarkBtn = screen.getByRole('button', {
      name: /switch to dark theme/i,
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    fireEvent.click(toDarkBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    const toLightBtn = screen.getByRole('button', {
      name: /switch to light theme/i,
    });
    expect(toLightBtn).toBeDefined();
    fireEvent.click(toLightBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { App } from '../src/app';

afterEach(() => {
  cleanup();
});

describe('App shell', () => {
  it('renders header, main, and footer landmarks', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeDefined();
    expect(screen.getByRole('main')).toBeDefined();
    expect(screen.getByRole('contentinfo')).toBeDefined();
  });

  it('renders accessible skip link targeting main content', () => {
    render(<App />);
    const skipLink = screen.getByRole('link', {
      name: /skip to main content/i,
    });
    expect(skipLink).toBeDefined();
    expect(skipLink.getAttribute('href')).toBe('#main-content');
  });

  it('switches navigation tabs upon user click', () => {
    render(<App />);
    const householdTab = screen.getByRole('button', { name: /household/i });
    fireEvent.click(householdTab);
    expect(
      screen.getByRole('heading', { name: /household profile/i })
    ).toBeDefined();
  });

  it('toggles application language between English and Hindi', () => {
    render(<App />);
    const hindiRadio = screen.getByRole('radio', { name: 'हिन्दी' });
    fireEvent.click(hindiRadio);
    expect(screen.getByText('परिवार प्रोफाइल')).toBeDefined();
  });

  it('toggles theme between light and dark modes', () => {
    render(<App />);
    const themeBtn = screen.getByRole('button', {
      name: /switch to dark theme/i,
    });
    fireEvent.click(themeBtn);
    expect(
      screen.getByRole('button', { name: /switch to light theme/i })
    ).toBeDefined();
  });
});

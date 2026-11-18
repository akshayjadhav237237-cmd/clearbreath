import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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
});

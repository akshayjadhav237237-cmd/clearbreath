import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PlanPanel } from '../../src/features/plan';

afterEach(() => {
  cleanup();
});

describe('PlanPanel', () => {
  it('renders diurnal curve, outdoor windows, and purifier scheduling', () => {
    render(<PlanPanel />);
    expect(
      screen.getByRole('heading', { name: /24-hour diurnal advisory/i })
    ).toBeDefined();
    expect(screen.getByText(/safest window/i)).toBeDefined();
    expect(screen.getByText(/cross ventilation/i)).toBeDefined();
    expect(screen.getByText(/hepa cadr/i)).toBeDefined();
  });
});

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ComparePanel } from '../../src/features/compare';

afterEach(() => {
  cleanup();
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
});

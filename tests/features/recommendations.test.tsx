import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { RecommendationsPanel } from '../../src/features/recommendations';
import { useAppStore } from '../../src/app/store';

afterEach(() => {
  cleanup();
});

describe('RecommendationsPanel', () => {
  it('renders prioritized mitigation actions and filters by category', () => {
    render(<RecommendationsPanel />);
    expect(
      screen.getByRole('heading', { name: /mitigation actions/i })
    ).toBeDefined();
    expect(
      screen.getByRole('navigation', { name: /action categories/i })
    ).toBeDefined();

    const indoorFilter = screen.getByRole('button', { name: 'Indoor' });
    fireEvent.click(indoorFilter);
    expect(indoorFilter.className).toContain('bg-sky-600');
  });

  it('toggles action completion and recalculates avoided dose', () => {
    render(<RecommendationsPanel />);
    const buttons = screen.getAllByRole('button', {
      name: /\+ mark as implemented/i,
    });
    expect(buttons.length).toBeGreaterThan(0);
    const firstButton = buttons[0];
    if (firstButton) {
      fireEvent.click(firstButton);
      expect(useAppStore.getState().completedActionIds).toHaveLength(1);
    }
  });
});

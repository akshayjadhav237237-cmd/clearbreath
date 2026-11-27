import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { RecommendationsPanel } from '../../src/features/recommendations';
import { useAppStore } from '../../src/app/store';

afterEach(() => {
  cleanup();
  useAppStore.setState({ language: 'en', completedActionIds: [] });
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
    expect(indoorFilter.className).toContain('bg-sky-700');
  });

  it('toggles action completion and shows visible estimate note in EN and HI', () => {
    const { rerender } = render(<RecommendationsPanel />);
    expect(
      screen.getAllByText(/estimate under stated assumptions/i).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/incense-combustion-elimination/i).length
    ).toBeGreaterThan(0);
    expect(screen.getByText('-1175 µg/day')).toBeDefined();

    const buttons = screen.getAllByRole('button', {
      name: /\+ mark as implemented/i,
    });
    expect(buttons.length).toBeGreaterThan(0);
    const firstButton = buttons[0];
    if (firstButton) {
      fireEvent.click(firstButton);
      expect(useAppStore.getState().completedActionIds).toHaveLength(1);
    }

    useAppStore.setState({ language: 'hi' });
    rerender(<RecommendationsPanel />);
    expect(
      screen.getAllByText(
        /निर्दिष्ट मान्यताओं के अंतर्गत मॉडल किया गया अनुमान/i
      ).length
    ).toBeGreaterThan(0);
  });
});

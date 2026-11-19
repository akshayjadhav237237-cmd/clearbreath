import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { HouseholdPanel } from '../../src/features/household';
import { useAppStore } from '../../src/app/store';

afterEach(() => {
  cleanup();
});

describe('HouseholdPanel', () => {
  it('renders persona profile information and quick presets', () => {
    render(<HouseholdPanel />);
    expect(
      screen.getByRole('heading', { name: /household profile/i })
    ).toBeDefined();
    expect(screen.getByText(/sensitivity:/i)).toBeDefined();
    expect(screen.getByText(/delhi-ncr family/i)).toBeDefined();
  });

  it('switches between presets when clicked', () => {
    render(<HouseholdPanel />);
    const studentBtn = screen.getByText(/pune student/i);
    fireEvent.click(studentBtn);
    const store = useAppStore.getState();
    expect(store.activePreset).toBe('puneStudent');
    expect(store.profile.home.type).toBe('singleRoom');

    const seniorBtn = screen.getByText(/mumbai senior/i);
    fireEvent.click(seniorBtn);
    expect(useAppStore.getState().activePreset).toBe('mumbaiSenior');
  });
});

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import axe from 'axe-core';
import { App } from '../src/app';
import { HouseholdPanel } from '../src/features/household';
import { AirNowPanel } from '../src/features/air-now';
import { PlanPanel } from '../src/features/plan';
import { RecommendationsPanel } from '../src/features/recommendations';
import { ComparePanel } from '../src/features/compare';
import { AssistantPanel } from '../src/features/assistant';
import { CommunityPanel } from '../src/features/community';

afterEach(() => {
  cleanup();
});

const AXE_OPTIONS: axe.RunOptions = {
  rules: {
    // Color contrast in JSDOM is skipped because JSDOM does not compute layout geometry
    'color-contrast': { enabled: false },
  },
};

function assertNoProhibitedAria(results: axe.AxeResults) {
  expect(results.violations).toEqual([]);
  const prohibited = results.incomplete.filter(
    (node) => node.id === 'aria-prohibited-attr'
  );
  expect(prohibited).toEqual([]);
}

describe('Axe-core accessibility audit on vertical feature panels', () => {
  it('App shell has zero accessibility violations', async () => {
    const { container } = render(<App />);
    const results = await axe.run(container, AXE_OPTIONS);
    assertNoProhibitedAria(results);
  });

  it('HouseholdPanel has zero accessibility violations', async () => {
    const { container } = render(<HouseholdPanel />);
    const results = await axe.run(container, AXE_OPTIONS);
    expect(results.violations).toEqual([]);
  });

  it('AirNowPanel has zero accessibility violations or prohibited ARIA attributes', async () => {
    const { container } = render(<AirNowPanel />);
    const results = await axe.run(container, AXE_OPTIONS);
    assertNoProhibitedAria(results);
  });

  it('PlanPanel has zero accessibility violations', async () => {
    const { container } = render(<PlanPanel />);
    const results = await axe.run(container, AXE_OPTIONS);
    expect(results.violations).toEqual([]);
  });

  it('RecommendationsPanel has zero accessibility violations or prohibited ARIA attributes', async () => {
    const { container } = render(<RecommendationsPanel />);
    const results = await axe.run(container, AXE_OPTIONS);
    assertNoProhibitedAria(results);
  });

  it('ComparePanel has zero accessibility violations or prohibited ARIA attributes', async () => {
    const { container } = render(<ComparePanel />);
    const results = await axe.run(container, AXE_OPTIONS);
    assertNoProhibitedAria(results);
  });

  it('AssistantPanel has zero accessibility violations', async () => {
    const { container } = render(<AssistantPanel />);
    const results = await axe.run(container, AXE_OPTIONS);
    expect(results.violations).toEqual([]);
  });

  it('CommunityPanel has zero accessibility violations', async () => {
    const { container } = render(<CommunityPanel />);
    const results = await axe.run(container, AXE_OPTIONS);
    expect(results.violations).toEqual([]);
  });
});

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
  'best-practice',
];

test.describe('Real Chromium Axe-Core Navigation Audits', () => {
  test('passes full WCAG audit on initial application load', async ({
    page,
  }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('passes full WCAG audit across all vertical tabs', async ({ page }) => {
    await page.goto('/');

    const tabs = [
      'Household',
      'Daily Plan',
      'Actions',
      'Compare',
      'AI Advisor',
      'Community',
    ];
    for (const tabName of tabs) {
      await page.getByRole('button', { name: tabName, exact: false }).click();
      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .analyze();
      expect(results.violations).toEqual([]);
    }
  });
});

test.describe('Real Chromium Axe-Core Responsive and Media Audits', () => {
  test('passes accessibility audit in Hindi locale', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('radio', { name: 'हिन्दी' }).click();

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('passes accessibility audit on 320px narrow mobile viewport', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('passes accessibility audit under print media emulation', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Daily Plan' }).click();
    await page.emulateMedia({ media: 'print' });

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

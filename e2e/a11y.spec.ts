import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const HINDI_LABEL = 'हिन्दी';
const AI_ADVISOR_LABEL = 'AI Advisor';

const WCAG_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21aa',
  'wcag22aa',
  'best-practice',
];

async function runAxe(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
}

test.describe('Real Chromium Axe-Core Household and Severe Audits', () => {
  test('1. household form with validation errors visible', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Household' }).click();
    const input = page.locator('#household-budget-input');
    await input.fill('-500');
    await expect(page.locator('#household-budget-error')).toBeVisible();
    await runAxe(page);
  });

  test('2. severe-day mode', async ({ page }) => {
    await page.route('**/v1/air-quality*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hourly: {
            time: Array.from(
              { length: 24 },
              (_, i) => `2026-11-19T${String(i).padStart(2, '0')}:00`
            ),
            pm2_5: Array(24).fill(380),
            pm10: Array(24).fill(520),
          },
        }),
      })
    );
    await page.goto('/');
    await expect(page.getByText(/severe/i).first()).toBeVisible();
    await runAxe(page);
  });
});

test.describe('Real Chromium Axe-Core Advisor and Locale Audits', () => {
  test('3. assistant panel with consent switch on and key field visible', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: AI_ADVISOR_LABEL }).click();
    await page.getByRole('checkbox').click();
    await expect(page.locator('#gemini-key-input')).toBeVisible();
    await runAxe(page);
  });

  test('4. dialog open', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: AI_ADVISOR_LABEL }).click();
    await page.getByRole('button', { name: 'Grounding Facts' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await runAxe(page);
  });

  test('5. Hindi language on every panel', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('radio', { name: HINDI_LABEL }).click();
    const hindiTabs = [
      'वर्तमान वायु',
      'परिवार प्रोफाइल',
      'दैनिक योजना',
      'उपाय',
      'तुलना',
      'एआई सलाहकार',
      'समुदाय',
    ];
    for (const tab of hindiTabs) {
      await page.getByRole('button', { name: tab }).click();
      await runAxe(page);
    }
  });
});

test.describe('Real Chromium Axe-Core Display & Media Audits', () => {
  test('6. forced-colors emulation', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/');
    await runAxe(page);
  });

  test('7. reduced-motion emulation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await runAxe(page);
  });

  test('8. 200% zoom (640x400 viewport)', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 400 });
    await page.goto('/');
    await runAxe(page);
  });

  test('9. dark scheme on every panel', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /switch to dark theme/i }).click();
    const tabs = [
      'Air Now',
      'Household',
      'Daily Plan',
      'Actions',
      'Compare',
      AI_ADVISOR_LABEL,
      'Community',
    ];
    for (const tab of tabs) {
      await page.getByRole('button', { name: tab }).click();
      await runAxe(page);
    }
  });
});

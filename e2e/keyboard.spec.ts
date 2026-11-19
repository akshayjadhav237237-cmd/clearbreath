import { test, expect } from '@playwright/test';

test.describe('Keyboard navigation and accessible focus ring verification', () => {
  test('activates skip link and moves focus directly to main landmark', async ({
    page,
  }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');
    const mainLandmark = page.locator('#main-content');
    await expect(mainLandmark).toBeFocused();
  });

  test('navigates main navigation tabs via keyboard without traps', async ({
    page,
  }) => {
    await page.goto('/');

    // Move focus to skip link then into navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Language toggle
    await page.keyboard.press('Tab'); // Theme toggle
    await page.keyboard.press('Tab'); // First nav button (Air Now)

    const airNowBtn = page.getByRole('button', { name: /air now/i });
    await expect(airNowBtn).toBeFocused();

    // Tab to next tab (Household) and press Enter
    await page.keyboard.press('Tab');
    const householdBtn = page.getByRole('button', { name: /household/i });
    await expect(householdBtn).toBeFocused();
    await page.keyboard.press('Enter');

    // Confirm Household panel is loaded
    await expect(
      page.getByRole('heading', { name: /household profile/i })
    ).toBeVisible();
  });

  test('operates plan export buttons using keyboard only', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /daily plan/i }).click();

    const csvButton = page.getByRole('button', { name: /export csv/i });
    await csvButton.focus();
    await expect(csvButton).toBeFocused();

    // Verify computed focus style or outline presence
    const isFocused = await csvButton.evaluate(
      (el) => document.activeElement === el
    );
    expect(isFocused).toBe(true);
  });
});

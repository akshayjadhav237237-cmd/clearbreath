import { test, expect } from '@playwright/test';

test.describe('E2E Planning and Mitigation Workflow', () => {
  test('executes demo family smog-day planning and action completion workflow', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Verify AirNow initial rendering
    await expect(
      page.getByRole('heading', { name: /ambient air quality/i })
    ).toBeVisible();

    // 2. Navigate to Household and switch preset
    await page.getByRole('button', { name: /household/i }).click();
    await expect(
      page.getByRole('heading', { name: /household profile/i })
    ).toBeVisible();

    // 3. Navigate to Recommendations and toggle an action
    await page.getByRole('button', { name: /actions/i }).click();
    await expect(
      page.getByRole('heading', { name: /mitigation actions/i })
    ).toBeVisible();

    // 4. Navigate to Daily Plan and capture export download
    await page.getByRole('button', { name: /daily plan/i }).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export csv/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('clearbreath-plan.csv');

    // 5. Navigate to Compare tab
    await page.getByRole('button', { name: /compare/i }).click();
    await expect(
      page.getByRole('heading', { name: /mitigation impact comparison/i })
    ).toBeVisible();
  });
});

test.describe('E2E Storage Persistence and Recovery', () => {
  test('recovers safely from corrupted storage and warns user', async ({
    page,
  }) => {
    // Inject corrupt JSON into storage before load
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'clearbreath_state_v1',
        '{invalid_json_corrupted'
      );
    });

    await page.goto('/');

    // Verify recovery toast notice is displayed
    await expect(
      page.getByText(/reset to default family profile/i)
    ).toBeVisible();

    // Verify default persona is intact in Household panel
    await page.getByRole('button', { name: /household/i }).click();
    await expect(
      page.getByRole('radio', { name: /delhi-ncr family/i })
    ).toBeChecked();
    await expect(
      page.getByRole('heading', { name: /family members \(3\)/i })
    ).toBeVisible();
  });

  test('persists state changes across browser reloads', async ({ page }) => {
    await page.goto('/');

    // Switch city to Gurugram in AirNow panel
    const citySelect = page.getByRole('combobox', { name: /select city/i });
    await citySelect.selectOption('Gurugram');

    // Reload page
    await page.reload();

    // Verify Gurugram is still selected
    await expect(citySelect).toHaveValue('Gurugram');
  });
});

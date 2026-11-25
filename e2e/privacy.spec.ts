import { test, expect } from '@playwright/test';

test.describe('Privacy and Zero-PII Egress Verification', () => {
  test('asserts zero requests to Gemini when AI consent is off', async ({
    page,
  }) => {
    const requestedUrls: string[] = [];
    const consoleErrors: string[] = [];

    page.on('request', (req) => {
      requestedUrls.push(req.url());
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // Navigate to AI Advisor tab with consent OFF
    await page.getByRole('button', { name: /ai advisor/i }).click();

    // Verify AI consent checkbox is unchecked
    const consentCheckbox = page.getByRole('checkbox', {
      name: /enable cloud gemini/i,
    });
    await expect(consentCheckbox).not.toBeChecked();

    // Ask a question using local fallback
    const input = page.getByRole('textbox', {
      name: /ask about air quality/i,
    });
    await input.fill('What is the safest hour for walking?');
    await page.getByRole('button', { name: /^ask$/i }).click();

    // Wait for response to appear
    await expect(
      page.getByText(/prioritize indoor filtration/i).first()
    ).toBeVisible();

    // Assert zero requests were made to generativelanguage.googleapis.com
    const geminiRequests = requestedUrls.filter((url) =>
      url.includes('generativelanguage.googleapis.com')
    );
    expect(geminiRequests).toEqual([]);

    // Assert zero CSP violations or invalid CSP directive errors
    const cspErrors = consoleErrors.filter(
      (msg) =>
        msg.includes('Refused to') || msg.includes('Content Security Policy')
    );
    expect(cspErrors).toEqual([]);
  });
});

test.describe('API Key Protection Verification', () => {
  test('asserts API key is never leaked into localStorage or DOM', async ({
    page,
  }) => {
    const SECRET_KEY = 'ai-secret-test-key-998877';

    await page.goto('/');
    await page.getByRole('button', { name: /ai advisor/i }).click();

    // Expand consent settings and enter key
    await page.getByRole('checkbox', { name: /enable cloud gemini/i }).check();
    const keyInput = page.getByRole('textbox', {
      name: /gemini api key/i,
    });
    await keyInput.fill(SECRET_KEY);

    // Verify key is NOT in localStorage
    const storedState = await page.evaluate(() => {
      return window.localStorage.getItem('clearbreath_state_v1');
    });
    expect(storedState).not.toContain(SECRET_KEY);

    // Verify key does not appear in rendered DOM text
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain(SECRET_KEY);
  });
});

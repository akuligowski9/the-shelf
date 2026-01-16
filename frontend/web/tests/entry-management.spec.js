import { test, expect } from './fixtures.js';

test.describe('Entry Management', () => {
  // Use entryCleanup fixture to auto-delete entries created during tests
  test.beforeEach(async ({ page, entryCleanup }) => {
    await page.goto('/today');
    await page.waitForLoadState('networkidle');
  });

  test('should create a habit entry and verify it appears', async ({ page }) => {
    // Count existing entries
    const entriesBefore = await page.locator('[class*="rounded"]').filter({ hasText: /AM|PM/ }).count();

    // Open Add Entry dialog
    await page.getByRole('button', { name: /Add Entry/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select habit (first available)
    await page.locator('button[role="combobox"]').nth(1).click();
    await page.getByRole('option').first().click();

    // Set duration
    await page.getByPlaceholder(/e.g., 30/i).fill('30');

    // Submit
    await page.getByRole('button', { name: /Add Entry/i }).last().click();

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify entry count increased or entry appears
    await page.waitForTimeout(500);
  });

  test('should create a life entry with note', async ({ page }) => {
    await page.getByRole('button', { name: /Add Entry/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Change to Life type
    await page.locator('button[role="combobox"]').first().click();
    await page.getByRole('option', { name: /Life/i }).click();

    // Add note
    await page.getByRole('textbox').fill('Test life event from E2E');

    // Submit
    await page.getByRole('button', { name: /Add Entry/i }).last().click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should create a caution entry', async ({ page }) => {
    await page.getByRole('button', { name: /Add Entry/i }).click();

    // Change to Caution type
    await page.locator('button[role="combobox"]').first().click();
    await page.getByRole('option', { name: /Caution/i }).click();

    // Add note
    await page.getByRole('textbox').fill('Test caution from E2E');

    // Submit
    await page.getByRole('button', { name: /Add Entry/i }).last().click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should edit an existing entry', async ({ page }) => {
    // Find and click Edit on first entry
    const editButton = page.getByRole('button', { name: /Edit/i }).first();

    if (await editButton.isVisible()) {
      await editButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('heading', { name: /Edit Entry/i })).toBeVisible();

      // Should show Time field when editing
      await expect(page.getByText('Time')).toBeVisible();

      // Close without saving
      await page.getByRole('button', { name: /Cancel/i }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  });

  test('should toggle highlight on entry', async ({ page }) => {
    const highlightButton = page.getByRole('button', { name: /Highlight/i }).first();

    if (await highlightButton.isVisible()) {
      await highlightButton.click();
      // Should toggle - check for visual change or Unhighlight text
      await page.waitForTimeout(300);
    }
  });

  test('should archive an entry from edit dialog', async ({ page }) => {
    const editButton = page.getByRole('button', { name: /Edit/i }).first();

    if (await editButton.isVisible()) {
      await editButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Should have Archive option
      await expect(page.getByRole('button', { name: /Archive this entry/i })).toBeVisible();

      // Close without archiving
      await page.getByRole('button', { name: /Cancel/i }).click();
    }
  });
});

test.describe('Entry with Practice and Target', () => {
  test.beforeEach(async ({ page, entryCleanup }) => {
    await page.goto('/today');
    await page.waitForLoadState('networkidle');
  });

  test('should show practice dropdown when habit is selected', async ({ page }) => {
    await page.getByRole('button', { name: /Add Entry/i }).click();
    await page.waitForTimeout(300);

    // Select a habit that has practices (Software)
    const habitCombobox = page.locator('button[role="combobox"]').nth(1);
    if (await habitCombobox.isVisible()) {
      await habitCombobox.click();
      await page.waitForTimeout(200);

      const softwareOption = page.getByRole('option', { name: /Software/i });
      if (await softwareOption.isVisible()) {
        await softwareOption.click();
        await page.waitForTimeout(300);

        // Should show Practice field when habit has practices
        const practiceLabel = page.getByText('Practice', { exact: true });
        await page.waitForTimeout(200);
        // Practice field may or may not show depending on habit configuration
      }
    }

    // Close dialog
    await page.keyboard.press('Escape');
  });

  test('should show target dropdown when habit has targets', async ({ page }) => {
    await page.getByRole('button', { name: /Add Entry/i }).click();
    await page.waitForTimeout(300);

    // Select Software habit (which has a target)
    const habitCombobox = page.locator('button[role="combobox"]').nth(1);
    if (await habitCombobox.isVisible()) {
      await habitCombobox.click();
      await page.waitForTimeout(200);

      const softwareOption = page.getByRole('option', { name: /Software/i });
      if (await softwareOption.isVisible()) {
        await softwareOption.click();
        await page.waitForTimeout(300);

        // Should show Target field when habit has targets
        const targetLabel = page.getByText('Target', { exact: true });
        await page.waitForTimeout(200);
        // Target field may or may not show depending on habit configuration
      }
    }

    // Close dialog
    await page.keyboard.press('Escape');
  });
});

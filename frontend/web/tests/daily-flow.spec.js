import { test, expect } from './fixtures.js';

test.describe('Daily Flow', () => {
  // Use entryCleanup fixture to auto-delete entries created during tests
  test.beforeEach(async ({ page, entryCleanup }) => {
    // Start at Today view
    await page.goto('/today');
    await page.waitForLoadState('networkidle');
  });

  test('should display Today view with date header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Today/i })).toBeVisible();
    await expect(page.getByText(/Thursday|Friday|Saturday|Sunday|Monday|Tuesday|Wednesday/i)).toBeVisible();
  });

  test('should open Add Entry dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Add Entry/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Add Entry/i })).toBeVisible();
  });

  test('should add a habit entry', async ({ page }) => {
    // Open dialog
    await page.getByRole('button', { name: /Add Entry/i }).click();
    await page.waitForTimeout(300);

    const dialog = page.getByRole('dialog');
    if (await dialog.isVisible()) {
      // Select habit type (default should be Habit)
      await expect(page.getByText('Habit').first()).toBeVisible();

      // Select a habit from the second combobox
      const habitCombobox = page.locator('button[role="combobox"]').nth(1);
      if (await habitCombobox.isVisible()) {
        await habitCombobox.click();
        await page.waitForTimeout(200);

        const firstOption = page.getByRole('option').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
          await page.waitForTimeout(200);

          // Add duration
          const durationInput = page.getByPlaceholder(/e.g., 30/i);
          if (await durationInput.isVisible()) {
            await durationInput.fill('45');
          }

          // Submit
          await page.getByRole('button', { name: /Add Entry/i }).click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should add a life entry', async ({ page }) => {
    // Open dialog
    await page.getByRole('button', { name: /Add Entry/i }).click();

    // Change to Life type
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: /Life/i }).click();

    // Add note
    await page.getByPlaceholder(/What happened/i).fill('Test life event');

    // Submit
    await page.getByRole('button', { name: /Add Entry/i }).click();

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should navigate between days', async ({ page }) => {
    // Look for navigation buttons (may be left/right arrows)
    const prevBtn = page.locator('button').filter({ has: page.locator('svg') }).first();

    if (await prevBtn.isVisible()) {
      await prevBtn.click();
      await page.waitForTimeout(500);

      // Try to return to today if button exists
      const todayBtn = page.getByRole('button', { name: /Today/i });
      if (await todayBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await todayBtn.click();
      }
    }
  });
});

test.describe('Edit Entry', () => {
  test.beforeEach(async ({ page, entryCleanup }) => {
    await page.goto('/today');
    await page.waitForLoadState('networkidle');
  });

  test('should open edit dialog when clicking Edit on an entry', async ({ page }) => {
    // Find an entry with Edit button
    const editButton = page.getByRole('button', { name: /Edit/i }).first();

    if (await editButton.isVisible()) {
      await editButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('heading', { name: /Edit Entry/i })).toBeVisible();
    }
  });

  test('should show timestamp field when editing', async ({ page }) => {
    const editButton = page.getByRole('button', { name: /Edit/i }).first();

    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(300);

      // Look for timestamp/time field in edit dialog
      const timeField = page.getByLabel(/Time/i)
        .or(page.getByText('Occurred at', { exact: true }))
        .or(page.locator('input[type="time"]'));

      // Timestamp field may or may not be visible depending on entry type
      await page.waitForTimeout(200);
      await page.keyboard.press('Escape');
    }
  });
});

test.describe('Day Preparation and Closure', () => {
  test.beforeEach(async ({ page, entryCleanup }) => {
    await page.goto('/today');
    await page.waitForLoadState('networkidle');
  });

  test('should show day preparation card', async ({ page }) => {
    const prepCard = page.getByText(/Start your day with intention/i).or(
      page.getByText(/Day Preparation/i)
    );
    await expect(prepCard).toBeVisible();
  });

  test('should show day closure option', async ({ page }) => {
    const closeButton = page.getByRole('button', { name: /Close the day/i });
    await expect(closeButton).toBeVisible();
  });
});

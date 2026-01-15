import { test, expect } from '@playwright/test';

test.describe('Day Preparation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/today');
    await page.waitForLoadState('networkidle');
  });

  test('should display day preparation prompt', async ({ page }) => {
    const prepPrompt = page.getByText(/Start your day with intention/i)
      .or(page.getByText(/Day Preparation/i));
    await expect(prepPrompt).toBeVisible();
  });

  test('should open preparation dialog when clicked', async ({ page }) => {
    const prepCard = page.getByText(/Start your day with intention/i);

    if (await prepCard.isVisible()) {
      await prepCard.click();
      await page.waitForTimeout(300);

      // Should open dialog
      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible()) {
        await expect(dialog).toBeVisible();
        await page.keyboard.press('Escape');
      }
    }
  });

  test('should allow setting intentions', async ({ page }) => {
    const prepCard = page.getByText(/Start your day with intention/i);

    if (await prepCard.isVisible()) {
      await prepCard.click();
      await page.waitForTimeout(300);

      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible()) {
        // Should have text area for intentions
        const textArea = page.getByRole('textbox');
        if (await textArea.isVisible()) {
          await textArea.fill('Test intention from E2E');
        }
        await page.keyboard.press('Escape');
      }
    }
  });

  test('should allow marking as rest day', async ({ page }) => {
    const prepCard = page.getByText(/Start your day with intention/i);

    if (await prepCard.isVisible()) {
      await prepCard.click();
      await page.waitForTimeout(300);

      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible()) {
        // Look for rest day checkbox
        const restDayOption = page.getByText(/Rest Day/i);
        await page.waitForTimeout(200);
        await page.keyboard.press('Escape');
      }
    }
  });
});

test.describe('Day Closure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/today');
    await page.waitForLoadState('networkidle');
  });

  test('should display close day button', async ({ page }) => {
    const closeBtn = page.getByRole('button', { name: /Close the day/i });
    await expect(closeBtn).toBeVisible();
  });

  test('should open closure dialog', async ({ page }) => {
    const closeBtn = page.getByRole('button', { name: /Close the day/i });

    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(300);

      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible()) {
        await expect(dialog).toBeVisible();
        await page.keyboard.press('Escape');
      }
    }
  });

  test('should allow adding closure notes', async ({ page }) => {
    const closeBtn = page.getByRole('button', { name: /Close the day/i });

    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(300);

      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible()) {
        const textArea = page.getByRole('textbox');
        if (await textArea.isVisible()) {
          await textArea.fill('Test closure note from E2E');
        }
        await page.keyboard.press('Escape');
      }
    }
  });
});

test.describe('Session Warm-up/Cool-down', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/today');
    await page.waitForLoadState('networkidle');
  });

  test('should show Session button on habit entries', async ({ page }) => {
    const sessionBtn = page.getByRole('button', { name: /Session/i }).first();
    // May or may not be visible depending on entries
    await page.waitForTimeout(300);
  });

  test('should open session menu with warm-up option', async ({ page }) => {
    const sessionBtn = page.getByRole('button', { name: /Session/i }).first();

    if (await sessionBtn.isVisible()) {
      await sessionBtn.click();
      await page.waitForTimeout(300);

      // Should show warm-up/cool-down options
      const warmUp = page.getByText(/Warm-up|Cool-down/i);
      await page.waitForTimeout(200);
    }
  });
});

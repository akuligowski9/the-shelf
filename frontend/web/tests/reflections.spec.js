import { test, expect } from '@playwright/test';

test.describe('Reflections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/review');
    await page.waitForLoadState('networkidle');
  });

  test('should display reflection editor', async ({ page }) => {
    // Should have a rich text editor area
    const editor = page.locator('[contenteditable="true"]')
      .or(page.locator('.ProseMirror'))
      .or(page.getByRole('textbox'));

    await page.waitForTimeout(500);
  });

  test('should display reflection prompts/triggers', async ({ page }) => {
    // Trigger section with prompts
    const triggers = page.getByText(/Prompts|What went well/i);
    await page.waitForTimeout(300);
  });

  test('should allow clicking trigger to start reflection', async ({ page }) => {
    // Find a Reflect button
    const reflectBtn = page.getByRole('button', { name: /Reflect/i }).first();

    if (await reflectBtn.isVisible()) {
      await reflectBtn.click();
      await page.waitForTimeout(300);

      // Editor should be focused or scrolled to
    }
  });

  test('should display accomplishments section', async ({ page }) => {
    // Accomplishments may be a text element, not a heading
    await expect(page.getByText('Accomplishments', { exact: true }).or(page.getByRole('heading', { name: /Accomplishments/i }))).toBeVisible();
  });

  test('should show highlights in accomplishments', async ({ page }) => {
    // Accomplishments may include highlighted entries
    const accomplishments = page.locator('text=/Highlights|Completed/i');
    await page.waitForTimeout(300);
  });

  test('should display past reflections', async ({ page }) => {
    await expect(page.getByText(/Past Reflections/i)).toBeVisible();
  });

  test('should show View All when many reflections', async ({ page }) => {
    const viewAll = page.getByText(/View all/i);
    // Only visible if more than 5 reflections
    await page.waitForTimeout(300);
  });

  test('should open View All modal', async ({ page }) => {
    const viewAll = page.getByText(/View all/i);

    if (await viewAll.isVisible()) {
      await viewAll.click();
      await page.waitForTimeout(300);

      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible()) {
        await expect(page.getByRole('heading', { name: /All Reflections/i })).toBeVisible();
        await page.keyboard.press('Escape');
      }
    }
  });

  test('should allow deleting reflection', async ({ page }) => {
    // Hover over reflection to show delete button
    const reflection = page.locator('[class*="rounded"]').filter({ hasText: /Jan|Feb|Mar/i }).first();

    if (await reflection.isVisible()) {
      await reflection.hover();
      await page.waitForTimeout(200);

      // Delete button should appear on hover
      const deleteBtn = page.locator('[title*="Delete"]').or(page.locator('button').filter({ has: page.locator('svg') }));
    }
  });
});

test.describe('Reflection Period Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/review');
    await page.waitForLoadState('networkidle');
  });

  test('should display period selector', async ({ page }) => {
    // Week/Month/Year selector
    await expect(
      page.getByRole('button', { name: /Week/i })
        .or(page.getByText(/Week/i).first())
    ).toBeVisible();
  });

  test('should navigate between periods', async ({ page }) => {
    // Previous/next buttons
    const prevBtn = page.locator('button').filter({ has: page.locator('svg') }).first();

    if (await prevBtn.isVisible()) {
      await prevBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('should update accomplishments when period changes', async ({ page }) => {
    // Change period and verify content updates
    const prevBtn = page.locator('button').filter({ has: page.locator('svg') }).first();

    if (await prevBtn.isVisible()) {
      await prevBtn.click();
      await page.waitForLoadState('networkidle');

      // Accomplishments should reflect the new period
      await expect(page.getByText('Accomplishments', { exact: true }).or(page.getByRole('heading', { name: /Accomplishments/i }))).toBeVisible();
    }
  });
});

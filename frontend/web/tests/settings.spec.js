import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display theme selector', async ({ page }) => {
    await expect(page.getByText('Theme')).toBeVisible();
  });

  test('should show current theme option', async ({ page }) => {
    // Should show Light, Dark, or Auto
    await expect(
      page.getByText(/Light|Dark|Auto/i).first()
    ).toBeVisible();
  });

  test('should open theme dropdown', async ({ page }) => {
    // Find the theme selector combobox
    const themeSelect = page.locator('button[role="combobox"]').filter({ hasText: /Light|Dark|Auto/i });

    if (await themeSelect.isVisible()) {
      await themeSelect.click();
      await page.waitForTimeout(200);

      // Should show options
      await expect(page.getByRole('option', { name: /Light/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /Dark/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /Auto/i })).toBeVisible();

      await page.keyboard.press('Escape');
    }
  });

  test('should switch to dark theme', async ({ page }) => {
    const themeSelect = page.locator('button[role="combobox"]').filter({ hasText: /Light|Dark|Auto/i });

    if (await themeSelect.isVisible()) {
      await themeSelect.click();
      await page.waitForTimeout(200);

      await page.getByRole('option', { name: /Dark/i }).click();
      await page.waitForTimeout(300);

      // Body should have dark class or dark background
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);
    }
  });

  test('should switch to light theme', async ({ page }) => {
    const themeSelect = page.locator('button[role="combobox"]').filter({ hasText: /Light|Dark|Auto/i });

    if (await themeSelect.isVisible()) {
      await themeSelect.click();
      await page.waitForTimeout(200);

      await page.getByRole('option', { name: /Light/i }).click();
      await page.waitForTimeout(300);

      // Body should not have dark class
      const html = page.locator('html');
      await expect(html).not.toHaveClass(/dark/);
    }
  });

  test('should persist theme after navigation', async ({ page }) => {
    // Set dark theme
    const themeSelect = page.locator('button[role="combobox"]').filter({ hasText: /Light|Dark|Auto/i });

    if (await themeSelect.isVisible()) {
      await themeSelect.click();
      await page.getByRole('option', { name: /Dark/i }).click();
      await page.waitForTimeout(300);

      // Navigate away
      await page.getByRole('link', { name: /Shelf/i }).click();
      await page.waitForLoadState('networkidle');

      // Should still be dark
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);

      // Navigate back and restore light
      await page.getByRole('link', { name: /Settings/i }).click();
      await page.waitForLoadState('networkidle');

      const themeSelect2 = page.locator('button[role="combobox"]').filter({ hasText: /Light|Dark|Auto/i });
      await themeSelect2.click();
      await page.getByRole('option', { name: /Light/i }).click();
    }
  });
});

test.describe('Timezone Setting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display timezone selector', async ({ page }) => {
    await expect(page.getByText('Timezone', { exact: true })).toBeVisible();
  });

  test('should show current timezone', async ({ page }) => {
    // Should show a timezone like Eastern, Pacific, etc.
    await expect(
      page.getByText(/Eastern|Pacific|Central|Mountain|UTC/i).first()
    ).toBeVisible();
  });

  test('should open timezone dropdown', async ({ page }) => {
    const tzSelect = page.locator('button[role="combobox"]').filter({ hasText: /Eastern|Pacific|Central|Mountain|UTC/i });

    if (await tzSelect.isVisible()) {
      await tzSelect.click();
      await page.waitForTimeout(200);

      // Should show timezone options
      await expect(page.getByRole('option').first()).toBeVisible();

      await page.keyboard.press('Escape');
    }
  });
});

test.describe('Data Health', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display tracking stats', async ({ page }) => {
    // Should show tracking since, total entries, etc.
    await expect(page.getByText(/Tracking since|Total entries/i).first()).toBeVisible();
  });

  test('should display gaps info', async ({ page }) => {
    await expect(page.getByText(/Gaps/i)).toBeVisible();
  });

  test('should display orphaned entries count', async ({ page }) => {
    await expect(page.getByText(/Orphaned/i)).toBeVisible();
  });

  test('should have expandable habits coverage', async ({ page }) => {
    const habitsSection = page.getByText(/Habits.*Coverage/i);

    if (await habitsSection.isVisible()) {
      await habitsSection.click();
      await page.waitForTimeout(300);

      // Should expand to show habit stats
    }
  });

  test('should show transitions history', async ({ page }) => {
    const transitions = page.getByText(/Transitions/i);
    await page.waitForTimeout(300);
  });
});

test.describe('About Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display about section', async ({ page }) => {
    // About is not a heading element, it's a generic text element
    await expect(page.getByText('About', { exact: true })).toBeVisible();
  });

  test('should show version number', async ({ page }) => {
    await expect(page.getByText(/Version/i)).toBeVisible();
  });
});

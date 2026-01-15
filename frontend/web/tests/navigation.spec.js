import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all main views', async ({ page }) => {
    // Start at home (Shelf view)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should be on Shelf view - check for content
    await expect(page.getByText('On the Shelf', { exact: true }).or(page.getByRole('heading', { name: 'On the Shelf' }))).toBeVisible();

    // Navigate to Today
    await page.getByRole('link', { name: /Today/i }).click();
    await expect(page.getByRole('heading', { name: /Today/i })).toBeVisible();

    // Navigate to Progress
    await page.getByRole('link', { name: /Progress/i }).click();
    await page.waitForLoadState('networkidle');
    // Progress page has Balance/Patterns buttons
    await expect(page.getByRole('button', { name: 'Balance' })).toBeVisible();

    // Navigate to Review
    await page.getByRole('link', { name: /Review/i }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Accomplishments', { exact: true })).toBeVisible();

    // Navigate to Settings
    await page.getByRole('link', { name: /Settings/i }).click();
    await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
  });

  test('should show bottom navigation bar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check nav items exist
    await expect(page.getByRole('link', { name: /Shelf/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Today/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Progress/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Review/i })).toBeVisible();
  });
});

test.describe('Shelf View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display habits accordion', async ({ page }) => {
    // Check for habits in the accordion
    await expect(page.getByRole('heading', { name: /Habits/i }).or(page.locator('[data-state]').filter({ hasText: /Software|Exercise/i }).first())).toBeVisible();
  });

  test('should display targets on the shelf', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'On the Shelf' })).toBeVisible();
  });

  test('should display activity stats', async ({ page }) => {
    // Activity section with Today/Week/Month
    await expect(page.getByRole('heading', { name: /Activity/i }).or(page.getByText(/This Week/i))).toBeVisible();
  });
});

test.describe('Settings View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display preferences section', async ({ page }) => {
    // Preferences is a generic element, not a heading
    await expect(page.getByText('Preferences', { exact: true })).toBeVisible();
  });

  test('should display theme option', async ({ page }) => {
    await expect(page.getByText('Theme', { exact: true })).toBeVisible();
  });

  test('should display timezone option', async ({ page }) => {
    await expect(page.getByText('Timezone', { exact: true })).toBeVisible();
  });

  test('should display data management options', async ({ page }) => {
    await expect(page.getByText('Import Data', { exact: true })).toBeVisible();
    await expect(page.getByText('Export Data', { exact: true })).toBeVisible();
  });

  test('should display data health section', async ({ page }) => {
    // Data Health is a generic element, not a heading
    await expect(page.getByText('Data Health', { exact: true })).toBeVisible();
  });
});

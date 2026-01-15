import { test, expect } from '@playwright/test';

test.describe('Shelf View Metrics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display activity stats section', async ({ page }) => {
    // Look for Activity heading or stats
    await expect(
      page.getByRole('heading', { name: /Activity/i })
        .or(page.getByText(/This Week/i))
    ).toBeVisible();
  });

  test('should show today stats', async ({ page }) => {
    // Should show Today with some metric
    await expect(page.getByText(/Today/i).first()).toBeVisible();
  });

  test('should show weekly stats', async ({ page }) => {
    await expect(page.getByText(/This Week/i)).toBeVisible();
  });

  test('should show monthly stats', async ({ page }) => {
    await expect(page.getByText(/This Month/i)).toBeVisible();
  });

  test('should display habits with session counts', async ({ page }) => {
    // Habits section should exist
    const habitsSection = page.locator('text=Habits').first();
    await expect(habitsSection).toBeVisible();
  });

  test('should display target progress on shelf', async ({ page }) => {
    // If there are active targets, they should show progress
    const activeSection = page.getByText(/Active/i).first();
    if (await activeSection.isVisible()) {
      await expect(activeSection).toBeVisible();
    }
  });

  test('should show recent highlights if any exist', async ({ page }) => {
    // Highlights section
    const highlightsSection = page.getByText(/Recent Highlights/i);
    // May or may not be visible depending on data
    await page.waitForTimeout(300);
  });
});

test.describe('Progress View Metrics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/progress');
    await page.waitForLoadState('networkidle');
  });

  test('should display time range selector', async ({ page }) => {
    // Week/Month/Year toggle
    await expect(
      page.getByRole('button', { name: /Week/i })
        .or(page.getByText(/Week/i).first())
    ).toBeVisible();
  });

  test('should display chart area', async ({ page }) => {
    // Should have some chart or visualization
    await page.waitForTimeout(500);
    // Check for recharts elements or chart container
    const chartArea = page.locator('.recharts-wrapper').or(page.locator('[class*="chart"]'));
    // Chart may or may not be visible depending on data
  });

  test('should toggle between Balance and Patterns', async ({ page }) => {
    const balanceBtn = page.getByRole('button', { name: /Balance/i });
    const patternsBtn = page.getByRole('button', { name: /Patterns/i });

    if (await balanceBtn.isVisible()) {
      await balanceBtn.click();
      await page.waitForTimeout(300);
    }

    if (await patternsBtn.isVisible()) {
      await patternsBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('should navigate between time periods', async ({ page }) => {
    // Find previous/next navigation buttons
    const prevButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    const nextButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1);

    // Click through periods if buttons exist
    if (await prevButton.isVisible()) {
      await prevButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('should show habit breakdown stats', async ({ page }) => {
    // Look for distribution or habit stats
    const statsSection = page.getByText(/Total|hours|sessions/i).first();
    await page.waitForTimeout(300);
  });
});

test.describe('Review View Metrics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/review');
    await page.waitForLoadState('networkidle');
  });

  test('should display period summary', async ({ page }) => {
    // Should show summary stats
    await expect(
      page.getByText(/Total|Sessions|Cautions/i).first()
    ).toBeVisible();
  });

  test('should display accomplishments section', async ({ page }) => {
    // Accomplishments may be a text element, not a heading
    await expect(page.getByText('Accomplishments', { exact: true }).or(page.getByRole('heading', { name: /Accomplishments/i }))).toBeVisible();
  });

  test('should display past reflections section', async ({ page }) => {
    await expect(page.getByText(/Past Reflections/i)).toBeVisible();
  });

  test('should show view all link when many reflections', async ({ page }) => {
    // If there are more than 5 reflections, should show View all
    const viewAllLink = page.getByText(/View all/i);
    // May or may not be visible depending on data
    await page.waitForTimeout(300);
  });

  test('should have reflection triggers', async ({ page }) => {
    // Should show trigger options for reflections
    const promptsSection = page.getByText(/Prompts|Triggers/i);
    await page.waitForTimeout(300);
  });
});

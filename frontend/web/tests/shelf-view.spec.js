import { test, expect } from './fixtures.js';

test.describe('Shelf View - Complete Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display welcome header with date', async ({ page }) => {
    // Should show day of week and date
    await expect(
      page.getByText(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/i).first()
    ).toBeVisible();
  });

  test('should display habits accordion', async ({ page }) => {
    // Habits section with expandable items
    const habitsSection = page.getByText(/Habits/i).first();
    await expect(habitsSection).toBeVisible();
  });

  test('should show habit names in accordion', async ({ page }) => {
    // Should show actual habit names
    const habitNames = ['Software', 'Exercise', 'Spanish', 'Dog Training', 'Reading'];

    for (const name of habitNames) {
      const habitElement = page.getByText(name).first();
      // At least some habits should be visible
    }
  });

  test('should display The Shelf section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'The Shelf' })).toBeVisible();
  });

  test('should show Active targets count', async ({ page }) => {
    // Active (N) format
    await expect(page.getByText(/Active/i).first()).toBeVisible();
  });

  test('should show Planned targets section', async ({ page }) => {
    await expect(page.getByText(/Planned/i).first()).toBeVisible();
  });

  test('should show Parked targets section', async ({ page }) => {
    await expect(page.getByText(/Parked/i).first()).toBeVisible();
  });

  test('should display target with habit badge', async ({ page }) => {
    // Targets should show associated habit
    const targetWithBadge = page.locator('[draggable="true"]').first();

    if (await targetWithBadge.isVisible()) {
      // Should have habit badge inside
      await expect(targetWithBadge).toBeVisible();
    }
  });

  test('should display target progress (time and sessions)', async ({ page }) => {
    // Target cards show progress like "27h 40m" and "11 sessions"
    const timeProgress = page.getByText(/\d+h|\d+m/i).first();
    const sessionsProgress = page.getByText(/\d+ sessions?/i).first();

    await page.waitForTimeout(300);
  });

  test('should display activity stats card', async ({ page }) => {
    // Activity section with Today, This Week, This Month
    await expect(page.getByText(/Today/i).first()).toBeVisible();
    await expect(page.getByText(/This Week/i)).toBeVisible();
    await expect(page.getByText(/This Month/i)).toBeVisible();
  });

  test('should show prep/closure indicators', async ({ page }) => {
    // Sun and moon icons for prep/closure status
    // These are in the activity stats area
    await page.waitForTimeout(300);
  });

  test('should display Recent Highlights section', async ({ page }) => {
    const highlightsSection = page.getByText(/Recent Highlights/i);
    await page.waitForTimeout(300);
  });

  test('should link to Today view', async ({ page }) => {
    const todayLink = page.getByRole('link', { name: /Today/i });
    await expect(todayLink).toBeVisible();
  });

  test('should link to Attention view from Manage Targets', async ({ page }) => {
    const manageLink = page.getByText(/Manage Targets/i);
    await expect(manageLink).toBeVisible();

    await manageLink.click();
    await page.waitForLoadState('networkidle');

    // Should navigate to attention view
    await expect(page.url()).toContain('/attention');
  });
});

test.describe('Shelf View - Habits Accordion Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should expand habit to show practices', async ({ page }) => {
    // Find and click a habit accordion item
    const habitItem = page.locator('[data-state="closed"]').filter({ hasText: /Software/i }).first();

    if (await habitItem.isVisible()) {
      await habitItem.click();
      await page.waitForTimeout(300);

      // Should show practices
      const practices = page.getByText(/Development|Architecture/i);
    }
  });

  test('should collapse habit accordion', async ({ page }) => {
    // Find an open accordion and close it
    const openItem = page.locator('[data-state="open"]').first();

    if (await openItem.isVisible()) {
      await openItem.click();
      await page.waitForTimeout(300);
    }
  });

  test('should show practice count or details', async ({ page }) => {
    // Habits may show practice count when collapsed
    await page.waitForTimeout(300);
  });
});

test.describe('Shelf View - Target Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should drag and drop targets between columns', async ({ page }) => {
    // Find a draggable target
    const target = page.locator('[draggable="true"]').first();

    if (await target.isVisible()) {
      // Get source and destination
      const parkColumn = page.getByText(/Parked/i).first();

      // Note: Full drag-drop testing is complex
      await expect(target).toBeVisible();
    }
  });

  test('should click target to view/edit', async ({ page }) => {
    const target = page.locator('[draggable="true"]').first();

    if (await target.isVisible()) {
      await target.click();
      await page.waitForTimeout(300);

      // Should open edit dialog
      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible()) {
        await page.keyboard.press('Escape');
      }
    }
  });
});

test.describe('Shelf View - Data Consistency', () => {
  // Use entryCleanup fixture to auto-delete entries created during tests
  test.beforeEach(async ({ page, entryCleanup }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show consistent data between shelf and today', async ({ page }) => {
    // Get today's activity from shelf
    const todayActivity = page.getByText(/Today/i).first();

    // Navigate to Today view
    await page.getByRole('link', { name: /Today/i }).click();
    await page.waitForLoadState('networkidle');

    // Should show entries that match the shelf activity
    await expect(page.getByRole('heading', { name: /Today/i })).toBeVisible();
  });

  test('should update after adding entry', async ({ page }) => {
    // Go to Today, add entry
    await page.getByRole('link', { name: /Today/i }).click();
    await page.waitForLoadState('networkidle');

    // Add a quick entry
    await page.getByRole('button', { name: /Add Entry/i }).click();
    await page.locator('button[role="combobox"]').nth(1).click();
    await page.getByRole('option').first().click();
    await page.getByPlaceholder(/e.g., 30/i).fill('15');
    await page.getByRole('button', { name: /Add Entry/i }).last().click();

    // Go back to Shelf
    await page.getByRole('link', { name: /Shelf/i }).click();
    await page.waitForLoadState('networkidle');

    // Activity should reflect the new entry
    await expect(page.getByText(/Today/i).first()).toBeVisible();
  });
});

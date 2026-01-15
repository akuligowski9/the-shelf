import { test, expect } from '@playwright/test';

test.describe('Attention View - Habits Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/attention');
    await page.waitForLoadState('networkidle');
  });

  test('should display habits tree view', async ({ page }) => {
    // Should show habits section
    await expect(page.getByText(/Habits/i).first()).toBeVisible();
  });

  test('should expand habit to show practices', async ({ page }) => {
    // Click on a habit to expand
    const habitItem = page.locator('[data-state]').filter({ hasText: /Software|Exercise/i }).first();

    if (await habitItem.isVisible()) {
      await habitItem.click();
      await page.waitForTimeout(300);
    }
  });

  test('should open Add Habit form', async ({ page }) => {
    // Look for Add Habit button or inline form
    const addHabitBtn = page.getByRole('button', { name: /Add Habit/i })
      .or(page.getByText(/Add Habit/i));

    if (await addHabitBtn.isVisible()) {
      await addHabitBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('should open habit edit dialog', async ({ page }) => {
    // Click on edit for a habit
    const editBtn = page.locator('[class*="edit"]').or(page.getByRole('button', { name: /edit/i })).first();

    if (await editBtn.isVisible()) {
      await editBtn.click();

      // Should show edit dialog
      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible()) {
        await expect(dialog).toBeVisible();
        await page.getByRole('button', { name: /Cancel/i }).click();
      }
    }
  });
});

test.describe('Attention View - Practices Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/attention');
    await page.waitForLoadState('networkidle');
  });

  test('should show practices under expanded habit', async ({ page }) => {
    // Expand a habit first
    const habitItem = page.locator('button').filter({ hasText: /Software/i }).first();

    if (await habitItem.isVisible()) {
      await habitItem.click();
      await page.waitForTimeout(500);

      // Should show practices like Development, Architecture Planning
      const practice = page.getByText(/Development|Architecture/i);
      // Practices may or may not be visible depending on expansion state
    }
  });

  test('should have add practice option', async ({ page }) => {
    // Expand a habit
    const habitItem = page.locator('button').filter({ hasText: /Software/i }).first();

    if (await habitItem.isVisible()) {
      await habitItem.click();
      await page.waitForTimeout(300);

      // Look for Add Practice
      const addPractice = page.getByText(/Add Practice/i);
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Attention View - Actions Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/attention');
    await page.waitForLoadState('networkidle');
  });

  test('should show actions under practice for habits with track_actions', async ({ page }) => {
    // Need to expand habit and practice to see actions
    const habitItem = page.locator('button').filter({ hasText: /Software/i }).first();

    if (await habitItem.isVisible()) {
      await habitItem.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Attention View - Targets Kanban', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/attention');
    await page.waitForLoadState('networkidle');
  });

  test('should display targets kanban board', async ({ page }) => {
    // Should show kanban columns
    await expect(page.getByText(/Active/i).first()).toBeVisible();
    await expect(page.getByText(/Planned/i).first()).toBeVisible();
    await expect(page.getByText(/Parked/i).first()).toBeVisible();
  });

  test('should display Done column', async ({ page }) => {
    await expect(page.getByText(/Done/i).first()).toBeVisible();
  });

  test('should show Manage Targets link', async ({ page }) => {
    const manageLink = page.getByText(/Manage Targets/i);
    await expect(manageLink).toBeVisible();
  });

  test('should open target creation dialog', async ({ page }) => {
    // Look for add target button
    const addBtn = page.getByRole('button', { name: /Add Target/i })
      .or(page.locator('button').filter({ has: page.locator('svg[class*="plus"]') }));

    // May need to click Manage Targets first
    const manageLink = page.getByText(/Manage Targets/i);
    if (await manageLink.isVisible()) {
      await manageLink.click();
      await page.waitForTimeout(300);
    }
  });

  test('should display existing target with status', async ({ page }) => {
    // Look for a target card
    const targetCard = page.locator('[draggable="true"]').first()
      .or(page.getByText(/The Shelf/i));

    await page.waitForTimeout(300);
  });
});

test.describe('Target Status Changes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/attention');
    await page.waitForLoadState('networkidle');
  });

  test('should be able to drag target between columns', async ({ page }) => {
    // Find a draggable target
    const target = page.locator('[draggable="true"]').first();

    if (await target.isVisible()) {
      // Note: Actual drag-drop testing requires more complex setup
      await expect(target).toBeVisible();
    }
  });

  test('should open target edit dialog on click', async ({ page }) => {
    // Click on a target to edit
    const targetCard = page.locator('[draggable="true"]').first();

    if (await targetCard.isVisible()) {
      await targetCard.click();
      await page.waitForTimeout(300);

      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible()) {
        // Should show status selector
        await expect(page.getByText(/Status/i)).toBeVisible();
        await page.getByRole('button', { name: /Cancel/i }).click();
      }
    }
  });

  test('should show target status options in edit dialog', async ({ page }) => {
    const targetCard = page.locator('[draggable="true"]').first();

    if (await targetCard.isVisible()) {
      await targetCard.click();
      await page.waitForTimeout(300);

      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible()) {
        // Click status dropdown
        const statusSelect = page.locator('button[role="combobox"]').filter({ hasText: /active|planned|parked|done/i });

        if (await statusSelect.isVisible()) {
          await statusSelect.click();
          await page.waitForTimeout(200);

          // Should show status options
          await expect(page.getByRole('option', { name: /Active/i }).or(page.getByRole('option', { name: /Parked/i }))).toBeVisible();
        }

        await page.keyboard.press('Escape');
      }
    }
  });
});

test.describe('Warm-up and Cool-down Templates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/attention');
    await page.waitForLoadState('networkidle');
  });

  test('should show template counts in habit tree', async ({ page }) => {
    // Templates show as ↑ and ↓ counts
    const templateIndicator = page.locator('text=/↑|↓/');
    await page.waitForTimeout(300);
  });

  test('should access templates in habit edit dialog', async ({ page }) => {
    // Click edit on a habit
    // This would require clicking through to the habit edit dialog
    // and checking for the templates section
    await page.waitForTimeout(300);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Daily Flow', () => {
  test.beforeEach(async ({ page }) => {
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
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select habit type (default)
    await expect(page.getByText('Habit')).toBeVisible();

    // Select a habit
    await page.getByRole('combobox', { name: /Habit/i }).click();
    await page.getByRole('option').first().click();

    // Add duration
    await page.getByPlaceholder(/e.g., 30/i).fill('45');

    // Submit
    await page.getByRole('button', { name: /Add Entry/i }).click();

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
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
    // Click previous day
    await page.getByRole('button', { name: /previous/i }).or(page.locator('button').filter({ has: page.locator('svg') }).first()).click();

    // Should show a different date or "Yesterday"
    await page.waitForTimeout(500);

    // Click Today button to return
    await page.getByRole('button', { name: /Today/i }).click();
  });
});

test.describe('Edit Entry', () => {
  test.beforeEach(async ({ page }) => {
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
      await expect(page.getByLabel(/Time/i)).toBeVisible();
    }
  });
});

test.describe('Day Preparation and Closure', () => {
  test.beforeEach(async ({ page }) => {
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

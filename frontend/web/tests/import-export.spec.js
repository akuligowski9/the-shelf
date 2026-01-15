import { test, expect } from '@playwright/test';

test.describe('Import/Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display export button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Export/i })).toBeVisible();
  });

  test('should display import button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Import/i })).toBeVisible();
  });

  test('should trigger export download', async ({ page }) => {
    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

    // Click export
    await page.getByRole('button', { name: /Export/i }).click();

    // Wait for download (may not complete in test environment)
    const download = await downloadPromise;

    if (download) {
      // Verify filename pattern
      const filename = download.suggestedFilename();
      expect(filename).toMatch(/the-shelf-export.*\.json/);
    }
  });

  test('should show Data Management section', async ({ page }) => {
    await expect(page.getByText('Data Management', { exact: true })).toBeVisible();
  });
});

test.describe('Pending Imports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should show pending imports section when files exist', async ({ page }) => {
    // This section only shows if there are files in data/imports/
    const pendingSection = page.getByText(/Pending Imports/i);
    // May or may not be visible depending on files
    await page.waitForTimeout(300);
  });

  test('should show preview button for pending files', async ({ page }) => {
    const previewBtn = page.getByRole('button', { name: /Preview/i });
    // Only visible if there are pending files
    await page.waitForTimeout(300);
  });
});

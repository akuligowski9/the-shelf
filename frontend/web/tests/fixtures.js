import { test as base } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

// Extended test fixture that tracks and cleans up entries
export const test = base.extend({
  // Track entry IDs before test runs
  entryCleanup: async ({ request }, use) => {
    // Get existing entry IDs before test
    const beforeResponse = await request.get(`${API_BASE}/entries/today`);
    const beforeData = await beforeResponse.json();
    const existingIds = new Set((beforeData.entries || []).map(e => e.id));

    // Run the test
    await use(null);

    // After test: find and delete any new entries
    const afterResponse = await request.get(`${API_BASE}/entries/today`);
    const afterData = await afterResponse.json();
    const newEntries = (afterData.entries || []).filter(e => !existingIds.has(e.id));

    // Delete new entries created during test
    for (const entry of newEntries) {
      await request.delete(`${API_BASE}/entries/${entry.id}`);
    }
  },
});

export { expect } from '@playwright/test';

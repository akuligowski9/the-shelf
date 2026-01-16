import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

test.describe('API Date Validation', () => {
  test.describe('Entries API', () => {
    test('should reject invalid date range (from > to)', async ({ request }) => {
      const response = await request.get(`${API_BASE}/entries`, {
        params: {
          from: '2026-01-15',
          to: '2026-01-10'
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.ok).toBe(false);
      expect(body.error).toContain('from date must be before or equal to to date');
    });

    test('should accept valid date range (from <= to)', async ({ request }) => {
      const response = await request.get(`${API_BASE}/entries`, {
        params: {
          from: '2026-01-10',
          to: '2026-01-15'
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.ok).toBe(true);
      expect(body.entries).toBeDefined();
    });

    test('should accept same date for from and to', async ({ request }) => {
      const response = await request.get(`${API_BASE}/entries`, {
        params: {
          from: '2026-01-15',
          to: '2026-01-15'
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.ok).toBe(true);
    });
  });

  test.describe('Reflections API - GET', () => {
    test('should reject invalid date range (from > to)', async ({ request }) => {
      const response = await request.get(`${API_BASE}/reflections`, {
        params: {
          from: '2026-01-15',
          to: '2026-01-10'
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.ok).toBe(false);
      expect(body.error).toContain('from date must be before or equal to to date');
    });

    test('should accept valid date range', async ({ request }) => {
      const response = await request.get(`${API_BASE}/reflections`, {
        params: {
          from: '2026-01-10',
          to: '2026-01-15'
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.ok).toBe(true);
    });
  });

  test.describe('Reflections API - POST', () => {
    test('should reject invalid period (period_start > period_end)', async ({ request }) => {
      const response = await request.post(`${API_BASE}/reflections`, {
        data: {
          type: 'weekly',
          period_start: '2026-01-15',
          period_end: '2026-01-10',
          note: 'Test reflection'
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.ok).toBe(false);
      expect(body.error).toContain('period_start must be before or equal to period_end');
    });

    test('should accept valid period (period_start <= period_end)', async ({ request }) => {
      const response = await request.post(`${API_BASE}/reflections`, {
        data: {
          type: 'weekly',
          period_start: '2026-01-10',
          period_end: '2026-01-15',
          note: 'Test reflection for validation'
        }
      });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.ok).toBe(true);
      expect(body.reflection).toBeDefined();

      // Clean up - delete the test reflection
      if (body.reflection?.id) {
        await request.delete(`${API_BASE}/reflections/${body.reflection.id}`);
      }
    });

    test('should accept same date for period_start and period_end', async ({ request }) => {
      const response = await request.post(`${API_BASE}/reflections`, {
        data: {
          type: 'day',
          period_start: '2026-01-15',
          period_end: '2026-01-15',
          note: 'Single day reflection test'
        }
      });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.ok).toBe(true);

      // Clean up
      if (body.reflection?.id) {
        await request.delete(`${API_BASE}/reflections/${body.reflection.id}`);
      }
    });
  });
});

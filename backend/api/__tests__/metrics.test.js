const request = require('supertest');
const app = require('../app');

// Mock the database pool
jest.mock('../db/pool', () => ({
  query: jest.fn(),
}));

const pool = require('../db/pool');

describe('Metrics endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /metrics/range', () => {
    it('returns 400 when start is missing', async () => {
      const response = await request(app).get('/metrics/range?end=2024-06-30');
      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('start');
    });

    it('returns 400 when end is missing', async () => {
      const response = await request(app).get('/metrics/range?start=2024-06-01');
      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toContain('end');
    });

    it('returns metrics for valid date range', async () => {
      // Mock all the database queries that getMetricsForRange makes
      pool.query
        // habits query
        .mockResolvedValueOnce({
          rows: [
            { id: 1, name: 'Reading', color: 'forest', target_minutes: 60 },
            { id: 2, name: 'Exercise', color: 'coral', target_minutes: 30 },
          ]
        })
        // minutes per habit
        .mockResolvedValueOnce({
          rows: [
            { habit_id: 1, minutes: 120 },
            { habit_id: 2, minutes: 45 },
          ]
        })
        // days touched per habit
        .mockResolvedValueOnce({
          rows: [
            { habit_id: 1, days_touched: 3 },
            { habit_id: 2, days_touched: 2 },
          ]
        })
        // sessions per habit
        .mockResolvedValueOnce({
          rows: [
            { habit_id: 1, sessions: 4 },
            { habit_id: 2, sessions: 2 },
          ]
        })
        // highlights
        .mockResolvedValueOnce({
          rows: [{ type: 'habit', count: 1 }]
        })
        // life/caution
        .mockResolvedValueOnce({
          rows: [
            { type: 'life', count: 2, minutes: 30 },
          ]
        })
        // daily breakdown
        .mockResolvedValueOnce({
          rows: [
            { date: new Date('2024-06-15'), habit_id: 1, type: 'habit', minutes: 60, entries: 2 },
            { date: new Date('2024-06-16'), habit_id: 2, type: 'habit', minutes: 45, entries: 2 },
          ]
        })
        // rest days
        .mockResolvedValueOnce({
          rows: [{ rest_days: 1 }]
        });

      const response = await request(app).get('/metrics/range?start=2024-06-01&end=2024-06-30');

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.metrics).toBeDefined();
      expect(response.body.metrics.habits).toHaveLength(2);
      expect(response.body.metrics.habits[0].name).toBe('Reading');
      expect(response.body.metrics.habits[0].minutes).toBe(120);
      expect(response.body.metrics.totals.minutes).toBe(165); // 120 + 45
      expect(response.body.metrics.totals.sessions).toBe(6); // 4 + 2
    });
  });

  describe('GET /metrics/weekly', () => {
    it('returns 400 when start is missing', async () => {
      const response = await request(app).get('/metrics/weekly');
      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });

    it('returns weekly metrics for valid start date', async () => {
      // Mock the same queries as range
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // habits
        .mockResolvedValueOnce({ rows: [] }) // minutes
        .mockResolvedValueOnce({ rows: [] }) // days touched
        .mockResolvedValueOnce({ rows: [] }) // sessions
        .mockResolvedValueOnce({ rows: [] }) // highlights
        .mockResolvedValueOnce({ rows: [] }) // life/caution
        .mockResolvedValueOnce({ rows: [] }) // daily
        .mockResolvedValueOnce({ rows: [{ rest_days: 0 }] }); // rest days

      const response = await request(app).get('/metrics/weekly?start=2024-06-01');

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.metrics).toBeDefined();
      expect(response.body.metrics.start_date).toBe('2024-06-01');
      expect(response.body.metrics.end_date).toBe('2024-06-08'); // 7 days later
    });
  });
});

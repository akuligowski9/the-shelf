const request = require('supertest');
const app = require('../app');

// Mock the database pool
jest.mock('../db/pool', () => ({
  query: jest.fn(),
}));

const pool = require('../db/pool');

describe('Closures endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /closures (single day)', () => {
    it('returns a closure for a given date', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          scope: 'day',
          occurred_at: '2026-02-04T12:00:00.000Z',
          note: 'Good day',
          created_at: new Date(),
          updated_at: new Date(),
        }],
      });

      const response = await request(app)
        .get('/closures?scope=day&date=2026-02-04');

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.closure).toBeDefined();
      expect(response.body.closure.note).toBe('Good day');
    });

    it('uses EST-aware date boundaries in the query', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await request(app).get('/closures?scope=day&date=2026-02-04');

      const sql = pool.query.mock.calls[0][0];
      expect(sql).toContain("AT TIME ZONE 'America/New_York'");
    });

    it('returns null when no closure exists for the date', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/closures?scope=day&date=2026-02-04');

      expect(response.status).toBe(200);
      expect(response.body.closure).toBeNull();
    });

    it('returns 400 when scope is missing', async () => {
      const response = await request(app).get('/closures?date=2026-02-04');
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('scope');
    });

    it('returns 400 when scope is invalid', async () => {
      const response = await request(app).get('/closures?scope=invalid&date=2026-02-04');
      expect(response.status).toBe(400);
    });

    it('returns 400 when date is missing', async () => {
      const response = await request(app).get('/closures?scope=day');
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('date');
    });
  });

  describe('GET /closures (range query)', () => {
    it('returns closures for a date range', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          { id: 1, scope: 'day', occurred_at: '2026-02-04T12:00:00.000Z', note: 'Day 1' },
          { id: 2, scope: 'day', occurred_at: '2026-02-05T12:00:00.000Z', note: 'Day 2' },
        ],
      });

      const response = await request(app)
        .get('/closures?scope=day&from=2026-02-04&to=2026-02-05');

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.closures).toHaveLength(2);
    });

    it('uses EST-aware date boundaries in range query', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await request(app).get('/closures?scope=day&from=2026-02-04&to=2026-02-05');

      const sql = pool.query.mock.calls[0][0];
      expect(sql).toContain("AT TIME ZONE 'America/New_York'");
    });
  });

  describe('PUT /closures (upsert)', () => {
    it('inserts a new closure when none exists for the date', async () => {
      // First query: check for existing
      pool.query.mockResolvedValueOnce({ rows: [] });
      // Second query: insert
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 10,
          scope: 'day',
          occurred_at: '2026-02-04T12:00:00.000Z',
          note: 'End of day',
        }],
      });

      const response = await request(app)
        .put('/closures')
        .send({
          scope: 'day',
          occurred_at: '2026-02-04T12:00:00',
          note: 'End of day',
        });

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.closure.note).toBe('End of day');
    });

    it('updates an existing closure for the same date', async () => {
      // First query: check for existing
      pool.query.mockResolvedValueOnce({ rows: [{ id: 10 }] });
      // Second query: update
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 10,
          scope: 'day',
          occurred_at: '2026-02-04T12:00:00.000Z',
          note: 'Updated note',
        }],
      });

      const response = await request(app)
        .put('/closures')
        .send({
          scope: 'day',
          occurred_at: '2026-02-04T12:00:00',
          note: 'Updated note',
        });

      expect(response.status).toBe(200);
      expect(response.body.closure.note).toBe('Updated note');
    });

    it('uses EST-aware boundaries for upsert duplicate check', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await request(app)
        .put('/closures')
        .send({
          scope: 'day',
          occurred_at: '2026-02-04T12:00:00',
          note: 'test',
        });

      const existCheckSql = pool.query.mock.calls[0][0];
      expect(existCheckSql).toContain("AT TIME ZONE 'America/New_York'");
    });

    it('returns 400 when scope is missing', async () => {
      const response = await request(app)
        .put('/closures')
        .send({ occurred_at: '2026-02-04T12:00:00' });

      expect(response.status).toBe(400);
    });

    it('returns 400 when occurred_at is missing', async () => {
      const response = await request(app)
        .put('/closures')
        .send({ scope: 'day' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('occurred_at');
    });
  });
});

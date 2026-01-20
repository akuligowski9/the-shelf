const request = require('supertest');
const app = require('../app');

// Mock the database pool
jest.mock('../db/pool', () => ({
  query: jest.fn(),
}));

const pool = require('../db/pool');

describe('Entries endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /entries', () => {
    it('returns entries for a date range', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            type: 'habit',
            habit_id: 1,
            habit: 'Reading',
            duration_minutes: 30,
            note: 'Good session',
            occurred_at: new Date('2024-06-15T10:00:00Z'),
            is_highlight: false,
            archived_at: null,
          },
          {
            id: 2,
            type: 'life',
            habit_id: null,
            habit: null,
            duration_minutes: 15,
            note: 'Walk in park',
            occurred_at: new Date('2024-06-15T14:00:00Z'),
            is_highlight: true,
            archived_at: null,
          },
        ]
      });

      const response = await request(app)
        .get('/entries?from=2024-06-01&to=2024-06-30');

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.entries).toHaveLength(2);
      expect(response.body.entries[0].type).toBe('habit');
      expect(response.body.entries[1].is_highlight).toBe(true);
    });

    it('returns 400 when from is missing', async () => {
      const response = await request(app).get('/entries?to=2024-06-30');
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('from');
    });

    it('returns 400 when to is missing', async () => {
      const response = await request(app).get('/entries?from=2024-06-01');
      expect(response.status).toBe(400);
    });

    it('returns 400 when from is after to', async () => {
      const response = await request(app).get('/entries?from=2024-06-30&to=2024-06-01');
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('before');
    });
  });

  describe('POST /entries', () => {
    it('creates a new habit entry', async () => {
      const newEntry = {
        type: 'habit',
        habit_id: 1,
        duration_minutes: 45,
        note: 'Great workout',
        occurred_at: '2024-06-15T10:00:00Z',
      };

      // First query: INSERT
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 100,
          ...newEntry,
          is_highlight: false,
          archived_at: null,
          created_at: new Date(),
        }]
      });

      // Second query: SELECT with joins
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 100,
          ...newEntry,
          habit: 'Exercise',
          habit_color: 'coral',
          practice: null,
          target: null,
          is_highlight: false,
          archived_at: null,
        }]
      });

      const response = await request(app)
        .post('/entries')
        .send(newEntry);

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.entry.id).toBe(100);
      expect(response.body.entry.note).toBe('Great workout');
    });

    it('creates a life entry without habit_id', async () => {
      const newEntry = {
        type: 'life',
        duration_minutes: 30,
        note: 'Family time',
      };

      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 101, ...newEntry }] })
        .mockResolvedValueOnce({ rows: [{ id: 101, ...newEntry, habit: null }] });

      const response = await request(app)
        .post('/entries')
        .send(newEntry);

      expect(response.status).toBe(201);
      expect(response.body.entry.type).toBe('life');
    });

    it('returns 400 for invalid entry type', async () => {
      const response = await request(app)
        .post('/entries')
        .send({
          type: 'invalid',
          duration_minutes: 30,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('type');
    });

    it('returns 400 when habit entry missing habit_id', async () => {
      const response = await request(app)
        .post('/entries')
        .send({
          type: 'habit',
          duration_minutes: 30,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('habit_id');
    });

    it('returns 400 when non-habit entry has habit_id', async () => {
      const response = await request(app)
        .post('/entries')
        .send({
          type: 'life',
          habit_id: 1,
          duration_minutes: 30,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /entries/:id', () => {
    it('updates an existing entry', async () => {
      // First query: UPDATE
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          type: 'habit',
          habit_id: 1,
          duration_minutes: 60,
          note: 'Updated note',
          is_highlight: true,
        }]
      });

      // Second query: SELECT with joins
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          type: 'habit',
          habit_id: 1,
          habit: 'Reading',
          duration_minutes: 60,
          note: 'Updated note',
          is_highlight: true,
        }]
      });

      const response = await request(app)
        .put('/entries/1')
        .send({
          duration_minutes: 60,
          note: 'Updated note',
          is_highlight: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.entry.duration_minutes).toBe(60);
      expect(response.body.entry.is_highlight).toBe(true);
    });

    it('returns 404 for non-existent entry', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put('/entries/999')
        .send({ note: 'Updated' });

      expect(response.status).toBe(404);
    });

    it('returns 400 when no fields provided', async () => {
      const response = await request(app)
        .put('/entries/1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('No fields');
    });

    it('returns 400 for invalid type', async () => {
      const response = await request(app)
        .put('/entries/1')
        .send({ type: 'invalid' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /entries/:id', () => {
    it('deletes an entry', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1 }]
      });

      const response = await request(app).delete('/entries/1');

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.deleted).toBe('1');
    });

    it('returns 404 for non-existent entry', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).delete('/entries/999');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /entries/today', () => {
    it('returns today entries', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          { id: 1, type: 'habit', note: 'Morning reading' },
        ]
      });

      const response = await request(app).get('/entries/today');

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.date).toBeDefined();
      expect(response.body.entries).toHaveLength(1);
    });
  });
});

const request = require('supertest');
const app = require('../app');

describe('Health endpoint', () => {
  it('GET /health returns ok: true', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});

// server/tests/api.test.js
// Back-end tests (Session 22): send requests to the app without a browser,
// without a port and without a database. Run with: npm test
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../app.js';

describe('protected routes: no token, no data', () => {
  it('rejects a request with no token (401)', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.status).toBe(401);
  });

  it('rejects a fake token (401)', async () => {
    const res = await request(app)
      .get('/api/rooms')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/register: input validation', () => {
  it('rejects an empty body (400)', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });

  it('rejects a password shorter than 8 characters (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', email: 'alice@test.dev', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Password must be at least 8 characters');
  });
});

describe('POST /api/auth/login: input validation', () => {
  it('rejects an invalid email (400)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'whatever' });
    expect(res.status).toBe(400);
  });
});

describe('everything else', () => {
  it('answers JSON 404 for an unknown route', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });
});

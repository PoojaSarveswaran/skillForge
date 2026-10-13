require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

const testEmail = `jest-test-${Date.now()}@skillforge.ai`;
let token;
let userId;

afterAll(async () => {
  if (userId) {
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
  }
  await db.end();
});

describe('Auth', () => {
  test('rejects registration with an invalid email and weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: '123', display_name: 'X' });
    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty('email');
    expect(res.body.fields).toHaveProperty('password');
  });

  test('registers a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: 'TestPass123!', display_name: 'Jest Tester' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    token = res.body.token;
    userId = res.body.user.id;
  });

  test('rejects a duplicate registration with 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: 'TestPass123!', display_name: 'Jest Tester' });
    expect(res.status).toBe(409);
  });

  test('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'WrongPassword!' });
    expect(res.status).toBe(401);
  });

  test('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'TestPass123!' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});

describe('Authentication gate', () => {
  test('rejects requests with no token', async () => {
    const res = await request(app).get('/api/skills');
    expect(res.status).toBe(401);
  });

  test('rejects requests with a malformed token', async () => {
    const res = await request(app).get('/api/skills').set('Authorization', 'Bearer garbage');
    expect(res.status).toBe(401);
  });
});

describe('Not-found handling', () => {
  test('unknown API route returns 404', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('unknown career role id returns 404', async () => {
    const res = await request(app).get('/api/roles/999999').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe('Skills CRUD (persisted to MySQL)', () => {
  let skillId;

  test('creates a skill', async () => {
    const res = await request(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({ skill_name: 'Python', category: 'AI/ML', proficiency: 2 });
    expect(res.status).toBe(201);
    expect(res.body.skill.skill_name).toBe('Python');
    skillId = res.body.skill.id;
  });

  test('rejects an invalid proficiency value', async () => {
    const res = await request(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({ skill_name: 'Rust', category: 'Backend', proficiency: 10 });
    expect(res.status).toBe(400);
  });

  test('rejects a duplicate skill name for the same user', async () => {
    const res = await request(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({ skill_name: 'Python', category: 'AI/ML', proficiency: 3 });
    expect(res.status).toBe(409);
  });

  test('lists the created skill', async () => {
    const res = await request(app).get('/api/skills').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.skills.some((s) => s.id === skillId)).toBe(true);
  });

  test('updates the skill proficiency', async () => {
    const res = await request(app)
      .put(`/api/skills/${skillId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ proficiency: 3 });
    expect(res.status).toBe(200);
    expect(res.body.skill.proficiency).toBe(3);
  });

  test('deletes the skill', async () => {
    const res = await request(app).delete(`/api/skills/${skillId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  test('404s when fetching a deleted/unowned skill', async () => {
    const res = await request(app)
      .put(`/api/skills/${skillId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ proficiency: 1 });
    expect(res.status).toBe(404);
  });
});

describe('Roles and analysis (reads live seed data)', () => {
  test('lists seeded career roles', async () => {
    const res = await request(app).get('/api/roles').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.roles.length).toBeGreaterThanOrEqual(6);
  });

  test('analysis for a role with no user skills returns full gaps', async () => {
    const rolesRes = await request(app).get('/api/roles').set('Authorization', `Bearer ${token}`);
    const role = rolesRes.body.roles.find((r) => r.slug === 'frontend-developer');
    const res = await request(app).get(`/api/analysis/${role.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.overall_score).toBe(0);
    expect(res.body.skills.length).toBeGreaterThan(0);
  });
});

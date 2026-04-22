const request = require('supertest');
const app = require('../index');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const User = require('../src/models/User');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Auth Contract Tests (SRS Traceability)', () => {
  const testUser = {
    name: 'Contract Test',
    email: 'contract@college.edu',
    password: 'Password124'
  };

  test('FR-AUTH-01: User Signup with valid data', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe(testUser.email);
  });

  test('FR-AUTH-01: User Signup fails with short password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...testUser, password: 'short' });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].message).toMatch(/password/i);
  });

  test('FR-AUTH-03: User Signup fails with duplicate email (HTTP 409)', async () => {
    // First signup
    await request(app).post('/api/auth/signup').send(testUser);

    // Duplicate signup
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('FR-AUTH-04: User Login with correct credentials updates lastLoginAt', async () => {
    // Signup first
    await request(app).post('/api/auth/signup').send(testUser);
    
    // VERIFY FIRST (SRS FR-AUTH-03 requirement)
    const userToVerify = await User.findOne({ email: testUser.email });
    userToVerify.isEmailVerified = true;
    await userToVerify.save();

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');

    const user = await User.findOne({ email: testUser.email });
    expect(user.lastLoginAt).not.toBeNull();
  });

  test('NFR-SEC-05: Rate limiting is applied (Simple reach check)', async () => {
    const res = await request(app).get('/api');
    // Global rate limit should return headers
    expect(res.headers).toHaveProperty('ratelimit-limit');
  });
});

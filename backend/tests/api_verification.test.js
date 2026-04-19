const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../src/models/User');

describe('COA Phase 4 Verification Tests', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Connect to DB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    // Clean up test user
    await User.deleteMany({ email: 'test_verify@example.com' });
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'test_verify@example.com' });
    await mongoose.connection.close();
  });

  test('Auth: Signup a new student', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test Verify',
        email: 'test_verify@example.com',
        password: 'Password123!',
        role: 'student'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
    userId = res.body._id;
  });

  test('Auth: Login the new student', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test_verify@example.com',
        password: 'Password123!'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  test('User: Complete Onboarding', async () => {
    const res = await request(app)
      .put('/api/user/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({
        branch: 'CSE',
        currentYear: 3,
        interests: ['Development', 'AI']
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.onboardingComplete).toBe(true);
  });

  test('Feed: Get Feed Sections', async () => {
    const res = await request(app)
      .get('/api/feed/sections')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('recommended');
    expect(res.body).toHaveProperty('closingSoon');
  });

  test('Activity: Save a listing', async () => {
    // Get a listing ID from the feed first
    const feedRes = await request(app)
      .get('/api/feed/sections')
      .set('Authorization', `Bearer ${token}`);
    
    const listingId = feedRes.body.recommended[0]?._id;
    
    if (listingId) {
      const res = await request(app)
        .post('/api/activity')
        .set('Authorization', `Bearer ${token}`)
        .send({
          listingId,
          status: 'saved'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe('saved');
    }
  });
});

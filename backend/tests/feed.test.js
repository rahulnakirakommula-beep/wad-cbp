const request = require('supertest');
const app = require('../index');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const { createTestUser } = require('./helpers');
const Listing = require('../src/models/Listing');
const UserActivity = require('../src/models/UserActivity');
const Source = require('../src/models/Source');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Feed Recommendation & Exclusion Tests (FR-FEED)', () => {
  let user, token, source;

  beforeEach(async () => {
    const root = await createTestUser();
    user = root.user;
    token = root.token;

    source = await Source.create({
      name: 'Test Source',
      sourceType: 'company',
      verificationLevel: 'official',
      isActive: true
    });

    // Update user interests for matching
    user.interests = ['javascript', 'web'];
    await user.save();
  });

  test('FR-FEED-05: High priority listings score higher', async () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 10);

    await Listing.create([
      {
        orgName: 'High Pri',
        title: 'Priority Job',
        description: 'D',
        type: 'job',
        externalUrl: 'http://high.com',
        priority: 'high',
        status: 'open',
        sourceId: source._id,
        domainTags: ['javascript']
      },
      {
        orgName: 'Normal Pri',
        title: 'Normal Job',
        description: 'D',
        type: 'job',
        externalUrl: 'http://normal.com',
        priority: 'normal',
        status: 'open',
        sourceId: source._id,
        domainTags: ['javascript']
      }
    ]);

    const res = await request(app)
      .get('/api/feed/recommendations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    // The higher priority one should be first in the score-sorted list
    expect(res.body[0].title).toBe('Priority Job');
  });

  test('FR-FEED-03: Ignored listings are excluded from Don\'t Miss feed', async () => {
    const listing = await Listing.create({
      orgName: 'Ignore Me',
      title: 'Ignored Job',
      description: 'D',
      type: 'job',
      externalUrl: 'http://ignore.com',
      priority: 'dont-miss',
      status: 'open',
      sourceId: source._id,
      domainTags: ['javascript']
    });

    // Mark as ignored
    await UserActivity.create({
      userId: user._id,
      listingId: listing._id,
      status: 'ignored'
    });

    const res = await request(app)
      .get('/api/feed/dont-miss')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    const ignoredFound = res.body.find(l => l._id.toString() === listing._id.toString());
    expect(ignoredFound).toBeUndefined();
  });
});

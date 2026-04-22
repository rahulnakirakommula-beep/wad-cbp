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

describe('Activity Management Tests (FR-ACT)', () => {
  let user, token, source, listing;

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
    listing = await Listing.create({ 
      orgName: 'O', 
      title: 'T', 
      description: 'D', 
      type: 'job', 
      externalUrl: 'http://h.com', 
      sourceId: source._id 
    });
  });

  test('FR-ACT-04: User can delete an activity (if not missed)', async () => {
    await UserActivity.create({
      userId: user._id, listingId: listing._id, status: 'interested'
    });

    const res = await request(app)
      .delete(`/api/activity/${listing._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    const activity = await UserActivity.findOne({ userId: user._id, listingId: listing._id });
    expect(activity).toBeNull();
  });

  test('FR-ACT-04: User CANNOT delete a missed activity', async () => {
    await UserActivity.create({
      userId: user._id, listingId: listing._id, status: 'missed'
    });

    const res = await request(app)
      .delete(`/api/activity/${listing._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/cannot delete missed activity/i);
  });
});

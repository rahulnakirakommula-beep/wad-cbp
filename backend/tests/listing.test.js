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

describe('Listing Metadata & Access Tests (FR-LST & FR-ACT)', () => {
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
  });

  test('FR-LST-07: confidenceLevel virtual works correctly', async () => {
    const curated = await Listing.create({
      orgName: 'C', title: 'Curated', description: 'D', type: 'job', externalUrl: 'http://h.com', isCurated: true, sourceId: source._id
    });
    
    // Within 1 year (assuming 2026)
    const historical = await Listing.create({
      orgName: 'H', title: 'Hist', description: 'D', type: 'job', externalUrl: 'http://h.com', isCurated: false, sourceId: source._id,
      timeline: { lastDeadline: new Date('2025-01-01') }
    });

    // Older than 1 year
    const older = await Listing.create({
      orgName: 'O', title: 'Older', description: 'D', type: 'job', externalUrl: 'http://h.com', isCurated: false, sourceId: source._id,
      timeline: { lastDeadline: new Date('2024-01-01') }
    });

    const approximate = await Listing.create({
      orgName: 'A', title: 'Approx', description: 'D', type: 'job', externalUrl: 'http://h.com', isCurated: false, sourceId: source._id
    });

    expect(curated.confidenceLevel).toBe('Confirmed');
    expect(historical.confidenceLevel).toBe('Based on 2025 Data');
    expect(historical.dataSourceYear).toBe(2025);
    expect(older.confidenceLevel).toBe('Approximate — 2024 Data');
    expect(approximate.confidenceLevel).toBe('Approximate');
  });

  test('FR-ACT-05: Access to closed listing denied without prior interaction', async () => {
    const listing = await Listing.create({
      orgName: 'Closed', title: 'Closed Job', description: 'D', type: 'job', externalUrl: 'http://h.com', status: 'closed', sourceId: source._id
    });

    const res = await request(app)
      .get(`/api/listings/${listing._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/prior interaction/i);
  });

  test('FR-ACT-05: Access to closed listing allowed WITH prior interaction', async () => {
    const listing = await Listing.create({
      orgName: 'Closed', title: 'Closed Job', description: 'D', type: 'job', externalUrl: 'http://h.com', status: 'closed', sourceId: source._id
    });

    // Create activity record
    await UserActivity.create({
      userId: user._id,
      listingId: listing._id,
      status: 'applied'
    });

    const res = await request(app)
      .get(`/api/listings/${listing._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Closed Job');
  });
});

const request = require('supertest');
const app = require('../index');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const { createTestUser } = require('./helpers');
const Listing = require('../src/models/Listing');
const Source = require('../src/models/Source');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Admin Management Contract Tests (FR-ADM)', () => {
  let admin, token, source;

  beforeEach(async () => {
    const root = await createTestUser('admin');
    admin = root.user;
    token = root.token;

    source = await Source.create({ 
      name: 'Test Source', 
      sourceType: 'company', 
      verificationLevel: 'official',
      isActive: true 
    });
  });

  test('FR-ADM-SRC-03: Deactivate a source', async () => {
    const res = await request(app)
      .put(`/api/admin/sources/${source._id}/deactivate`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    const updatedSource = await Source.findById(source._id);
    expect(updatedSource.isActive).toBe(false);
  });

  test('FR-ADM-STL-02: Quick verify listing (reset staleness)', async () => {
    const listing = await Listing.create({
      orgName: 'O', 
      title: 'T', 
      description: 'D',
      type: 'job', 
      externalUrl: 'http://h.com', 
      sourceId: source._id, 
      isStale: true, 
      lastVerifiedAt: new Date('2023-01-01')
    });

    const res = await request(app)
      .post(`/api/admin/listings/${listing._id}/verify`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.isStale).toBe(false);
    expect(new Date(res.body.lastVerifiedAt).getTime()).toBeGreaterThan(new Date('2023-12-31').getTime());
  });

  test('FR-ADM-CUR-06: Cycle reset allows only closed/recurring listings', async () => {
    const closedRecurring = await Listing.create({
      orgName: 'O1', 
      title: 'T1', 
      description: 'D1',
      type: 'job', 
      externalUrl: 'http://h1.com', 
      sourceId: source._id, 
      status: 'closed', 
      timeline: { scheduleType: 'recurring-annual' }
    });

    const openFixed = await Listing.create({
      orgName: 'O2', 
      title: 'T2', 
      description: 'D2',
      type: 'job', 
      externalUrl: 'http://h2.com', 
      sourceId: source._id, 
      status: 'open', 
      timeline: { scheduleType: 'fixed' }
    });

    // Valid case
    const res1 = await request(app)
      .post(`/api/admin/listings/${closedRecurring._id}/cycle-reset`)
      .set('Authorization', `Bearer ${token}`);
    expect(res1.statusCode).toBe(200);

    // Invalid case
    const res2 = await request(app)
      .post(`/api/admin/listings/${openFixed._id}/cycle-reset`)
      .set('Authorization', `Bearer ${token}`);
    expect(res2.statusCode).toBe(400);
    expect(res2.body.message).toMatch(/only closed recurring/i);
  });
});

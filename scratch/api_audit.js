const axios = require('axios');
const baseUrl = 'http://localhost:5000/api';

async function test() {
  console.log('--- API AUDIT START ---');
  try {
    // 1. Auth: Signup
    console.log('[Auth] Attempting signup...');
    const signupData = {
      name: 'Swarm Test User',
      email: 'swarm_' + Date.now() + '@example.com',
      password: 'Password123!'
    };
    const signup = await axios.post(`${baseUrl}/auth/signup`, signupData);
    console.log('[Auth] Signup Success. User ID:', signup.data._id);
    const token = signup.data.token;

    // 2. Feed: Get Sections
    console.log('[Feed] Fetching sections...');
    const feed = await axios.get(`${baseUrl}/feed/sections`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Feed] Sections fetched:', Object.keys(feed.data).join(', '));

    // 3. Listings: Explore
    console.log('[Listings] Fetching explore feed...');
    const explore = await axios.get(`${baseUrl}/feed/browse`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Listings] Explore items found:', explore.data.listings.length);

    // 4. Security: Unauthorized Access
    console.log('[Security] Testing unauthorized access to /admin...');
    try {
      await axios.get(`${baseUrl}/admin/listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('[Security] WARNING: Student accessed /admin!');
    } catch (e) {
      console.log('[Security] Admin access blocked as expected:', e.response?.status);
    }

    // 5. Performance: Timings
    const start = Date.now();
    await axios.get(`${baseUrl}/feed/sections`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Performance] Feed section response time:', Date.now() - start, 'ms');

    console.log('--- API AUDIT COMPLETE ---');
  } catch (error) {
    console.error('[Error] Audit failed:', error.response?.data || error.message);
  }
}

test();

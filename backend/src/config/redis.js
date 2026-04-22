const Redis = require('ioredis');

let redis;

if (process.env.NODE_ENV !== 'test') {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL);
    
    redis.on('connect', () => console.log('Redis connected successfully'));
    redis.on('error', (err) => console.error('Redis connection error:', err));
  } else {
    console.warn('REDIS_URL not found. Caching will be disabled.');
  }
}

/**
 * Cache recommendations for a user
 */
const cacheRecommendations = async (userId, data) => {
  if (!redis) return;
  try {
    const key = `recommendations:user:${userId}`;
    await redis.set(key, JSON.stringify(data), 'EX', 3600); // 1 hour expiry
  } catch (err) {
    console.error('Redis Cache Error:', err);
  }
};

/**
 * Get cached recommendations
 */
const getCachedRecommendations = async (userId) => {
  if (!redis) return null;
  try {
    const key = `recommendations:user:${userId}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.error('Redis Fetch Error:', err);
    return null;
  }
};

/**
 * Invalidate cache for a user
 */
const invalidateFeedCache = async (userId) => {
  if (!redis) return;
  try {
    await redis.del(`recommendations:user:${userId}`);
  } catch (err) {
    console.error('Redis Invalidation Error:', err);
  }
};

module.exports = {
  redis,
  cacheRecommendations,
  getCachedRecommendations,
  invalidateFeedCache
};

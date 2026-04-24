const rateLimit = require('express-rate-limit');

/**
 * PRODUCTION HARDENING: Rate limiters are RE-ENABLED.
 * Security Note: These help prevent brute-force attacks and DOS.
 */

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for QA
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500, // Increased for QA
  message: {
    status: 429,
    message: 'Too many authentication attempts, please try again in an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter
};

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyEmail, getMe } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { validate, signupSchema, loginSchema } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', authLimiter, validate(signupSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.get('/verify', verifyEmail);
router.get('/verify/:token', verifyEmail);
router.get('/me', protect, getMe);

module.exports = router;

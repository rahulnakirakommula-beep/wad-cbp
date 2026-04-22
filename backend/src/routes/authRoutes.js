const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyEmail } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { validate, signupSchema, loginSchema } = require('../middleware/validationMiddleware');

router.post('/signup', authLimiter, validate(signupSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.get('/verify/:token', verifyEmail);

module.exports = router;

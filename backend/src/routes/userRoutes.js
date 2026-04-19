const express = require('express');
const router = express.Router();
const { completeOnboarding, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.put('/onboarding', protect, completeOnboarding);

module.exports = router;

const express = require('express');
const router = express.Router();
const { completeOnboarding, getUserProfile, updatePreferences, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updatePreferences);
router.put('/onboarding', protect, completeOnboarding);
router.put('/preferences', protect, updatePreferences);
router.put('/password', protect, changePassword);

module.exports = router;

const express = require('express');
const router = express.Router();
const { upsertActivity, updateActivity, getActivitySummary, getActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getActivities)
    .post(protect, upsertActivity);

router.get('/summary', protect, getActivitySummary);
router.put('/:listingId', protect, updateActivity);

module.exports = router;

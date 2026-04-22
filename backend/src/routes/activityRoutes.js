const express = require('express');
const router = express.Router();
const { upsertActivity, updateActivity, getActivitySummary, getActivities, deleteActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getActivities)
    .post(protect, upsertActivity);

router.get('/summary', protect, getActivitySummary);
router.route('/:listingId')
    .put(protect, updateActivity)
    .delete(protect, deleteActivity);

module.exports = router;

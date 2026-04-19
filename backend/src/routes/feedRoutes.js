const express = require('express');
const router = express.Router();
const { getFeedSections, browseListings } = require('../controllers/feedController');
const { protect } = require('../middleware/authMiddleware');

router.get('/sections', protect, getFeedSections);
router.get('/browse', protect, browseListings);

module.exports = router;

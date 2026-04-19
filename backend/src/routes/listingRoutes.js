const express = require('express');
const router = express.Router();
const { getListing, getCalendarListings, getExploreListings, flagListing } = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/explore', protect, getExploreListings);
router.get('/calendar', protect, getCalendarListings);
router.get('/:id', protect, getListing);
router.post('/:id/flag', protect, flagListing);

module.exports = router;

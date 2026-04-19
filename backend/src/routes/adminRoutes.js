const express = require('express');
const router = express.Router();
const { getAdminListings, createListing, updateListing, resetListingCycle, getAdminStats, getSources, verifySource, getFlags, reviewFlag } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes in here require admin check
router.use(protect, admin);

router.get('/stats', getAdminStats);

// Listings
router.get('/listings', getAdminListings);
router.post('/listings', createListing);
router.put('/listings/:id', updateListing);
router.post('/listings/:id/cycle-reset', resetListingCycle);

// Sources
router.get('/sources', getSources);
router.put('/sources/:id/verify', verifySource);

// Flags
router.get('/flags', getFlags);
router.put('/flags/:id', reviewFlag);

module.exports = router;

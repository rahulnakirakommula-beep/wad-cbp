const express = require('express');
const router = express.Router();
const { 
  getAdminListings, 
  createListing, 
  updateListing, 
  resetListingCycle, 
  verifyListingStaleness,
  getAdminStats, 
  getSources, 
  verifySource, 
  deactivateSource,
  getFlags, 
  reviewFlag,
  getAdminTags,
  createTag,
  updateTag,
  getAdminGuides,
  createGuide,
  updateGuide,
  getAdminUsers,
  updateUserStatus,
  getAuditLogs
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes in here require admin check
router.use(protect, admin);

router.get('/stats', getAdminStats);

// Listings
router.get('/listings', getAdminListings);
router.post('/listings', createListing);
router.put('/listings/:id', updateListing);
router.post('/listings/:id/verify', verifyListingStaleness);
router.post('/listings/:id/cycle-reset', resetListingCycle);

// Sources
router.get('/sources', getSources);
router.put('/sources/:id/verify', verifySource);
router.put('/sources/:id/deactivate', deactivateSource);

// Tags
router.get('/tags', getAdminTags);
router.post('/tags', createTag);
router.put('/tags/:id', updateTag);

// Guides
router.get('/guides', getAdminGuides);
router.post('/guides', createGuide);
router.put('/guides/:id', updateGuide);

// Users
router.get('/users', getAdminUsers);
router.put('/users/:id/status', updateUserStatus);

// Audit
router.get('/audit', getAuditLogs);

// Flags
router.get('/flags', getFlags);
router.put('/flags/:id', reviewFlag);

module.exports = router;

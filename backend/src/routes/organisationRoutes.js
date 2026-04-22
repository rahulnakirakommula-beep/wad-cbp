const express = require('express');
const router = express.Router();
const { 
  getMyListings, 
  createMyListing, 
  updateMyListing, 
  getOrgStats 
} = require('../controllers/organisationController');
const { protect, source } = require('../middleware/authMiddleware');

// All routes in here require source/admin check
router.use(protect, source);

router.get('/stats', getOrgStats);
router.get('/listings', getMyListings);
router.post('/listings', createMyListing);
router.put('/listings/:id', updateMyListing);

module.exports = router;

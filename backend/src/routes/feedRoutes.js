const express = require('express');
const router = express.Router();
const { 
  getFeedSections, 
  browseListings, 
  getRecommendationsList, 
  getDontMissList 
} = require('../controllers/feedController');
const { protect } = require('../middleware/authMiddleware');

router.get('/sections', protect, getFeedSections);
router.get('/recommendations', protect, getRecommendationsList);
router.get('/dont-miss', protect, getDontMissList);
router.get('/browse', protect, browseListings);

module.exports = router;

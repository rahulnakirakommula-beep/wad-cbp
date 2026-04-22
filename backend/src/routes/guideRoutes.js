const express = require('express');
const router = express.Router();
const { getGuideById } = require('../controllers/guideController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:id', protect, getGuideById);

module.exports = router;

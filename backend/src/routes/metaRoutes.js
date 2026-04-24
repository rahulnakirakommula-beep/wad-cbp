const express = require('express');
const router = express.Router();
const { getTags } = require('../controllers/tagController');

// @desc    Get all branches
// @route   GET /api/meta/branches
// @access  Public
router.get('/branches', (req, res) => {
  const branches = ['CE', 'EEE', 'ME', 'ECE', 'CSE', 'EIE', 'IT', 'AE', 'CSBS', 'CS-AIML', 'CS-DS', 'CS-IOT', 'AI & DS', 'CS-CyS', 'ECE - VLSI', 'R&AI', 'Bio-Tech'];
  res.json(branches);
});

// @desc    Get all active tags
// @route   GET /api/meta/tags
// @access  Public
router.get('/tags', getTags);

module.exports = router;

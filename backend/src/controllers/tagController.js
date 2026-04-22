const asyncHandler = require('express-async-handler');
const DomainTag = require('../models/DomainTag');

// @desc    Get all active tags
// @route   GET /api/tags
// @access  Public
const getTags = asyncHandler(async (req, res) => {
  const { active } = req.query;
  const filter = {};
  
  if (active === 'true') {
    filter.isActive = true;
  }

  const tags = await DomainTag.find(filter).sort({ name: 1 });
  res.json(tags);
});

module.exports = {
  getTags
};

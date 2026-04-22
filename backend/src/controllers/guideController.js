const asyncHandler = require('express-async-handler');
const KnowledgeGuide = require('../models/KnowledgeGuide');
const Listing = require('../models/Listing');

// @desc    Get guide by ID for students
// @route   GET /api/guides/:id
// @access  Private
const getGuideById = asyncHandler(async (req, res) => {
  const guide = await KnowledgeGuide.findById(req.params.id);

  if (!guide) {
    res.status(404);
    throw new Error('Guide not found');
  }

  // Populate linked listings if any
  const listings = await Listing.find({ _id: { $in: guide.linkedListings } })
    .select('title orgName status type timeline.deadline');

  res.json({
    ...guide.toObject(),
    listings
  });
});

module.exports = {
  getGuideById
};

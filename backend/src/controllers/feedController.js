const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');
const UserActivity = require('../models/UserActivity');

// @desc    Get dashboard feed sections
// @route   GET /api/feed/sections
// @access  Private
const getFeedSections = asyncHandler(async (req, res) => {
  const user = req.user;
  const now = new Date();

  // 1. Get user activities to exclude (ignored, applied, saved) from certain sections
  const activities = await UserActivity.find({ userId: user._id });
  const excludedIds = activities.map(a => a.listingId.toString());

  // 2. Closing Soon (within 7 days, excluding user-interacted)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);

  const closingSoon = await Listing.find({
    status: 'open',
    'timeline.deadline': { $gte: now, $lte: sevenDaysFromNow },
    _id: { $nin: excludedIds }
  }).sort({ 'timeline.deadline': 1 }).limit(5);

  // 3. Don't Miss (priority dont-miss, open)
  const dontMiss = await Listing.find({
    priority: 'dont-miss',
    status: 'open'
  }).sort({ 'timeline.deadline': 1 }).limit(3);

  // 4. Recommended (Eligibility + Scoring)
  // Simplified version: Eligibility match + Interest overlap
  let recommended = await Listing.find({
    status: 'open',
    _id: { $nin: excludedIds },
    $and: [
      { $or: [
        { 'targetAudience.years': { $exists: true, $size: 0 } },
        { 'targetAudience.years': user.profile.currentYear }
      ]},
      { $or: [
        { 'targetAudience.branches': { $exists: true, $size: 0 } },
        { 'targetAudience.branches': user.profile.branch }
      ]}
    ]
  }).limit(20);

  // Simple scoring in JS (since it's a small result set)
  recommended = recommended.map(listing => {
    let score = 0;
    // +2 per matching interest
    listing.domainTags.forEach(tag => {
      if (user.interests.includes(tag)) score += 2;
    });
    // +2 high priority
    if (listing.priority === 'high') score += 2;
    // +3 dont-miss
    if (listing.priority === 'dont-miss') score += 3;
    
    return { ...listing.toObject(), score };
  }).sort((a, b) => b.score - a.score).slice(0, 8);

  res.json({
    closingSoon,
    dontMiss,
    recommended
  });
});

// @desc    Browse/Filter all listings
// @route   GET /api/feed/browse
// @access  Private
const browseListings = asyncHandler(async (req, res) => {
  const { domain, type, stipend, location, page = 1, limit = 20 } = req.query;
  const filter = { status: { $in: ['open', 'upcoming'] } };

  if (domain) filter.domainTags = { $in: Array.isArray(domain) ? domain : [domain] };
  if (type) filter.type = { $in: Array.isArray(type) ? type : [type] };
  if (stipend) filter.stipendType = stipend;
  if (location) filter.locationType = location;

  const count = await Listing.countDocuments(filter);
  const listings = await Listing.find(filter)
    .sort({ priority: -1, 'timeline.deadline': 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  res.json({
    listings,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  });
});

module.exports = {
  getFeedSections,
  browseListings
};

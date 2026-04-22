const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');
const UserActivity = require('../models/UserActivity');
const { getCachedRecommendations, cacheRecommendations } = require('../config/redis');

// @desc    Get dashboard feed sections
// @route   GET /api/feed/sections
// @access  Private
const getFeedSections = asyncHandler(async (req, res) => {
  const user = req.user;
  const now = new Date();

  // 1. Try to get cached recommended section
  const cachedData = await getCachedRecommendations(user._id);
  if (cachedData) {
    return res.json(cachedData);
  }

  // 2. Get user activities to exclude (ignored, applied, saved)
  const activities = await UserActivity.find({ userId: user._id });
  const excludedIds = activities.map(a => a.listingId.toString());
  
  // [Existing filtering and sections logic ...]
  // (Moving logic to a helper for better modularity or just keeping it here for simplicity)
  
  const branchFilter = {
    $or: [
      { 'targetAudience.branches': { $exists: true, $size: 0 } },
      { 'targetAudience.branches': user.profile.branch }
    ]
  };

  const yearFilter = {
    $or: [
      { 'targetAudience.years': { $exists: true, $size: 0 } },
      { 'targetAudience.years': user.profile.currentYear }
    ]
  };

  // 3. Closing Soon
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);

  let closingSoon = await Listing.find({
    status: 'open',
    'timeline.deadline': { $gte: now, $lte: sevenDaysFromNow },
    _id: { $nin: excludedIds },
    ...branchFilter,
    ...yearFilter
  }).limit(20);

  closingSoon = closingSoon.map(listing => {
    let interestScore = listing.domainTags.reduce((acc, tag) => 
      acc + (user.interests.includes(tag) ? 10 : 0), 0);
    return { ...listing.toObject(), interestScore };
  }).sort((a, b) => b.interestScore - a.interestScore || a.timeline.deadline - b.timeline.deadline)
    .slice(0, 5);

  // 4. Don't Miss
  const dontMiss = await Listing.find({
    priority: 'dont-miss',
    status: 'open',
    _id: { $nin: excludedIds },
    ...branchFilter
  }).sort({ 'timeline.deadline': 1 }).limit(3);

  // 5. Recommended
  let recommended = await Listing.find({
    status: 'open',
    _id: { $nin: [...excludedIds, ...closingSoon.map(l => l._id.toString())] },
    ...branchFilter,
    ...yearFilter
  }).limit(30);

  recommended = recommended.map(listing => {
    let score = 0;
    listing.domainTags.forEach(tag => {
      if (user.interests.includes(tag)) score += 2;
    });
    if (listing.timeline.deadline) {
      const daysToDeadline = (new Date(listing.timeline.deadline) - now) / (1000 * 60 * 60 * 24);
      if (daysToDeadline > 0 && daysToDeadline <= 30) score += 1;
    }
    if (listing.priority === 'high') score += 2;
    if (listing.priority === 'dont-miss') score += 3;
    
    return { ...listing.toObject(), score };
  }).sort((a, b) => b.score - a.score).slice(0, 8);

  const responseData = {
    closingSoon,
    dontMiss,
    recommended
  };

  // 6. Cache the result
  await cacheRecommendations(user._id, responseData);

  res.json(responseData);
});

// @desc    Get recommended listings ONLY (for legacy tests/infinite scroll)
// @route   GET /api/feed/recommendations
// @access  Private
const getRecommendationsList = asyncHandler(async (req, res) => {
  const user = req.user;
  const now = new Date();

  const activities = await UserActivity.find({ userId: user._id });
  const excludedIds = activities.map(a => a.listingId.toString());

  const branchFilter = {
    $or: [
      { 'targetAudience.branches': { $exists: true, $size: 0 } },
      { 'targetAudience.branches': user.profile.branch }
    ]
  };

  let recommended = await Listing.find({
    status: 'open',
    _id: { $nin: excludedIds },
    ...branchFilter
  }).limit(50);

  recommended = recommended.map(listing => {
    let score = 0;
    if (user.interests.some(tag => listing.domainTags.includes(tag))) score += 2;
    if (listing.priority === 'high') score += 5;
    if (listing.priority === 'dont-miss') score += 10;
    return { ...listing.toObject(), score };
  }).sort((a, b) => b.score - a.score);

  res.json(recommended);
});

// @desc    Get Don't Miss listings ONLY
// @route   GET /api/feed/dont-miss
// @access  Private
const getDontMissList = asyncHandler(async (req, res) => {
  const user = req.user;
  const activities = await UserActivity.find({ userId: user._id });
  const excludedIds = activities.map(a => a.listingId.toString());

  const dontMiss = await Listing.find({
    priority: 'dont-miss',
    status: 'open',
    _id: { $nin: excludedIds }
  }).sort({ 'timeline.deadline': 1 });

  res.json(dontMiss);
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
  browseListings,
  getRecommendationsList,
  getDontMissList
};

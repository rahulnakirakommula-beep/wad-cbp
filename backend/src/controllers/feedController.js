const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');
const UserActivity = require('../models/UserActivity');
const { getCachedRecommendations, cacheRecommendations } = require('../config/redis');

const buildBranchFilter = (branch) => ({
  $or: [
    { 'targetAudience.branches': { $exists: true, $size: 0 } },
    { 'targetAudience.branches': branch }
  ]
});

const buildYearFilter = (currentYear) => ({
  $or: [
    { 'targetAudience.years': { $exists: true, $size: 0 } },
    { 'targetAudience.years': currentYear }
  ]
});

const scoreListing = (listing, interests, now) => {
  let score = 0;

  listing.domainTags.forEach((tag) => {
    if (interests.includes(tag)) score += 2;
  });

  if (listing.timeline?.deadline) {
    const daysToDeadline = (new Date(listing.timeline.deadline) - now) / (1000 * 60 * 60 * 24);
    if (daysToDeadline > 0 && daysToDeadline <= 30) score += 1;
  }

  if (listing.priority === 'high') score += 2;
  if (listing.priority === 'dont-miss') score += 3;

  return { ...listing.toObject(), score };
};

const getActivityBuckets = async (userId) => {
  const activities = await UserActivity.find({ userId }).lean();

  return activities.reduce((acc, activity) => {
    const id = activity.listingId.toString();
    acc.all.add(id);
    if (!acc.byStatus[activity.status]) {
      acc.byStatus[activity.status] = new Set();
    }
    acc.byStatus[activity.status].add(id);
    return acc;
  }, { all: new Set(), byStatus: {} });
};

const computeFeedSectionsForUser = async (user) => {
  const now = new Date();
  const activityBuckets = await getActivityBuckets(user._id);
  const ignoredIds = [...(activityBuckets.byStatus.ignored || new Set())];
  const recommendedExcludedIds = [
    ...(activityBuckets.byStatus.saved || new Set()),
    ...(activityBuckets.byStatus.applied || new Set()),
    ...(activityBuckets.byStatus.ignored || new Set())
  ];

  const branchFilter = buildBranchFilter(user.profile?.branch);
  const yearFilter = buildYearFilter(user.profile?.currentYear);

  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const [
    closingSoon,
    dontMiss,
    browseAll,
    recommendedCandidates
  ] = await Promise.all([
    Listing.find({
      status: 'open',
      'timeline.deadline': { $gte: now, $lte: sevenDaysFromNow },
      _id: { $nin: ignoredIds },
      ...branchFilter,
      ...yearFilter
    })
      .sort({ 'timeline.deadline': 1 })
      .limit(5),
    Listing.find({
      priority: 'dont-miss',
      status: 'open',
      _id: { $nin: ignoredIds },
      ...branchFilter,
      ...yearFilter
    })
      .sort({ 'timeline.deadline': 1 })
      .limit(3),
    Listing.find({
      status: { $in: ['open', 'upcoming'] }
    })
      .sort({ priority: -1, 'timeline.deadline': 1 })
      .limit(20),
    Listing.find({
      status: 'open',
      _id: { $nin: recommendedExcludedIds },
      ...branchFilter,
      ...yearFilter
    }).limit(50)
  ]);

  let recommended = recommendedCandidates
    .map((listing) => scoreListing(listing, user.interests || [], now))
    .sort((a, b) => b.score - a.score || new Date(a.timeline?.deadline || 0) - new Date(b.timeline?.deadline || 0))
    .slice(0, 8);

  if (recommended.length < 3) {
    const relaxedCandidates = await Listing.find({
      status: 'open',
      _id: { $nin: recommendedExcludedIds },
      ...branchFilter
    }).limit(50);

    recommended = relaxedCandidates
      .map((listing) => scoreListing(listing, user.interests || [], now))
      .sort((a, b) => b.score - a.score || new Date(a.timeline?.deadline || 0) - new Date(b.timeline?.deadline || 0))
      .slice(0, 8);
  }

  return {
    closingSoon,
    recommended,
    dontMiss,
    browseAll
  };
};

// @desc    Get dashboard feed sections
// @route   GET /api/feed/sections
// @access  Private
const getFeedSections = asyncHandler(async (req, res) => {
  const user = req.user;
  const cachedData = await getCachedRecommendations(user._id);

  if (cachedData) {
    return res.json(cachedData);
  }

  const responseData = await computeFeedSectionsForUser(user);
  await cacheRecommendations(user._id, responseData);

  res.json(responseData);
});

// @desc    Get recommended listings ONLY
// @route   GET /api/feed/recommendations
// @access  Private
const getRecommendationsList = asyncHandler(async (req, res) => {
  const { recommended } = await computeFeedSectionsForUser(req.user);
  res.json(recommended);
});

// @desc    Get Don't Miss listings ONLY
// @route   GET /api/feed/dont-miss
// @access  Private
const getDontMissList = asyncHandler(async (req, res) => {
  const { dontMiss } = await computeFeedSectionsForUser(req.user);
  res.json(dontMiss);
});

// @desc    Browse/Filter all listings
// @route   GET /api/feed/browse
// @access  Private
const browseListings = asyncHandler(async (req, res) => {
  const { domain, type, stipend, location, page = 1, limit = 20 } = req.query;
  const numericPage = Number(page) || 1;
  const numericLimit = Number(limit) || 20;
  const filter = { status: { $in: ['open', 'upcoming'] } };

  if (domain) filter.domainTags = { $in: Array.isArray(domain) ? domain : [domain] };
  if (type) filter.type = { $in: Array.isArray(type) ? type : [type] };
  if (stipend) filter.stipendType = stipend;
  if (location) filter.locationType = location;

  const count = await Listing.countDocuments(filter);
  const listings = await Listing.find(filter)
    .sort({ priority: -1, 'timeline.deadline': 1 })
    .limit(numericLimit)
    .skip((numericPage - 1) * numericLimit)
    .exec();

  res.json({
    listings,
    totalCount: count,
    totalPages: Math.ceil(count / numericLimit),
    currentPage: numericPage
  });
});

module.exports = {
  browseListings,
  computeFeedSectionsForUser,
  getDontMissList,
  getFeedSections,
  getRecommendationsList
};

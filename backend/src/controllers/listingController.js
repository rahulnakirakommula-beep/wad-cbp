const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');
const UserActivity = require('../models/UserActivity');
const DataFlag = require('../models/DataFlag');

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Private
const getListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate('sourceId', 'name verificationLevel');

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Check if student is allowed to see closed/cancelled listings
  // Rule: Closed/cancelled only if user has activity record
  if (['closed', 'cancelled'].includes(listing.status)) {
    const activity = await UserActivity.findOne({ userId: req.user._id, listingId: listing._id });
    if (!activity) {
      res.status(403);
      throw new Error('Access to closed listing not allowed without prior interaction');
    }
  }

  res.json(listing);
});

// @desc    Get calendar view listings
// @route   GET /api/listings/calendar
// @access  Private
const getCalendarListings = asyncHandler(async (req, res) => {
  // Return lightweight projection for upcoming/open listings with dates
  const listings = await Listing.find({
    status: { $in: ['open', 'upcoming'] },
    $or: [
      { 'timeline.openDate': { $ne: null } },
      { 'timeline.deadline': { $ne: null } },
      { 'timeline.expectedStart': { $ne: null } }
    ]
  }, 'title orgName timeline status priority domainTags');

  res.json(listings);
});

// @desc    Flag a listing with an issue
// @route   POST /api/listings/:id/flag
// @access  Private
const flagListing = asyncHandler(async (req, res) => {
  const { issueType, proposedFix } = req.body;

  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  const flag = await DataFlag.findOneAndUpdate(
    { listingId: listing._id, reporterId: req.user._id },
    { issueType, proposedFix, status: 'pending' },
    { new: true, upsert: true }
  );

  res.status(201).json(flag);
});

// @desc    Get listings for Explore/Browse (Search & Filter)
// @route   GET /api/listings/explore
// @access  Private
const getExploreListings = asyncHandler(async (req, res) => {
  const { 
    search, 
    domainTags, 
    branches, 
    status = 'open',
    sortBy = 'deadline', // deadline, priority, newest
    page = 1, 
    limit = 20 
  } = req.query;

  const query = { status };

  // Text search on title/org
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { orgName: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by domain tags
  if (domainTags) {
    const tagsArray = domainTags.split(',');
    query.domainTags = { $in: tagsArray };
  }

  // Filter by branch eligibility
  if (branches) {
    const branchesArray = branches.split(',');
    query['targetAudience.branches'] = { $in: branchesArray };
  }

  // Define sort
  let sort = { 'timeline.deadline': 1 };
  if (sortBy === 'newest') sort = { createdAt: -1 };
  if (sortBy === 'priority') sort = { priority: -1, 'timeline.deadline': 1 };

  const count = await Listing.countDocuments(query);
  const listings = await Listing.find(query)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('sourceId', 'name verificationLevel');

  res.json({
    listings,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  });
});

module.exports = {
  getListing,
  getCalendarListings,
  getExploreListings,
  flagListing
};

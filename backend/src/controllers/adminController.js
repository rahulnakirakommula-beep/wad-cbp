const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Source = require('../models/Source');
const DomainTag = require('../models/DomainTag');
const DataFlag = require('../models/DataFlag');
const AuditLog = require('../models/AuditLog');

// Helper to record audit logs
const createAudit = async (actorId, actorType, category, action, referenceId, diff = null) => {
  await AuditLog.create({
    actorId,
    actorType,
    category,
    action,
    referenceId,
    diff
  });
};

// @desc    Get all listings for admin view
// @route   GET /api/admin/listings
// @access  Private/Admin
const getAdminListings = asyncHandler(async (req, res) => {
  const { status, priority, isCurated, isStale, page = 1, limit = 30 } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (isCurated) filter.isCurated = isCurated === 'true';
  if (isStale) filter.isStale = isStale === 'true';

  const count = await Listing.countDocuments(filter);
  const listings = await Listing.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  res.json({
    listings,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  });
});

// @desc    Create listing manually
// @route   POST /api/admin/listings
// @access  Private/Admin
const createListing = asyncHandler(async (req, res) => {
  const listing = await Listing.create({
    ...req.body,
    version: 1
  });

  await createAudit(req.user._id, 'user', 'listing', 'created_manually', listing._id);

  res.status(201).json(listing);
});

// @desc    Update listing with optimistic concurrency
// @route   PUT /api/admin/listings/:id
// @access  Private/Admin
const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Optimistic concurrency check
  if (req.body.version !== listing.version) {
    res.status(409);
    throw new Error('Listing has been modified by another admin. Please reload.');
  }

  const oldValues = listing.toObject();
  
  // Update fields
  Object.assign(listing, req.body);
  listing.version += 1;
  listing.lastVerifiedAt = Date.now();
  listing.isStale = false;

  const updatedListing = await listing.save();

  // Simple diff logic for audit
  const diff = {};
  Object.keys(req.body).forEach(key => {
    if (JSON.stringify(oldValues[key]) !== JSON.stringify(req.body[key])) {
      diff[key] = { from: oldValues[key], to: req.body[key] };
    }
  });

  await createAudit(req.user._id, 'user', 'listing', 'updated', listing._id, diff);

  res.json(updatedListing);
});

// @desc    Reset listing cycle
// @route   POST /api/admin/listings/:id/cycle-reset
// @access  Private/Admin
const resetListingCycle = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  const oldValues = {
    status: listing.status,
    deadline: listing.timeline.deadline,
    isCurated: listing.isCurated
  };

  // Atomic update logic from HLD
  listing.timeline.lastDeadline = listing.timeline.deadline;
  listing.timeline.openDate = null;
  listing.timeline.deadline = null;
  listing.status = 'upcoming';
  listing.isCurated = false;
  listing.version += 1;

  await listing.save();

  await createAudit(req.user._id, 'user', 'listing', 'cycle_reset', listing._id, {
    status: { from: oldValues.status, to: 'upcoming' },
    isCurated: { from: oldValues.isCurated, to: false }
  });

  res.json(listing);
});

// @desc    Verify/Update a source
// @route   PUT /api/admin/sources/:id/verify
// @access  Private/Admin
const verifySource = asyncHandler(async (req, res) => {
  const { verificationLevel } = req.body;
  const source = await Source.findById(req.params.id);

  if (!source) {
    res.status(404);
    throw new Error('Source not found');
  }

  source.verificationLevel = verificationLevel || source.verificationLevel;
  await source.save();

  await createAudit(req.user._id, 'user', 'source', 'verified', source._id, { verificationLevel });

  res.json(source);
});

// @desc    Get all sources
// @route   GET /api/admin/sources
// @access  Private/Admin
const getSources = asyncHandler(async (req, res) => {
  const sources = await Source.find().sort({ name: 1 });
  res.json(sources);
});

// @desc    Get all data flags
// @route   GET /api/admin/flags
// @access  Private/Admin
const getFlags = asyncHandler(async (req, res) => {
  const flags = await DataFlag.find({ status: 'pending' }).populate('listingId reporterId');
  res.json(flags);
});

// @desc    Review/Resolve a data flag
// @route   PUT /api/admin/flags/:id
// @access  Private/Admin
const reviewFlag = asyncHandler(async (req, res) => {
  const { status, resolutionNotes } = req.body;
  const flag = await DataFlag.findById(req.params.id);

  if (!flag) {
    res.status(404);
    throw new Error('Flag not found');
  }

  flag.status = status || flag.status;
  flag.resolutionNotes = resolutionNotes;
  flag.resolvedAt = Date.now();
  await flag.save();

  await createAudit(req.user._id, 'user', 'flag', 'reviewed', flag._id, { status });

  res.json(flag);
});

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
  const totalListings = await Listing.countDocuments();
  const pendingFlags = await DataFlag.countDocuments({ status: 'pending' });
  const openOpportunities = await Listing.countDocuments({ status: 'open' });
  const activeUsers = await User.countDocuments({ status: 'active' });

  res.json({
    totalListings,
    pendingFlags,
    openOpportunities,
    activeUsers
  });
});

module.exports = {
  getAdminListings,
  createListing,
  updateListing,
  resetListingCycle,
  verifySource,
  getFlags,
  reviewFlag,
  getAdminStats,
  getSources
};

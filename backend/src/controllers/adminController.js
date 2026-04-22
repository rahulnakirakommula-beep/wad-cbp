const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Source = require('../models/Source');
const DomainTag = require('../models/DomainTag');
const KnowledgeGuide = require('../models/KnowledgeGuide');
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

  if (listing.status !== 'closed' || listing.scheduleType !== 'recurring') {
    res.status(400);
    throw new Error('Only closed, recurring listings can be reset.');
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

// @desc    Quick verify a listing (reset staleness)
// @route   POST /api/admin/listings/:id/verify
// @access  Private/Admin
const verifyListingStaleness = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  listing.lastVerifiedAt = Date.now();
  listing.isStale = false;
  listing.version += 1;
  await listing.save();

  await createAudit(req.user._id, 'user', 'listing', 'quick_verified', listing._id);

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
  source.verifiedAt = Date.now();
  source.verifiedBy = req.user._id;
  await source.save();

  await createAudit(req.user._id, 'user', 'source', 'verified', source._id, { verificationLevel });

  res.json(source);
});

// @desc    Deactivate a source
// @route   PUT /api/admin/sources/:id/deactivate
// @access  Private/Admin
const deactivateSource = asyncHandler(async (req, res) => {
  const source = await Source.findById(req.params.id);

  if (!source) {
    res.status(404);
    throw new Error('Source not found');
  }

  source.isActive = false;
  await source.save();

  await createAudit(req.user._id, 'user', 'source', 'deactivated', source._id);

  res.json({ message: 'Source deactivated successfully' });
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

// @desc    Get all tags for admin
// @route   GET /api/admin/tags
// @access  Private/Admin
const getAdminTags = asyncHandler(async (req, res) => {
  const tags = await DomainTag.find().sort({ category: 1, name: 1 });
  res.json(tags);
});

// @desc    Create a new tag
// @route   POST /api/admin/tags
// @access  Private/Admin
const createTag = asyncHandler(async (req, res) => {
  const { name, category } = req.body;
  const tag = await DomainTag.create({ name, category, isActive: true });
  await createAudit(req.user._id, 'user', 'tag', 'created', tag._id);
  res.status(201).json(tag);
});

// @desc    Update a tag status
// @route   PUT /api/admin/tags/:id
// @access  Private/Admin
const updateTag = asyncHandler(async (req, res) => {
  const tag = await DomainTag.findById(req.params.id);
  if (!tag) {
    res.status(404);
    throw new Error('Tag not found');
  }
  Object.assign(tag, req.body);
  await tag.save();
  await createAudit(req.user._id, 'user', 'tag', 'updated', tag._id, req.body);
  res.json(tag);
});

// @desc    Get all guides for admin
// @route   GET /api/admin/guides
// @access  Private/Admin
const getAdminGuides = asyncHandler(async (req, res) => {
  const guides = await KnowledgeGuide.find().sort({ title: 1 });
  res.json(guides);
});

// @desc    Create a new guide
// @route   POST /api/admin/guides
// @access  Private/Admin
const createGuide = asyncHandler(async (req, res) => {
  const guide = await KnowledgeGuide.create(req.body);
  await createAudit(req.user._id, 'user', 'guide', 'created', guide._id);
  res.status(201).json(guide);
});

// @desc    Update a guide
// @route   PUT /api/admin/guides/:id
// @access  Private/Admin
const updateGuide = asyncHandler(async (req, res) => {
  const guide = await KnowledgeGuide.findById(req.params.id);
  if (!guide) {
    res.status(404);
    throw new Error('Guide not found');
  }
  Object.assign(guide, req.body);
  await guide.save();
  await createAudit(req.user._id, 'user', 'guide', 'updated', guide._id, req.body);
  res.json(guide);
});

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json(users);
});

// @desc    Update user status (suspend/unsuspend)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.status = req.body.status;
  await user.save();
  await createAudit(req.user._id, 'user', 'user_management', `status_${req.body.status}`, user._id);
  res.json({ message: `User status updated to ${req.body.status}` });
});

// @desc    Get system audit logs
// @route   GET /api/admin/audit
// @access  Private/Admin
const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
  res.json(logs);
});

module.exports = {
  getAdminListings,
  createListing,
  updateListing,
  resetListingCycle,
  verifyListingStaleness,
  verifySource,
  deactivateSource,
  getFlags,
  reviewFlag,
  getAdminStats,
  getSources,
  getAdminTags,
  createTag,
  updateTag,
  getAdminGuides,
  createGuide,
  updateGuide,
  getAdminUsers,
  updateUserStatus,
  getAuditLogs
};

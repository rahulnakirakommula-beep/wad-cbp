const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Source = require('../models/Source');
const DomainTag = require('../models/DomainTag');
const KnowledgeGuide = require('../models/KnowledgeGuide');
const DataFlag = require('../models/DataFlag');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const UserActivity = require('../models/UserActivity');
const { sendEmail } = require('../services/emailService');
const bcrypt = require('bcryptjs');

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

  const numPage = Number(page) || 1;
  const numLimit = Number(limit) || 30;
  const count = await Listing.countDocuments(filter);
  const listings = await Listing.find(filter)
    .sort({ createdAt: -1 })
    .limit(numLimit)
    .skip((numPage - 1) * numLimit)
    .lean();

  // P5: Aggregate engagement counts for these listings
  if (listings.length > 0) {
    const listingIds = listings.map(l => l._id);
    const engagement = await UserActivity.aggregate([
      { $match: { listingId: { $in: listingIds } } },
      { $group: { _id: { listingId: '$listingId', status: '$status' }, count: { $sum: 1 } } }
    ]);

    const engagementMap = {};
    for (const e of engagement) {
      const id = e._id.listingId.toString();
      if (!engagementMap[id]) engagementMap[id] = { saved: 0, applied: 0, ignored: 0 };
      if (e._id.status === 'saved') engagementMap[id].saved = e.count;
      if (e._id.status === 'applied') engagementMap[id].applied = e.count;
      if (e._id.status === 'ignored') engagementMap[id].ignored = e.count;
    }

    for (const listing of listings) {
      listing.engagement = engagementMap[listing._id.toString()] || { saved: 0, applied: 0, ignored: 0 };
    }
  }

  res.json({
    listings,
    totalPages: Math.ceil(count / numLimit),
    currentPage: numPage
  });
});

// @desc    Get single listing with full admin context
// @route   GET /api/admin/listings/:id
// @access  Private/Admin
const getAdminListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate('sourceId', 'name verificationLevel')
    .lean();

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Aggregate engagement counts for this listing
  const engagement = await UserActivity.aggregate([
    { $match: { listingId: listing._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const metrics = { saves: 0, apps: 0, ignores: 0 };
  for (const e of engagement) {
    if (e._id === 'saved') metrics.saves = e.count;
    if (e._id === 'applied') metrics.apps = e.count;
    if (e._id === 'ignored') metrics.ignores = e.count;
  }
  listing.metrics = metrics;

  // Fetch flags for this listing
  listing.flags = await DataFlag.find({ listingId: listing._id }).populate('reporterId', 'profile.name email');

  // Fetch audit trail for this listing
  listing.auditTrail = await AuditLog.find({ referenceId: listing._id })
    .sort({ timestamp: -1 })
    .limit(20)
    .populate('actorId', 'profile.name');

  res.json(listing);
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

  // FR-ADM-CUR-07: Cancellation notification dispatch
  if (req.body.status === 'cancelled' && oldValues.status !== 'cancelled') {
    dispatchCancellationNotifications(listing).catch(err =>
      console.error('[EVENT] Cancellation dispatch error:', err)
    );
  }

  // FR-ADM-CUR-08: Don't-miss notification dispatch
  if (req.body.priority === 'dont-miss' && oldValues.priority !== 'dont-miss') {
    dispatchDontMissNotifications(listing).catch(err =>
      console.error('[EVENT] Dont-miss dispatch error:', err)
    );
  }

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

  const scheduleType = listing.timeline?.scheduleType;

  if (listing.status !== 'closed' || !['recurring-annual', 'recurring-irregular'].includes(scheduleType)) {
    res.status(400);
    throw new Error('Only closed recurring listings can be reset.');
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

// @desc    Create a new source (and optionally a linked user account)
// @route   POST /api/admin/sources
// @access  Private/Admin
const createSource = asyncHandler(async (req, res) => {
  const { name, sourceType, contactEmail, verificationLevel, linkedUser } = req.body;

  if (!name || !sourceType) {
    res.status(400);
    throw new Error('Source name and sourceType are required.');
  }

  const source = await Source.create({
    name,
    sourceType,
    contactEmail: contactEmail || null,
    verificationLevel: verificationLevel || 'unverified',
    isActive: true
  });

  let createdUser = null;

  // Optionally create a linked user account with role: 'source'
  if (linkedUser && linkedUser.email && linkedUser.password) {
    const existingUser = await User.findOne({ email: linkedUser.email });
    if (existingUser) {
      res.status(409);
      throw new Error(`User with email ${linkedUser.email} already exists.`);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(linkedUser.password, salt);

    createdUser = await User.create({
      email: linkedUser.email,
      passwordHash,
      profile: { name: linkedUser.name || name },
      role: 'source',
      isEmailVerified: true,
      onboardingComplete: true,
      status: 'active',
      sourceId: source._id
    });
  }

  await createAudit(req.user._id, 'user', 'source', 'created', source._id, {
    name, sourceType, linkedUserId: createdUser?._id || null
  });

  res.status(201).json({
    source,
    linkedUser: createdUser ? {
      _id: createdUser._id,
      email: createdUser.email,
      role: createdUser.role
    } : null
  });
});

// @desc    Get all sources
// @route   GET /api/admin/sources
// @access  Private/Admin
const getSources = asyncHandler(async (req, res) => {
  const sources = await Source.find().sort({ name: 1 }).lean();

  // P8: Aggregate listing count per source
  if (sources.length > 0) {
    const sourceIds = sources.map(s => s._id);
    const counts = await Listing.aggregate([
      { $match: { sourceId: { $in: sourceIds } } },
      { $group: { _id: '$sourceId', listingCount: { $sum: 1 } } }
    ]);
    const countMap = {};
    for (const c of counts) countMap[c._id.toString()] = c.listingCount;
    for (const source of sources) source.listingCount = countMap[source._id.toString()] || 0;
  }

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
  const { tagId, displayName, category } = req.body;
  const slug = tagId || displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const tag = await DomainTag.create({ tagId: slug, displayName, category, isActive: true });
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

  const oldActive = tag.isActive;
  Object.assign(tag, req.body);
  await tag.save();
  await createAudit(req.user._id, 'user', 'tag', 'updated', tag._id, req.body);

  // FR-ADM-TAG-03: If retiring with a replacement slug, run background migration
  if (oldActive && !tag.isActive && req.body.replacementSlug) {
    const oldSlug = tag.tagId;
    const newSlug = req.body.replacementSlug;
    // Background migration — don't await
    Promise.all([
      Listing.updateMany(
        { domainTags: oldSlug },
        { $set: { 'domainTags.$[elem]': newSlug } },
        { arrayFilters: [{ elem: oldSlug }] }
      ),
      User.updateMany(
        { interests: oldSlug },
        { $set: { 'interests.$[elem]': newSlug } },
        { arrayFilters: [{ elem: oldSlug }] }
      )
    ]).then(() => {
      console.log(`[TAG MIGRATION] Replaced '${oldSlug}' with '${newSlug}' in listings and users.`);
    }).catch(err => {
      console.error(`[TAG MIGRATION] Error replacing '${oldSlug}':`, err);
    });
  }

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
  const wasPublished = guide.isPublished;
  Object.assign(guide, req.body);
  await guide.save();
  await createAudit(req.user._id, 'user', 'guide', 'updated', guide._id, req.body);

  // FR-ADM-GDE-05: On publish, set Listing.guideId on linked listings
  if (guide.isPublished && !wasPublished && guide.linkedListings?.length > 0) {
    await Listing.updateMany(
      { _id: { $in: guide.linkedListings }, guideId: null },
      { guideId: guide._id }
    );
  }

  res.json(guide);
});

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = asyncHandler(async (req, res) => {
  const { search, role, status } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { 'profile.name': { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
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
  const oldStatus = user.status;
  user.status = req.body.status;
  await user.save();
  await createAudit(req.user._id, 'user', 'user', `status_${req.body.status}`, user._id, {
    status: { from: oldStatus, to: req.body.status }
  });
  res.json({ message: `User status updated to ${req.body.status}` });
});

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['student', 'admin', 'source'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role. Must be student, admin, or source.');
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const oldRole = user.role;
  user.role = role;
  await user.save();
  await createAudit(req.user._id, 'user', 'user', 'role_changed', user._id, {
    role: { from: oldRole, to: role }
  });
  res.json({ message: `User role changed from ${oldRole} to ${role}` });
});

// @desc    Get system audit logs
// @route   GET /api/admin/audit
// @access  Private/Admin
const getAuditLogs = asyncHandler(async (req, res) => {
  const { category, actorType, referenceId, startDate, endDate, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (actorType) filter.actorType = actorType;
  if (referenceId) filter.referenceId = referenceId;
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }
  const numPage = Number(page) || 1;
  const numLimit = Number(limit) || 50;
  const count = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter)
    .sort({ timestamp: -1 })
    .limit(numLimit)
    .skip((numPage - 1) * numLimit);
  res.json({
    logs,
    totalCount: count,
    totalPages: Math.ceil(count / numLimit),
    currentPage: numPage
  });
});

// @desc    Bulk action on listings
// @route   PUT /api/admin/listings/bulk
// @access  Private/Admin
const bulkUpdateListings = asyncHandler(async (req, res) => {
  const { ids, action } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400);
    throw new Error('Provide an array of listing IDs.');
  }

  let result;
  switch (action) {
    case 'mark_stale':
      result = await Listing.updateMany({ _id: { $in: ids } }, { isStale: true });
      break;
    case 'archive':
      result = await Listing.updateMany({ _id: { $in: ids } }, { status: 'closed' });
      break;
    default:
      res.status(400);
      throw new Error('Invalid action. Supported: mark_stale, archive.');
  }

  await createAudit(req.user._id, 'user', 'listing', `bulk_${action}`, ids[0], {
    ids,
    modifiedCount: result.modifiedCount
  });

  res.json({ message: `Bulk ${action} completed`, modifiedCount: result.modifiedCount });
});

// --- Event-driven dispatch helpers ---

/**
 * FR-ADM-CUR-07 / FR-JOB-06: Dispatch cancelled notifications
 * to all users with saved or applied activity on a listing.
 */
async function dispatchCancellationNotifications(listing) {
  const activities = await UserActivity.find({
    listingId: listing._id,
    status: { $in: ['saved', 'applied'] }
  }).populate('userId');

  for (const activity of activities) {
    const user = activity.userId;
    if (!user || user.status !== 'active') continue;
    if (!user.notificationPrefs?.cancellationAlerts) continue;

    await Notification.create({
      userId: user._id,
      listingId: listing._id,
      type: 'cancelled',
      payload: {
        title: 'Opportunity Cancelled',
        message: `${listing.title} at ${listing.orgName} has been cancelled.`,
        actionUrl: `/app/listing/${listing._id}`
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    if (user.notificationPrefs?.emailEnabled) {
      sendEmail({
        email: user.email,
        subject: `Cancelled: ${listing.title}`,
        template: 'listing-cancelled',
        data: {
          name: user.profile?.name,
          listingTitle: listing.title,
          orgName: listing.orgName
        }
      }).catch(err => console.error('[EMAIL] Cancellation email error:', err));
    }
  }
}

/**
 * FR-ADM-CUR-08 / FR-JOB-05: Dispatch dont_miss notifications
 * to users with matching interests, subject to frequency cap
 * (max 1 per user per 7 days across all listings).
 */
async function dispatchDontMissNotifications(listing) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const interestedUsers = await User.find({
    status: 'active',
    'notificationPrefs.dontMissAlerts': true,
    interests: { $in: listing.domainTags || [] }
  });

  for (const user of interestedUsers) {
    // FR-NOT-08: Frequency cap — max 1 dont_miss per user per 7 days
    const recent = await Notification.findOne({
      userId: user._id,
      type: 'dont_miss',
      createdAt: { $gte: sevenDaysAgo }
    });
    if (recent) continue;

    await Notification.create({
      userId: user._id,
      listingId: listing._id,
      type: 'dont_miss',
      payload: {
        title: "Don't Miss This!",
        message: `${listing.title} at ${listing.orgName} is a must-see opportunity.`,
        actionUrl: `/app/listing/${listing._id}`
      },
      expiresAt: listing.timeline?.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  }
}

module.exports = {
  getAdminListings,
  getAdminListingById,
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
  updateUserRole,
  getAuditLogs,
  bulkUpdateListings,
  createSource
};

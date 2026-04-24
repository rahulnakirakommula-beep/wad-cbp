const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');
const Source = require('../models/Source');
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

// @desc    Get listings for the logged-in organization
// @route   GET /api/org/listings
// @access  Private/Source
const getMyListings = asyncHandler(async (req, res) => {
  if (!req.user.sourceId) {
    res.status(400);
    throw new Error('User not linked to any organization');
  }

  const listings = await Listing.find({ sourceId: req.user.sourceId })
    .sort({ createdAt: -1 });

  res.json(listings);
});

// @desc    Submit a new listing from an organization
// @route   POST /api/org/listings
// @access  Private/Source
const createMyListing = asyncHandler(async (req, res) => {
  if (!req.user.sourceId) {
    res.status(400);
    throw new Error('User not linked to any organization');
  }

  // FR-ORG-05: Official sources can direct-publish
  const source = await Source.findById(req.user.sourceId);
  const initialStatus = source?.verificationLevel === 'official' ? 'open' : 'unknown';

  const listing = await Listing.create({
    ...req.body,
    sourceId: req.user.sourceId,
    status: initialStatus,
    isCurated: false,
    version: 1,
    verifiedBy: null
  });

  const action = initialStatus === 'open' ? 'org_direct_publish' : 'org_submission';
  await createAudit(req.user._id, 'user', 'listing', action, listing._id);

  res.status(201).json(listing);
});

// @desc    Update an organization's own listing
// @route   PUT /api/org/listings/:id
// @access  Private/Source
const updateMyListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Ensure ownership
  if (listing.sourceId.toString() !== req.user.sourceId.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this listing');
  }

  const oldValues = listing.toObject();
  Object.assign(listing, req.body);
  
  // Transitions back to unknown if certain fields change? 
  // SRS says "Submission to Queue", implying orgs can't direct publish unless "Official"
  // For now, let's keep it simple: any update resets to unknown for re-verification
  listing.status = 'unknown';
  listing.version += 1;
  
  const updatedListing = await listing.save();

  await createAudit(req.user._id, 'user', 'listing', 'org_update', listing._id);

  res.json(updatedListing);
});

// @desc    Get stats for the organization
// @route   GET /api/org/stats
// @access  Private/Source
const getOrgStats = asyncHandler(async (req, res) => {
  const sourceId = req.user.sourceId;
  
  const total = await Listing.countDocuments({ sourceId });
  const open = await Listing.countDocuments({ sourceId, status: 'open' });
  const pending = await Listing.countDocuments({ sourceId, status: 'unknown' });

  res.json({
    totalListings: total,
    openOpportunities: open,
    pendingApprovals: pending
  });
});

module.exports = {
  getMyListings,
  createMyListing,
  updateMyListing,
  getOrgStats
};

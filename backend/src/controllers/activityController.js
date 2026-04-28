const asyncHandler = require('express-async-handler');
const UserActivity = require('../models/UserActivity');
const AuditLog = require('../models/AuditLog');

// @desc    Upsert user activity (save/ignore)
// @route   POST /api/activity
// @access  Private
const upsertActivity = asyncHandler(async (req, res) => {
  const { listingId, status } = req.body;

  if (!listingId || !status) {
    res.status(400);
    throw new Error('Please provide listingId and status');
  }

  // Prevent setting 'missed' manually
  if (status === 'missed') {
    res.status(403);
    throw new Error('Cannot set status to missed manually');
  }

  const activity = await UserActivity.findOneAndUpdate(
    { userId: req.user._id, listingId },
    { status, statusUpdatedAt: Date.now() },
    { new: true, upsert: true }
  );

  await AuditLog.create({
    actorId: req.user._id,
    actorType: 'user',
    category: 'listing',
    action: `activity_${status}`,
    referenceId: listingId
  });

  res.json(activity);
});

// @desc    Update activity status (e.g. mark applied)
// @route   PUT /api/activity/:listingId
// @access  Private
const updateActivity = asyncHandler(async (req, res) => {
  const { status, notes, applicationStatus } = req.body;
  const { listingId } = req.params;

  if (status === 'missed') {
    res.status(403);
    throw new Error('Cannot set status to missed manually');
  }

  const activity = await UserActivity.findOne({ userId: req.user._id, listingId });

  if (activity) {
    const oldStatus = activity.status;
    activity.status = status || activity.status;
    if (notes !== undefined) activity.notes = notes;
    activity.statusUpdatedAt = Date.now();

    // Update applicationStatus only for applied activities
    if (applicationStatus !== undefined) {
      if (activity.status !== 'applied' && status !== 'applied') {
        res.status(400);
        throw new Error('Application status can only be set on applied activities');
      }
      activity.applicationStatus = applicationStatus || null;
    }

    const updatedActivity = await activity.save();

    if (oldStatus !== activity.status) {
      await AuditLog.create({
        actorId: req.user._id,
        actorType: 'user',
        category: 'listing',
        action: `activity_status_${activity.status}`,
        referenceId: listingId,
        diff: { status: { from: oldStatus, to: activity.status } }
      });
    }

    res.json(updatedActivity);
  } else {
    res.status(404);
    throw new Error('Activity record not found');
  }
});

// @desc    Get activity summary stats
// @route   GET /api/activity/summary
// @access  Private
const getActivitySummary = asyncHandler(async (req, res) => {
  const activities = await UserActivity.find({ userId: req.user._id });

  const summary = {
    saved: 0,
    applied: 0,
    missed: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  };

  activities.forEach(a => {
    if (a.status === 'saved') summary.saved++;
    if (a.status === 'applied') summary.applied++;
    if (a.status === 'missed') summary.missed++;
    if (a.applicationStatus === 'pending') summary.pending++;
    if (a.applicationStatus === 'accepted') summary.accepted++;
    if (a.applicationStatus === 'rejected') summary.rejected++;
  });

  res.json(summary);
});

// @desc    Get user activities
// @route   GET /api/activity
// @access  Private
const getActivities = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { userId: req.user._id };
  
  if (status && status !== 'all') {
    filter.status = status;
  }

  const activities = await UserActivity.find(filter).populate('listingId');
  res.json(activities);
});

// @desc    Delete user activity
// @route   DELETE /api/activity/:listingId
// @access  Private
const deleteActivity = asyncHandler(async (req, res) => {
  const activity = await UserActivity.findOne({ 
    userId: req.user._id, 
    listingId: req.params.listingId 
  });

  if (!activity) {
    res.status(404);
    throw new Error('Activity record not found');
  }

  if (activity.status === 'missed') {
    res.status(403);
    throw new Error('Missed listings cannot be removed from dashboard');
  }

  await activity.deleteOne();
  res.json({ message: 'Activity removed successully' });
});

module.exports = {
  upsertActivity,
  updateActivity,
  getActivitySummary,
  getActivities,
  deleteActivity
};

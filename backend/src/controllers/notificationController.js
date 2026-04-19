const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const count = await Notification.countDocuments({ userId: req.user._id });
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  res.json({
    notifications,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ 
    userId: req.user._id, 
    status: 'unread' 
  });
  res.json({ count });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ 
    _id: req.params.id, 
    userId: req.user._id 
  });

  if (notification) {
    notification.status = 'read';
    await notification.save();
    res.json({ message: 'Marked as read' });
  } else {
    res.status(404);
    throw new Error('Notification not found');
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, status: 'unread' },
    { status: 'read' }
  );
  res.json({ message: 'All marked as read' });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead
};

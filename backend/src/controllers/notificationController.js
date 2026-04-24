const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status = 'all' } = req.query;
  const numericPage = Number(page) || 1;
  const numericLimit = Number(limit) || 20;
  const skip = (numericPage - 1) * numericLimit;
  const filter = { userId: req.user._id };

  if (status !== 'all') {
    filter.status = status;
  }

  const count = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(numericLimit)
    .skip(skip);
  
  res.json({
    notifications,
    totalPages: Math.ceil(count / numericLimit),
    currentPage: numericPage,
    totalCount: count
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

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  notification.status = 'read';
  await notification.save();

  res.json({ message: 'Notification marked as read' });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, status: 'unread' },
    { status: 'read' }
  );

  res.json({ message: 'All notifications marked as read' });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead
};

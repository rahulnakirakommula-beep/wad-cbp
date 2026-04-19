const express = require('express');
const router = express.Router();
const { getNotifications, getUnreadCount, markAsRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markAsRead);

module.exports = router;

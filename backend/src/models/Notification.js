const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deadline_3day', 'deadline_1day', 'dont_miss', 'season_open', 'cancelled'],
    required: true
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  payload: {
    title: { type: String, required: true },
    message: { type: String, required: true },
    actionUrl: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);

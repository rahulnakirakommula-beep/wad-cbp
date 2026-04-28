const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  status: {
    type: String,
    enum: ['saved', 'applied', 'ignored', 'missed'],
    required: true
  },
  applicationStatus: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  statusUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

userActivitySchema.index({ userId: 1, listingId: 1 }, { unique: true });
userActivitySchema.index({ userId: 1, status: 1 });
userActivitySchema.index({ status: 1, listingId: 1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);

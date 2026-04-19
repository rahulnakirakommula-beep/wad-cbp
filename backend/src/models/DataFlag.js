const mongoose = require('mongoose');

const dataFlagSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issueType: {
    type: String,
    enum: ['dead_link', 'wrong_deadline', 'wrong_eligibility', 'duplicate', 'other'],
    required: true
  },
  proposedFix: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending'
  }
}, { timestamps: true });

dataFlagSchema.index({ listingId: 1, status: 1 });

module.exports = mongoose.model('DataFlag', dataFlagSchema);

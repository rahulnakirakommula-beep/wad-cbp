const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sourceType: {
    type: String,
    enum: ['club', 'department', 'company', 'admin', 'scraper'],
    required: true
  },
  contactEmail: {
    type: String,
    default: null
  },
  verificationLevel: {
    type: String,
    enum: ['unverified', 'verified', 'official'],
    default: 'unverified'
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Source', sourceSchema);

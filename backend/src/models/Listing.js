const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  orgName: { type: String, required: true },
  orgLogoUrl: { type: String, default: null },
  sourceId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Source',
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  externalUrl: { type: String, required: true },
  type: {
    type: String,
    enum: ['internship', 'job', 'research', 'fellowship', 'hackathon', 'competition', 'scholarship', 'mentorship', 'workshop', 'incubator', 'other'],
    required: true
  },
  stipendType: {
    type: String,
    enum: ['paid', 'unpaid', 'unknown'],
    default: 'unknown'
  },
  locationType: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid', 'unknown'],
    default: 'unknown'
  },
  domainTags: [{ type: String }],
  targetAudience: {
    branches: [{ type: String }],
    years: [{ type: Number }]
  },
  status: {
    type: String,
    enum: ['upcoming', 'open', 'closed', 'cancelled', 'unknown'],
    default: 'unknown'
  },
  priority: {
    type: String,
    enum: ['normal', 'high', 'dont-miss'],
    default: 'normal'
  },
  isCurated: {
    type: Boolean,
    default: false
  },
  prepLeadWeeks: {
    type: Number,
    default: null
  },
  timeline: {
    scheduleType: {
      type: String,
      enum: ['fixed', 'recurring-annual', 'recurring-irregular'],
      default: 'fixed'
    },
    openDate: { type: Date, default: null },
    deadline: { type: Date, default: null },
    expectedStart: { type: Number, min: 1, max: 12, default: null },
    expectedEnd: { type: Number, min: 1, max: 12, default: null },
    lastDeadline: { type: Date, default: null }
  },
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeGuide',
    default: null
  },
  lastVerifiedAt: { type: Date, default: null },
  isStale: { type: Boolean, default: false },
  isUrlBroken: { type: Boolean, default: false },
  version: { type: Number, default: 1 }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for data source year (FR-LST-07)
listingSchema.virtual('dataSourceYear').get(function() {
  if (this.timeline.lastDeadline) {
    return new Date(this.timeline.lastDeadline).getFullYear();
  }
  return null;
});

// Virtual for confidence level (FR-LST-07) — SRS-specified date-based logic
listingSchema.virtual('confidenceLevel').get(function() {
  const now = new Date();
  // "Confirmed": Listing is curated OR has a deadline set in the current/future cycle
  if (this.isCurated) {
    return 'Confirmed';
  }
  if (this.timeline?.deadline && new Date(this.timeline.deadline) >= new Date(now.getFullYear(), 0, 1)) {
    return 'Confirmed';
  }
  // "Based on [YEAR] Data": Has lastDeadline within 1 year
  // "Approximate — [YEAR] Data": Older
  if (this.timeline?.lastDeadline) {
    const lastYear = new Date(this.timeline.lastDeadline).getFullYear();
    const yearsAgo = now.getFullYear() - lastYear;
    if (yearsAgo <= 1) {
      return `Based on ${lastYear} Data`;
    } else {
      return `Approximate — ${lastYear} Data`;
    }
  }
  return 'Approximate';
});

// Indexes from HLD
listingSchema.index({ status: 1, 'timeline.deadline': 1 });
listingSchema.index({ domainTags: 1 });
listingSchema.index({ 'targetAudience.years': 1 });
listingSchema.index({ 'targetAudience.branches': 1 });
listingSchema.index({ priority: 1, status: 1 });
listingSchema.index({ 'timeline.expectedStart': 1 });
listingSchema.index({ isStale: 1, lastVerifiedAt: 1 });

module.exports = mongoose.model('Listing', listingSchema);

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  actorType: {
    type: String,
    enum: ['user', 'source', 'system'],
    required: true
  },
  category: {
    type: String,
    enum: ['listing', 'user', 'source', 'tag', 'guide', 'notification'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  diff: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ referenceId: 1, category: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

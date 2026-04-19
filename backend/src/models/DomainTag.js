const mongoose = require('mongoose');

const domainTagSchema = new mongoose.Schema({
  tagId: { // We can use _id as slug if we define it as _id: String, but for Mongoose it's often cleaner to just have a slug field
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['role', 'skill', 'sector'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  roadmapUrl: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('DomainTag', domainTagSchema);

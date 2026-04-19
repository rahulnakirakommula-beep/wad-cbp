const mongoose = require('mongoose');

const knowledgeGuideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  linkedListings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  }],
  linkedTags: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('KnowledgeGuide', knowledgeGuideSchema);

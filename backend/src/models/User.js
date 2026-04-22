const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  profile: {
    name: { type: String, required: true },
    branch: { 
      type: String, 
      enum: ['CE', 'EEE', 'ME', 'ECE', 'CSE', 'EIE', 'IT', 'AE', 'CSBS', 'CS-AIML', 'CS-DS', 'CS-IOT', 'AI & DS', 'CS-CyS', 'ECE - VLSI', 'R&AI', 'Bio-Tech']
    },
    currentYear: { 
      type: Number, 
      min: 1, 
      max: 6 
    }
  },
  interests: [{
    type: String
  }],
  role: {
    type: String,
    enum: ['student', 'admin', 'source'],
    default: 'student'
  },
  notificationPrefs: {
    deadlineReminders: { type: Boolean, default: true },
    seasonAlerts: { type: Boolean, default: true },
    dontMissAlerts: { type: Boolean, default: true },
    cancellationAlerts: { type: Boolean, default: true },
    emailEnabled: { type: Boolean, default: true }
  },
  onboardingComplete: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  lastLoginAt: {
    type: Date
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Source'
  },
  verificationToken: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

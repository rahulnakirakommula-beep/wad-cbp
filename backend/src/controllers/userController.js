const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Complete onboarding
// @route   PUT /api/user/onboarding
// @access  Private
const completeOnboarding = asyncHandler(async (req, res) => {
  const { branch, currentYear, interests } = req.body;

  const user = await User.findById(req.user._id);

  if (user) {
    user.profile.branch = branch || user.profile.branch;
    user.profile.currentYear = currentYear || user.profile.currentYear;
    user.interests = interests || user.interests;
    user.onboardingComplete = true;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.profile.name,
      email: updatedUser.email,
      role: updatedUser.role,
      onboardingComplete: updatedUser.onboardingComplete,
      profile: updatedUser.profile,
      interests: updatedUser.interests
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.profile.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      interests: user.interests,
      onboardingComplete: user.onboardingComplete
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user preferences
// @route   PUT /api/user/preferences
// @access  Private
const updatePreferences = asyncHandler(async (req, res) => {
  const { branch, currentYear, interests } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    if (branch) user.profile.branch = branch;
    if (currentYear) user.profile.currentYear = currentYear;
    if (interests) user.interests = interests;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      profile: updatedUser.profile,
      interests: updatedUser.interests
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Change password
// @route   PUT /api/user/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new passwords');
  }

  if (newPassword.length < 8) {
    res.status(400);
    throw new Error('New password must be at least 8 characters');
  }

  const user = await User.findById(req.user._id).select('+passwordHash');

  if (user && (await bcrypt.compare(currentPassword, user.passwordHash))) {
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401);
    throw new Error('Invalid current password');
  }
});

module.exports = {
  completeOnboarding,
  getUserProfile,
  updatePreferences,
  changePassword
};

const asyncHandler = require('express-async-handler');
const User = require('../models/User');

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

module.exports = {
  completeOnboarding,
  getUserProfile
};

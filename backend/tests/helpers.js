const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

/**
 * Creates a test user and returns their token.
 */
const createTestUser = async (role = 'student', isEmailVerified = true) => {
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('Password123', salt);

  const user = await User.create({
    profile: { name: 'Test User' },
    email: `test-${Date.now()}@college.edu`,
    passwordHash,
    role,
    isEmailVerified,
    onboardingComplete: true,
    sourceId: role === 'source' ? new mongoose.Types.ObjectId() : undefined
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  return { user, token };
};

module.exports = {
  createTestUser
};

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { sendEmail } = require('../services/emailService');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    res.status(409);
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const verificationToken = generateVerificationToken({
    email: email.toLowerCase().trim()
  });

  // Create user
  const user = await User.create({
    profile: { name },
    email: normalizedEmail,
    passwordHash: hashedPassword,
    isEmailVerified: true, // DEV_MODE: Auto-verify for easy testing
    role: 'student'
  });

  if (user) {
    // Send verification email (async, don't wait to respond)
    sendEmail({
      email: user.email,
      subject: 'Verify your Account - COA',
      template: 'verify-email',
      data: {
        name: user.profile.name,
        actionUrl: `${process.env.BACKEND_URL || 'http://localhost:5005'}/api/auth/verify?token=${verificationToken}`
      }
    }).catch(err => console.error('Email send failed during signup:', err));
    res.status(201).json({
      _id: user.id,
      name: user.profile.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      onboardingComplete: user.onboardingComplete,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Check for user email
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    if (!user.isEmailVerified) {
      res.status(403);
      throw new Error('Please verify your email first');
    }

    if (user.status === 'suspended') {
      res.status(403);
      throw new Error('Your account has been suspended. Please contact support.');
    }

    user.lastLoginAt = Date.now();
    await user.save();

    res.json({
      _id: user.id,
      name: user.profile.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      profile: user.profile,
      interests: user.interests,
      notificationPrefs: user.notificationPrefs,
      onboardingComplete: user.onboardingComplete,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const generateVerificationToken = (payload) => jwt.sign(
  { ...payload, type: 'email_verification' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// @desc    Verify email address
// @route   GET /api/auth/verify?token=...
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.query.token || req.params.token;

  if (!token) {
    res.status(400);
    throw new Error('Verification token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }

  if (decoded.type !== 'email_verification' || !decoded.email) {
    res.status(400);
    throw new Error('Invalid verification token');
  }

  const user = await User.findOne({
    email: decoded.email,
    verificationToken: token
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }

  user.isEmailVerified = true;
  user.verificationToken = undefined;
  await user.save();

  if (req.query.token) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    return res.redirect(`${frontendUrl}/onboarding`);
  }

  res.json({ message: 'Email verified successfully!' });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user.id,
      name: user.profile.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      profile: user.profile,
      interests: user.interests,
      notificationPrefs: user.notificationPrefs,
      onboardingComplete: user.onboardingComplete,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  getMe
};

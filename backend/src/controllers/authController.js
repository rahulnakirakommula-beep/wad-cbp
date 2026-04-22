const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const { sendEmail } = require('../services/emailService');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(409);
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const user = await User.create({
    profile: { name },
    email,
    passwordHash: hashedPassword,
    isEmailVerified: false, 
    verificationToken,
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
        actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`
      }
    }).catch(err => console.error('Email send failed during signup:', err));
    res.status(201).json({
      _id: user.id,
      name: user.profile.name,
      email: user.email,
      role: user.role,
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
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email }).select('+passwordHash');

  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    if (!user.isEmailVerified) {
      res.status(403);
      throw new Error('Please verify your email first');
    }

    user.lastLoginAt = Date.now();
    await user.save();

    res.json({
      _id: user.id,
      name: user.profile.name,
      email: user.email,
      role: user.role,
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

// @desc    Verify email address
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({ verificationToken: req.params.token });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }

  user.isEmailVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully!' });
});

module.exports = {
  registerUser,
  loginUser,
  verifyEmail
};

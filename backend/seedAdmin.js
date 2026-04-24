/**
 * Seed script to create an admin user.
 * 
 * Usage:
 *   node seedAdmin.js                          → uses defaults below
 *   node seedAdmin.js admin@coa.edu SecureP@ss123
 * 
 * The user is created with:
 *   - role: 'admin'
 *   - isEmailVerified: true
 *   - onboardingComplete: true (admins bypass onboarding)
 *   - status: 'active'
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

const DEFAULT_EMAIL = 'admin@coa.edu';
const DEFAULT_PASSWORD = 'Admin@123';
const DEFAULT_NAME = 'COA Admin';

const seed = async () => {
  const email = process.argv[2] || DEFAULT_EMAIL;
  const password = process.argv[3] || DEFAULT_PASSWORD;
  const name = process.argv[4] || DEFAULT_NAME;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`⚠️  User with email "${email}" already exists (role: ${existing.role}).`);
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        existing.isEmailVerified = true;
        existing.onboardingComplete = true;
        await existing.save();
        console.log(`✅ Promoted existing user to admin.`);
      } else {
        console.log(`ℹ️  Already an admin. No changes made.`);
      }
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    await User.create({
      email,
      passwordHash,
      profile: { name },
      role: 'admin',
      isEmailVerified: true,
      onboardingComplete: true,
      status: 'active'
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role:     admin`);
    console.log(`\n   Login at your frontend URL to access /admin`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

async function checkAndCreateUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const salt = await bcrypt.genSalt(12);
  const commonPassword = await bcrypt.hash('password123', salt);

  const testUsers = [
    {
      email: 'source@test.com',
      role: 'source',
      name: 'Test Source'
    },
    {
      email: 'admin@test.com',
      role: 'admin',
      name: 'Test Admin'
    },
    {
      email: 'student@test.com',
      role: 'student',
      name: 'Test Student'
    }
  ];

  for (const userData of testUsers) {
    let user = await User.findOne({ email: userData.email });
    if (user) {
      user.passwordHash = commonPassword;
      user.status = 'active';
      user.onboardingComplete = true;
      await user.save();
      console.log(`User reset: ${userData.email} / password123`);
    } else {
      await User.create({
        email: userData.email,
        passwordHash: commonPassword,
        role: userData.role,
        isEmailVerified: true,
        status: 'active',
        profile: { name: userData.name },
        onboardingComplete: true
      });
      console.log(`User created: ${userData.email} / password123`);
    }
  }

  await mongoose.disconnect();
}

checkAndCreateUsers().catch(err => {
  console.error(err);
  process.exit(1);
});

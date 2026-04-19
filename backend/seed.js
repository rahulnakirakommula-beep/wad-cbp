require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./src/models/Listing');
const Source = require('./src/models/Source');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Listing.deleteMany({});
    await Source.deleteMany({});
    await User.deleteMany({});

    // Create a Source (Organization)
    const google = await Source.create({
      name: 'Google',
      sourceType: 'company',
      verificationLevel: 'verified',
    });

    const isro = await Source.create({
      name: 'ISRO',
      sourceType: 'scraper',
      verificationLevel: 'official',
    });

    const stripe = await Source.create({
      name: 'Stripe',
      sourceType: 'company',
      verificationLevel: 'verified',
    });

    // Create a Demo Admin
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    await User.create({
      email: 'admin@coa.com',
      passwordHash: adminPassword,
      role: 'admin',
      profile: { name: 'Admin User' },
      isEmailVerified: true,
      onboardingComplete: true
    });

    // Create Listings
    const listings = [
      {
        title: 'SWE Summer Internship 2026',
        orgName: 'Google',
        description: 'Join Google for a summer of code and impact. Work on high-scale systems.',
        sourceId: google._id,
        type: 'internship',
        stipendType: 'paid',
        locationType: 'onsite',
        priority: 'dont-miss',
        status: 'open',
        domainTags: ['backend', 'cloud'],
        timeline: {
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          openDate: new Date()
        },
        externalUrl: 'https://careers.google.com'
      },
      {
        title: 'Rocket Science Research Fellow',
        orgName: 'ISRO',
        description: 'Conduct research at India\'s premier space agency.',
        sourceId: isro._id,
        type: 'research',
        stipendType: 'paid',
        locationType: 'onsite',
        priority: 'high',
        status: 'open',
        domainTags: ['machine-learning', 'data-science'],
        timeline: {
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          openDate: new Date()
        },
        externalUrl: 'https://isro.gov.in/careers'
      },
      {
        title: 'Frontend Developer (React)',
        orgName: 'Stripe',
        description: 'Build the future of online payments with React.',
        sourceId: stripe._id,
        type: 'job',
        stipendType: 'paid',
        locationType: 'remote',
        priority: 'normal',
        status: 'open',
        domainTags: ['frontend'],
        timeline: {
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          openDate: new Date()
        },
        externalUrl: 'https://stripe.com'
      }
    ];

    await Listing.insertMany(listings);
    console.log('Seeding complete! Admin: admin@coa.com / admin123');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();

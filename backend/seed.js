require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./src/models/Listing');
const Source = require('./src/models/Source');
const User = require('./src/models/User');
const UserActivity = require('./src/models/UserActivity');
const DataFlag = require('./src/models/DataFlag');
const bcrypt = require('bcryptjs');

const SOURCES = [
  { name: 'Google', type: 'company', level: 'verified' },
  { name: 'Stripe', type: 'company', level: 'verified' },
  { name: 'Atlassian', type: 'company', level: 'verified' },
  { name: 'Postman', type: 'company', level: 'official' },
  { name: 'Microsoft', type: 'company', level: 'verified' },
  { name: 'ISRO', type: 'scraper', level: 'official' },
  { name: 'DRDO', type: 'scraper', level: 'official' },
  { name: 'Major League Hacking (MLH)', type: 'scraper', level: 'official' },
  { name: 'Devfolio', type: 'scraper', level: 'verified' },
  { name: 'GDSC Campus', type: 'club', level: 'student' },
  { name: 'IEEE Computer Society', type: 'club', level: 'verified' },
  { name: 'IIT Madras Research', type: 'department', level: 'official' },
  { name: 'Unstop', type: 'scraper', level: 'verified' },
  { name: 'MITACS Globalink', type: 'scraper', level: 'official' },
  { name: 'Razorpay', type: 'company', level: 'verified' }
];

const DOMAINS = ['Web Development', 'AI/ML', 'Cybersecurity', 'Data Science', 'UI/UX Design', 'Cloud Computing', 'Blockchain', 'App Development', 'System Design'];
const BRANCHES = ['CE', 'EEE', 'ME', 'ECE', 'CSE', 'EIE', 'IT', 'AE', 'CSBS', 'CS-AIML', 'CS-DS', 'CS-IOT', 'AI & DS', 'CS-CyS', 'ECE - VLSI', 'R&AI', 'Bio-Tech'];
const TYPES = ['internship', 'job', 'research', 'hackathon', 'competition', 'scholarship', 'workshop'];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for high-fidelity seeding...');

    // Clear existing
    await Listing.deleteMany({});
    await Source.deleteMany({});
    await User.deleteMany({});
    await UserActivity.deleteMany({});
    await DataFlag.deleteMany({});

    // 1. Create Sources
    const createdSources = await Source.insertMany(SOURCES.map(s => ({
      name: s.name,
      sourceType: s.type,
      verificationLevel: s.level
    })));
    console.log(`Created ${createdSources.length} sources.`);

    // 2. Create Users
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);
    
    const admin = await User.create({
      email: 'admin@coa.com',
      passwordHash: password,
      role: 'admin',
      profile: { name: 'Super Admin' },
      isEmailVerified: true,
      onboardingComplete: true
    });

    const student = await User.create({
      email: 'audit@coa.com',
      passwordHash: password,
      role: 'student',
      profile: { 
        name: 'Demo Student',
        branch: 'CSE',
        currentYear: 3,
        interests: ['AI/ML', 'Web Development', 'Internships']
      },
      isEmailVerified: true,
      onboardingComplete: true
    });
    console.log('Created Admin and Demo Student.');

    // 3. Create 50+ Listings
    const listings = [];
    
    // Helper to get random item
    const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const rndMultiple = (arr, count) => [...arr].sort(() => 0.5 - Math.random()).slice(0, count);

    for (let i = 1; i <= 60; i++) {
        const source = rnd(createdSources);
        const type = rnd(TYPES);
        const status = i % 10 === 0 ? 'closed' : (i % 8 === 0 ? 'upcoming' : 'open');
        const priority = i % 15 === 0 ? 'dont-miss' : (i % 5 === 0 ? 'high' : 'normal');
        
        // Deadlines spread out
        let deadline = null;
        if (status === 'open') {
            const daysOut = (i % 15) + 1; // 1 to 15 days
            deadline = new Date();
            deadline.setDate(deadline.getDate() + daysOut);
        } else if (status === 'upcoming') {
            deadline = new Date();
            deadline.setDate(deadline.getDate() + 30);
        }

        listings.push({
            title: `${rnd(DOMAINS)} ${type === 'internship' ? 'Summer Intern' : (type === 'research' ? 'Fellowship' : 'Opportunity')} 2026`,
            orgName: source.name,
            description: `A premium opportunity hosted by ${source.name}. This ${type} focuses on ${rnd(DOMAINS)} and related technologies. Applications are processed on a rolling basis.`,
            sourceId: source._id,
            type: type,
            stipendType: Math.random() > 0.3 ? 'paid' : 'unpaid',
            locationType: rnd(['remote', 'onsite', 'hybrid']),
            domainTags: rndMultiple(DOMAINS, 2),
            targetAudience: {
                branches: i % 4 === 0 ? [] : rndMultiple(BRANCHES, 2),
                years: rndMultiple([1, 2, 3, 4], 2)
            },
            status: status,
            priority: priority,
            isCurated: Math.random() > 0.5,
            timeline: {
                deadline: deadline,
                openDate: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000))
            },
            externalUrl: `https://example.com/apply/${i}`,
            version: 1
        });
    }

    const createdListings = await Listing.insertMany(listings);
    console.log(`Successfully generated ${createdListings.length} listings!`);

    // 4. Create associated Activity for Demo Student
    const savedListings = rndMultiple(createdListings.filter(l => l.status === 'open'), 5);
    await UserActivity.insertMany(savedListings.map(l => ({
        userId: student._id,
        listingId: l._id,
        status: 'saved'
    })));

    // 5. Create some Flags for Admin Preview
    const flaggedListings = rndMultiple(createdListings, 3);
    await DataFlag.insertMany(flaggedListings.map((l, i) => ({
        listingId: l._id,
        reporterId: student._id,
        issueType: i === 0 ? 'dead_link' : (i === 1 ? 'wrong_deadline' : 'other'),
        proposedFix: i === 0 ? 'New link is coa.com/apply' : 'Deadline is actually tomorrow.',
        status: 'pending'
    })));

    console.log('--- SEEDING COMPLETE ---');
    console.log('Student: audit@coa.com / password123');
    console.log('Admin: admin@coa.com / password123');
    process.exit(0);

  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();

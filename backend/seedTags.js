const mongoose = require('mongoose');
const DomainTag = require('./src/models/DomainTag');
require('dotenv').config();

const seedTags = [
  { tagId: 'frontend', displayName: 'Frontend', category: 'skill', isActive: true },
  { tagId: 'backend', displayName: 'Backend', category: 'skill', isActive: true },
  { tagId: 'fullstack', displayName: 'Fullstack', category: 'skill', isActive: true },
  { tagId: 'mobile', displayName: 'Mobile App Dev', category: 'skill', isActive: true },
  { tagId: 'ai', displayName: 'Artificial Intelligence', category: 'skill', isActive: true },
  { tagId: 'ds', displayName: 'Data Science', category: 'skill', isActive: true },
  { tagId: 'sde', displayName: 'Software Engineer', category: 'role', isActive: true },
  { tagId: 'product', displayName: 'Product Management', category: 'role', isActive: true },
  { tagId: 'fintech', displayName: 'FinTech', category: 'sector', isActive: true },
  { tagId: 'edtech', displayName: 'EdTech', category: 'sector', isActive: true },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await DomainTag.deleteMany({});
    console.log('Cleared existing tags');

    await DomainTag.insertMany(seedTags);
    console.log('Seeded tags successfully');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();

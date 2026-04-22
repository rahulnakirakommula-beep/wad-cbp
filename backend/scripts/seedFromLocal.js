const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const models = {
  User: require('../src/models/User'),
  Listing: require('../src/models/Listing'),
  Source: require('../src/models/Source'),
  DomainTag: require('../src/models/DomainTag'),
  KnowledgeGuide: require('../src/models/KnowledgeGuide'),
  UserActivity: require('../src/models/UserActivity'),
  Notification: require('../src/models/Notification'),
  DataFlag: require('../src/models/DataFlag'),
  AuditLog: require('../src/models/AuditLog')
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coa_local');
  console.log('Connected to local DB for extraction...');

  const data = {};

  for (const [name, Model] of Object.entries(models)) {
    console.log(`Extracting ${name}...`);
    data[name] = await Model.find({});
  }

  const outputPath = path.join(__dirname, '../tests/seedData.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`Data extracted to ${outputPath}`);

  await mongoose.connection.close();
  process.exit(0);
}

seed();

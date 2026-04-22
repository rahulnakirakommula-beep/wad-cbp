const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_123';
process.env.NODE_ENV = 'test';

jest.setTimeout(30000);

let mongod;

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

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  
  // Auto-seed if seed data exists
  const seedPath = path.join(__dirname, 'seedData.json');
  if (fs.existsSync(seedPath)) {
    const data = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    for (const [modelName, docs] of Object.entries(data)) {
      if (models[modelName] && docs.length > 0) {
        await models[modelName].insertMany(docs);
      }
    }
    console.log('Test database seeded from seedData.json');
  }
};

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
  if (mongoose.connection) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
};

/**
 * Clear all collections.
 */
module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};

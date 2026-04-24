const mongoose = require('mongoose');

const initializeDatabase = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log(`BluePenguin DB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', err => {
      console.error(`BluePenguin DB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('BluePenguin DB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('BluePenguin DB reconnected.');
    });

  } catch (error) {
    console.error(`BluePenguin DB Connection Failure: ${error.message}`);
    process.exit(1);
  }
};

module.exports = initializeDatabase;



require('dotenv').config();
const mongoose = require('mongoose');

const dropIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const listingCollection = collections.find(c => c.name === 'listings');
    
    if (listingCollection) {
      await mongoose.connection.db.collection('listings').dropIndexes();
      console.log('Successfully dropped all indexes for listings collection.');
    } else {
      console.log('Listings collection does not exist.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error dropping indexes:', err);
    process.exit(1);
  }
};

dropIndexes();

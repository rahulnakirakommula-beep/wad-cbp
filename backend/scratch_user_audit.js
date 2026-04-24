require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const dbCheck = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to:', process.env.MONGODB_URI);

        const users = await User.find({}).select('+passwordHash');
        console.log('Total Users:', users.length);
        users.forEach(u => {
            console.log(`- ${u.email} (Verified: ${u.isEmailVerified}, Hash: ${u.passwordHash?.substring(0, 10)}...)`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

dbCheck();

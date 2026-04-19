require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => res.send('COA API is running...'));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/user', require('./src/routes/userRoutes'));
app.use('/api/feed', require('./src/routes/feedRoutes'));
app.use('/api/listings', require('./src/routes/listingRoutes'));
app.use('/api/activity', require('./src/routes/activityRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

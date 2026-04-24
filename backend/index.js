require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initializeDatabase = require('./src/config/db');
const { initCronJobs } = require('./src/services/cronService');
const { apiLimiter } = require('./src/middleware/rateLimitMiddleware');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');

// Connect Database
const startServer = async () => {
  if (process.env.NODE_ENV !== 'test') {
    await initializeDatabase();
  }

  // Initialize Cron Jobs
  if (process.env.NODE_ENV !== 'test') {
    initCronJobs();
  }
};

startServer();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', apiLimiter); // Apply global rate limit to all /api routes

// Basic Route
app.get('/', (req, res) => res.send('COA API is running...'));

// Health Check
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/user', require('./src/routes/userRoutes'));
app.use('/api/feed', require('./src/routes/feedRoutes'));
app.use('/api/listings', require('./src/routes/listingRoutes'));
app.use('/api/activity', require('./src/routes/activityRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/tags', require('./src/routes/tagRoutes'));
app.use('/api/guides', require('./src/routes/guideRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/org', require('./src/routes/organisationRoutes'));
app.use('/api/meta', require('./src/routes/metaRoutes'));

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
 

const cron = require('node-cron');
const Listing = require('../models/Listing');
const UserActivity = require('../models/UserActivity');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail } = require('./emailService');
const { cacheRecommendations } = require('../config/redis');
const { computeFeedSectionsForUser } = require('../controllers/feedController');

/**
 * Initialize all cron jobs
 */
const initCronJobs = () => {
  console.log('Initializing Background Tasks...');

  // 1. Every Hour: Status Transitions & Activity Cleanup (FR-JOB-01)
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running Status Transitions & Activity Cleanup...');
    try {
      const now = new Date();

      // (1) Open upcoming listings reaching their openDate
      const opened = await Listing.updateMany(
        { status: 'upcoming', 'timeline.openDate': { $lte: now } },
        { status: 'open' }
      );
      if (opened.modifiedCount > 0) console.log(`[CRON] Opened ${opened.modifiedCount} upcoming listings.`);

      // (2) Close open listings reaching their deadline
      // Need to handle deadline -> lastDeadline copy, so we find them first
      const toClose = await Listing.find({
        status: 'open',
        'timeline.deadline': { $lte: now }
      });

      for (const listing of toClose) {
        listing.timeline.lastDeadline = listing.timeline.deadline;
        listing.status = 'closed';
        await listing.save();

        // (3) Mark UserActivities as missed
        const missedResults = await UserActivity.updateMany(
          { listingId: listing._id, status: 'saved' },
          { status: 'missed', statusUpdatedAt: listing.timeline.deadline }
        );
        if (missedResults.modifiedCount > 0) {
          console.log(`[CRON] Marked ${missedResults.modifiedCount} users as missed for: ${listing.title}`);
        }
      }

      if (toClose.length > 0) console.log(`[CRON] Closed ${toClose.length} expired listings.`);
    } catch (error) {
      console.error('[CRON] Error in Status Transition Cron:', error);
    }
  });

  // 2. Every Day at 8:00 AM: Deadline Reminders (FR-JOB-02)
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Checking for Upcoming Deadline Reminders...');
    try {
      const now = new Date();
      const threeDaysOutStart = new Date(now);
      threeDaysOutStart.setDate(now.getDate() + 3);
      threeDaysOutStart.setHours(0, 0, 0, 0);
      const threeDaysOutEnd = new Date(threeDaysOutStart);
      threeDaysOutEnd.setHours(23, 59, 59, 999);

      const oneDayOutStart = new Date(now);
      oneDayOutStart.setDate(now.getDate() + 1);
      oneDayOutStart.setHours(0, 0, 0, 0);
      const oneDayOutEnd = new Date(oneDayOutStart);
      oneDayOutEnd.setHours(23, 59, 59, 999);

      // (A) 3-Day Reminders
      const listings3d = await Listing.find({
        status: 'open',
        'timeline.deadline': { $gte: threeDaysOutStart, $lte: threeDaysOutEnd }
      });
      await processReminders(listings3d, 'deadline_3day', '3 days', true);

      // (B) 1-Day Reminders
      const listings1d = await Listing.find({
        status: 'open',
        'timeline.deadline': { $gte: oneDayOutStart, $lte: oneDayOutEnd }
      });
      await processReminders(listings1d, 'deadline_1day', '24 hours', false);

    } catch (error) {
      console.error('[CRON] Error in Deadline Reminders Cron:', error);
    }
  });

  // 3. Weekly (Sunday at 2:00 AM): Staleness Flagging (FR-JOB-03)
  cron.schedule('0 2 * * 0', async () => {
    console.log('[CRON] Running Staleness Flagging...');
    try {
      const nineMonthsAgo = new Date();
      nineMonthsAgo.setDate(nineMonthsAgo.getDate() - 270);

      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const results = await Listing.updateMany(
        {
          status: { $ne: 'closed' },
          $or: [
            { lastVerifiedAt: { $lt: nineMonthsAgo } },
            { 'timeline.lastDeadline': { $lt: twoYearsAgo } }
          ]
        },
        { isStale: true }
      );
      if (results.modifiedCount > 0) console.log(`[CRON] Flagged ${results.modifiedCount} listings as stale.`);
    } catch (error) {
      console.error('[CRON] Error in Staleness Cron:', error);
    }
  });

  // 4. Monthly (1st at 9:00 AM): Season Window Reminders (FR-JOB-04)
  cron.schedule('0 9 1 * *', async () => {
    console.log('[CRON] Running Season Window Notifications...');
    try {
      // Find listings where openDate is in the current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59, 999);

      const openingSoon = await Listing.find({
        status: 'upcoming',
        'timeline.openDate': { $gte: startOfMonth, $lte: endOfMonth }
      });

      for (const listing of openingSoon) {
        // Find users interested in this listing's tags
        const interestedUsers = await User.find({
          status: 'active',
          'notificationPrefs.seasonAlerts': true,
          interests: { $in: listing.domainTags }
        });

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        for (const user of interestedUsers) {
          // Dedup: exact (userId, listingId, type)
          const exists = await Notification.findOne({
            userId: user._id,
            listingId: listing._id,
            type: 'season_open'
          });
          if (exists) continue;

          // FR-NOT-08: Frequency cap — max 1 season_open per domain-category per user per month
          // Check if user already got a season_open this month for any listing sharing a domain tag
          const recentSeason = await Notification.findOne({
            userId: user._id,
            type: 'season_open',
            createdAt: { $gte: startOfMonth }
          });
          if (recentSeason) continue;

          await Notification.create({
            userId: user._id,
            listingId: listing._id,
            type: 'season_open',
            payload: {
              title: 'Season Opening Soon',
              message: `${listing.title} at ${listing.orgName} is expected to open its application window this month.`,
              actionUrl: `/app/listing/${listing._id}`
            }
          });
        }
      }
    } catch (error) {
      console.error('[CRON] Error in Season Window Cron:', error);
    }
  });

  // 5. Every 30 Minutes: Feed Pre-computation Cache Warmup (FR-FEED-06)
  cron.schedule('*/30 * * * *', async () => {
    console.log('[CRON] Warming recommended feed cache...');
    try {
      const users = await User.find({
        role: 'student',
        status: 'active',
        isEmailVerified: true,
        onboardingComplete: true
      });

      for (const user of users) {
        const sections = await computeFeedSectionsForUser(user);
        await cacheRecommendations(user._id, sections);
      }
    } catch (error) {
      console.error('[CRON] Error in Feed Cache Warmup Cron:', error);
    }
  });
};

/**
 * Helper to process reminders for a set of listings
 */
async function processReminders(listings, type, timeStr, sendEmailNotif) {
  for (const listing of listings) {
    const savedActivities = await UserActivity.find({
      listingId: listing._id,
      status: 'saved'
    }).populate('userId');

    for (const activity of savedActivities) {
      const user = activity.userId;
      if (!user || user.status !== 'active') continue;

      // Check user preferences for deadline reminders
      if (!user.notificationPrefs?.deadlineReminders) continue;

      const exists = await Notification.findOne({ userId: user._id, listingId: listing._id, type });
      if (exists) continue;

      // Create in-app notification
      await Notification.create({
        userId: user._id,
        listingId: listing._id,
        type,
        payload: {
          title: 'Deadline Approaching',
          message: `${listing.title} at ${listing.orgName} closes in ${timeStr}.`,
          actionUrl: `/app/listing/${listing._id}`
        }
      });

      // Send email if enabled and required for this type
      if (sendEmailNotif && user.notificationPrefs?.emailEnabled) {
        await sendEmail({
          email: user.email,
          subject: `Closing Soon: ${listing.title}`,
          template: 'deadline-reminder',
          data: {
            name: user.profile.name,
            listingTitle: listing.title,
            orgName: listing.orgName,
            deadline: new Date(listing.timeline.deadline).toLocaleDateString(),
            actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/app/listing/${listing._id}`
          }
        });
      }
    }
  }
}

module.exports = { initCronJobs };

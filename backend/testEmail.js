require('dotenv').config();
const { sendEmail } = require('./src/services/emailService');

const test = async () => {
  console.log('--- Email Test Script ---');
  console.log('Target Email:', process.env.SMTP_USER);
  
  try {
    const result = await sendEmail({
      email: process.env.SMTP_USER,
      subject: 'COA System Test',
      template: 'listing-cancelled', // Use an existing template
      data: {
        name: 'System Test User',
        listingTitle: 'The Great Internship',
        orgName: 'Test Org',
        actionUrl: 'http://localhost:5174/app/feed'
      }
    });
    
    if (result && result.messageId) {
      console.log('✅ Success! Message ID:', result.messageId);
    } else {
      console.log('❌ Failed. No message ID returned.');
    }
  } catch (err) {
    console.error('❌ Error during test send:', err.message);
  }
  process.exit();
};

test();

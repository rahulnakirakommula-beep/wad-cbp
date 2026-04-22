const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

// Configure Transporter (Default to Mailtrap/Ghost setup if not provided)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send an email using an EJS template
 */
const sendEmail = async (options) => {
  const templatePath = path.join(__dirname, '../views/emails', `${options.template}.ejs`);
  
  try {
    const html = await ejs.renderFile(templatePath, options.data || {});

    const mailOptions = {
      from: '"COA Notifications" <no-reply@coa.com>',
      to: options.email,
      subject: options.subject,
      html
    };

    if (process.env.NODE_ENV === 'test') {
      console.log('Skipping email send in test mode:', options.subject);
      return { messageId: 'test-id' };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw - notifications failing shouldn't crash the cron job
  }
};

module.exports = { sendEmail };

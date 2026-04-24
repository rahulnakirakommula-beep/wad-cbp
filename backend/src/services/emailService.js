const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

// Configure Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
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
      from: process.env.SMTP_FROM || '"COA Notifications" <no-reply@coa.com>',
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

const nodemailer = require('nodemailer');

const TARGET_EMAIL = process.env.SUPPORT_RECEIVER_EMAIL || 'connectwithguniganti@gmail.com';

/**
 * Creates and returns a configured Nodemailer transporter
 */
const getTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: parseInt(process.env.SMTP_PORT, 10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Fallback for direct Gmail service
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  return null;
};

/**
 * Sends support request email to connectwithguniganti@gmail.com
 */
const sendSupportEmail = async ({ name, email, subject, message, ticketId, userId }) => {
  const transporter = getTransporter();

  const formattedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #06b6d4, #4f46e5); padding: 24px; color: #ffffff; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
        .content { padding: 28px; }
        .field { margin-bottom: 18px; }
        .label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; display: block; }
        .value { font-size: 14px; color: #0f172a; font-weight: 500; }
        .message-box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; font-size: 14px; color: #1e293b; white-space: pre-wrap; line-height: 1.6; }
        .footer { background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
        .tag { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📩 New Support Request — Project Partner Finder</h1>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Subject</span>
            <div class="value" style="font-size: 16px; font-weight: 700; color: #0284c7;">${subject}</div>
          </div>
          <div style="display: flex; gap: 16px; margin-bottom: 18px;">
            <div class="field" style="flex: 1;">
              <span class="label">Sender Name</span>
              <div class="value">${name}</div>
            </div>
            <div class="field" style="flex: 1;">
              <span class="label">Sender Email</span>
              <div class="value"><a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a></div>
            </div>
          </div>
          ${ticketId ? `
          <div class="field">
            <span class="label">Ticket ID / Reference</span>
            <span class="tag">#${ticketId}</span>
          </div>
          ` : ''}
          <div class="field">
            <span class="label">Detailed Message</span>
            <div class="message-box">${message}</div>
          </div>
        </div>
        <div class="footer">
          Received via Project Partner Finder Contact Support Portal • ${new Date().toUTCString()}
        </div>
      </div>
    </body>
    </html>
  `;

  const plainText = `
New Support Request - Project Partner Finder
--------------------------------------------
From: ${name} (${email})
Subject: ${subject}
Ticket ID: ${ticketId || 'N/A'}
Date: ${new Date().toUTCString()}

Message:
${message}
--------------------------------------------
Reply directly to this email to respond to ${email}.
  `;

  const mailOptions = {
    from: `"PartnerFinder Support" <${process.env.SMTP_FROM || process.env.EMAIL_USER || 'support@projectpartnerfinder.com'}>`,
    to: TARGET_EMAIL,
    replyTo: email,
    subject: `[PartnerFinder Support] ${subject}`,
    text: plainText,
    html: formattedHtml
  };

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`[EMAIL DISPATCH NOTICE] No SMTP credentials configured in .env.`);
    console.log(`Target Recipient: ${TARGET_EMAIL}`);
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: [PartnerFinder Support] ${subject}`);
    console.log(`Message Preview: ${message.substring(0, 100)}...`);
    console.log(`======================================================\n`);
    return { success: true, delivered: false, simulated: true, recipient: TARGET_EMAIL };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Support Email Sent] Message ID: ${info.messageId} to ${TARGET_EMAIL}`);
    return { success: true, delivered: true, messageId: info.messageId, recipient: TARGET_EMAIL };
  } catch (error) {
    console.error(`[Support Email Error] Failed to send email to ${TARGET_EMAIL}:`, error.message);
    return { success: false, delivered: false, error: error.message, recipient: TARGET_EMAIL };
  }
};

module.exports = {
  sendSupportEmail,
  TARGET_EMAIL
};

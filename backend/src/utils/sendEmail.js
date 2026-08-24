const nodemailer = require('nodemailer');

/**
 * Send email utility with support for SMTP and Gmail App Passwords.
 * If credentials are not configured, it logs the email to console for development testing.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const fromName = process.env.EMAIL_FROM_NAME || 'গাড়ি লাগবে (Gari Lagbe)';
  const fromEmail = process.env.EMAIL_FROM || user || 'support@gari-lagbe.com';

  // If no email credentials configured, log and resolve gracefully (Development mode)
  if (!user || !pass) {
    console.log('\n================== 📧 EMAIL MOCK (DEV MODE) ==================');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`From: "${fromName}" <${fromEmail}>`);
    console.log('Body Text:');
    console.log(text || html);
    console.log('ℹ️ আসল ইমেইল পাঠানোর জন্য backend/.env ফাইলে EMAIL_USER এবং EMAIL_PASS যুক্ত করুন।');
    console.log('==============================================================\n');
    return { success: true, mock: true, message: 'Email logged to console in dev mode.' };
  }

  // Create Nodemailer Transporter
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false, // Avoid self-signed certificate failures
    },
  });

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text: text || '',
    html: html || '',
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 ইমেইল সফলভাবে পাঠানো হয়েছে: ${info.messageId} -> ${to}`);
  return { success: true, messageId: info.messageId };
};

/**
 * Generate a responsive branded HTML template for admin replies
 */
const generateReplyEmailHtml = ({ visitorName, originalMessage, adminReply }) => {
  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>গাড়ি লাগবে - বার্তার উত্তর</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #065f46, #047857); color: #ffffff; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0 0 8px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 32px 24px; color: #1f2937; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #111827; }
    .reply-box { background-color: #ecfdf5; border-left: 4px solid #059669; padding: 18px; border-radius: 8px; font-size: 15px; line-height: 1.6; color: #064e3b; margin: 20px 0; }
    .original-box { background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; font-size: 13px; color: #6b7280; line-height: 1.5; margin-top: 24px; }
    .original-title { font-weight: 700; color: #4b5563; margin-bottom: 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af; }
    .footer a { color: #059669; text-decoration: none; font-weight: 600; }
    .btn { display: inline-block; margin-top: 20px; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 28px; border-radius: 8px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 গাড়ি লাগবে</h1>
      <p>বিশ্বস্ত কার রেন্টাল প্লাটফর্ম</p>
    </div>
    <div class="content">
      <div class="greeting">প্রিয় ${visitorName},</div>
      <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
        আমাদের সাথে যোগাযোগ করার জন্য ধন্যবাদ। আপনার পাঠানো বার্তার পরিপ্রেক্ষিতে গাড়ি লাগবে সাপোর্ট টিম থেকে এই উত্তরটি প্রদান করা হলো:
      </p>

      <div class="reply-box">
        ${adminReply.replace(/\n/g, '<br/>')}
      </div>

      <div style="text-align: center;">
        <a href="http://localhost:5173" class="btn">ওয়েবসাইট ভিজিট করুন</a>
      </div>

      <div class="original-box">
        <div class="original-title">আপনার মূল বার্তা:</div>
        "${originalMessage.replace(/\n/g, '<br/>')}"
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;">যেকোনো জরুরি প্রয়োজনে কল করুন: <strong>+৮৮০ ১৭১১-২৩৪৫৬৭</strong></p>
      <p style="margin: 0;">ইমেইল: <a href="mailto:support@gari-lagbe.com">support@gari-lagbe.com</a> • ধানমন্ডি ৩২, ঢাকা</p>
      <p style="margin: 12px 0 0 0; font-size: 11px;">© ${new Date().getFullYear()} গাড়ি লাগবে (Gari Lagbe). সর্বস্বত্ব সংরক্ষিত।</p>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = {
  sendEmail,
  generateReplyEmailHtml,
};

const nodemailer = require('nodemailer');

/**
 * Send password reset email
 * Supports Resend API (via direct fetch or key) and Nodemailer (SMTP).
 * In development, prints the reset link to the console if email credentials are not configured.
 */
async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const emailFrom = process.env.EMAIL_FROM || '"Discover with Ankur" <noreply@discoverwithankur.com>';
  const subject = 'Password Reset Request - Discover with Ankur';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          color: #0f172a;
          margin: 0;
          padding: 24px;
        }
        .card {
          max-width: 540px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 32px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
          text-align: center;
          margin-bottom: 24px;
        }
        .header h1 {
          font-family: Georgia, serif;
          font-size: 22px;
          color: #4f46e5;
          margin: 0 0 8px 0;
        }
        .header p {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }
        .content {
          font-size: 14px;
          line-height: 1.6;
          color: #334155;
          margin-bottom: 24px;
        }
        .button-wrapper {
          text-align: center;
          margin: 28px 0;
        }
        .btn {
          display: inline-block;
          background-color: #4f46e5;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 28px;
          font-weight: 600;
          font-size: 14px;
          border-radius: 8px;
        }
        .note {
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
          margin-top: 24px;
          border-top: 1px solid #e2e8f0;
          padding-top: 16px;
        }
        .url-box {
          word-break: break-all;
          background-color: #f1f5f9;
          padding: 8px 12px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 11px;
          color: #475569;
          margin-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Discover with Ankur</h1>
          <p>Administrator Account Security</p>
        </div>
        <div class="content">
          <p>Hello <strong>${name || 'Admin'}</strong>,</p>
          <p>A request was received to reset the password for your administrator account on <strong>Discover with Ankur</strong>.</p>
          <p>Click the button below to choose a new password. This link is single-use and will expire in <strong>30 minutes</strong>.</p>
          
          <div class="button-wrapper">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Administrator Password</a>
          </div>

          <p>If the button above does not work, you can copy and paste this link into your browser:</p>
          <div class="url-box">${resetUrl}</div>
          
          <div class="note">
            <p><strong>Security Note:</strong> If you did not request a password reset, you can safely ignore this email. Your existing password will remain unchanged and your account is secure.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Resend API configured
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [to],
          subject: subject,
          html: htmlContent
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send via Resend API');
      }
      return { success: true, provider: 'resend', id: data.id };
    } catch (err) {
      console.error('Error sending reset email via Resend:', err.message);
      // If Resend fails, fall through to check SMTP or dev log
    }
  }

  // 2. SMTP configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const info = await transporter.sendMail({
        from: emailFrom,
        to: to,
        subject: subject,
        html: htmlContent
      });

      return { success: true, provider: 'smtp', id: info.messageId };
    } catch (err) {
      console.error('Error sending reset email via SMTP:', err.message);
    }
  }

  // 3. Fallback: Development logging
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n======================================================');
    console.log('📧 [DEV ONLY] PASSWORD RESET EMAIL SIMULATION');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Reset Link: ${resetUrl}`);
    console.log('======================================================\n');
    return { success: true, provider: 'dev-console' };
  }

  console.warn('⚠️ [PRODUCTION WARNING] Email service not configured (RESEND_API_KEY or SMTP_* missing). Password reset email could not be sent.');
  return { success: false, error: 'Email delivery not configured' };
}

module.exports = {
  sendPasswordResetEmail
};

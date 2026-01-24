"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTML_TEMPLATES = exports.EMAIL_TEMPLATES = exports.SENDGRID_TEMPLATE_ID = void 0;
const getLogoHtml = () => {
    return `
    <div style="margin-bottom: 20px; text-align: center;">
      <span style="font-size: 42px; font-weight: 700; color: white; letter-spacing: -1.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">VeloLink</span>
    </div>
  `;
};
exports.SENDGRID_TEMPLATE_ID = process.env.SENDGRID_TEMPLATE_ID || 'd-your-template-id';
exports.EMAIL_TEMPLATES = {
    WELCOME: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Welcome Email',
        description: 'Welcome new users to the platform',
        subject: 'Welcome to VeloLink!',
        requiredVariables: ['user_name'],
    },
    CREATOR_WELCOME: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Creator Welcome Email',
        description: 'Welcome new creators with optional waitlist bonus info',
        subject: 'Welcome to Velo, Creator!',
        requiredVariables: ['creator_name', 'has_waitlist_bonus', 'bonus_amount', 'sales_required'],
    },
    EMAIL_VERIFICATION: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Email Verification',
        description: 'Verify user email address',
        subject: 'Verify your email address',
        requiredVariables: ['user_name', 'verification_link', 'expiry_time'],
    },
    PASSWORD_RESET: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Password Reset',
        description: 'Send password reset link',
        subject: 'Reset your password',
        requiredVariables: ['user_name', 'reset_link', 'expiry_time'],
    },
    TWO_FACTOR_ENABLED: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: '2FA Enabled',
        description: 'Notify user that 2FA was enabled',
        subject: 'Two-Factor Authentication Enabled',
        requiredVariables: ['user_name', 'enabled_date', 'ip_address'],
    },
    TWO_FACTOR_DISABLED: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: '2FA Disabled',
        description: 'Notify user that 2FA was disabled',
        subject: 'Two-Factor Authentication Disabled',
        requiredVariables: ['user_name', 'disabled_date', 'ip_address'],
    },
    ACCOUNT_VERIFIED: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Account Verified',
        description: 'Confirmation that account is verified',
        subject: 'Your account has been verified',
        requiredVariables: ['user_name', 'verification_date'],
    },
    PASSWORD_CHANGED: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Password Changed',
        description: 'Notify user of password change',
        subject: 'Your password was changed',
        requiredVariables: ['user_name', 'change_date', 'ip_address'],
    },
    SECURITY_ALERT: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Security Alert',
        description: 'Alert user of suspicious activity',
        subject: 'Security Alert: Unusual Activity Detected',
        requiredVariables: ['user_name', 'activity_description', 'activity_date', 'ip_address'],
    },
    PURCHASE_RECEIPT: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Purchase Receipt',
        description: 'Send purchase receipt',
        subject: 'Receipt for your purchase',
        requiredVariables: ['buyer_email', 'content_title', 'amount', 'date', 'access_link'],
    },
    CREATOR_SALE_NOTIFICATION: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Creator Sale Notification',
        description: 'Notify creator of new sale',
        subject: 'New Sale: Someone purchased your content!',
        requiredVariables: ['creator_name', 'content_title', 'amount', 'date'],
    },
    PAYOUT_PROCESSED: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Payout Processed',
        description: 'Notify creator of payout',
        subject: 'Your payout has been processed',
        requiredVariables: ['creator_name', 'amount', 'payout_date', 'transaction_id'],
    },
    ADMIN_PAYOUT_REQUEST_ALERT: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Admin Payout Request Alert',
        description: 'Alert admins of new payout request',
        subject: 'New Payout Request - Action Required',
        requiredVariables: ['creator_name', 'amount', 'request_id', 'available_balance'],
    },
    PAYOUT_APPROVED: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Payout Approved',
        description: 'Notify creator that payout request was approved',
        subject: 'Payout Request Approved',
        requiredVariables: ['creator_name', 'amount', 'request_id'],
    },
    PAYOUT_REJECTED: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Payout Rejected',
        description: 'Notify creator that payout request was rejected',
        subject: 'Payout Request Status Update',
        requiredVariables: ['creator_name', 'amount', 'reason'],
    },
    CONTENT_APPROVED: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Content Approved',
        description: 'Notify creator that content was approved',
        subject: 'Your content has been approved!',
        requiredVariables: ['creator_name', 'content_title', 'content_link'],
    },
    CONTENT_REJECTED: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Content Rejected',
        description: 'Notify creator that content was rejected',
        subject: 'Content Review Update',
        requiredVariables: ['creator_name', 'content_title', 'rejection_reason'],
    },
    ACCOUNT_DELETION: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Account Deletion',
        description: 'Confirm account deletion',
        subject: 'Your account deletion request',
        requiredVariables: ['user_name', 'deletion_date'],
    },
    NEWSLETTER: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Newsletter',
        description: 'Monthly newsletter',
        subject: 'Velo Newsletter',
        requiredVariables: ['user_name', 'newsletter_content'],
    },
    SUPPORT_TICKET_RECEIVED: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Support Ticket Received',
        description: 'Confirm support ticket submission',
        subject: 'We received your support request',
        requiredVariables: ['user_name', 'ticket_id', 'subject'],
    },
    SUPPORT_TICKET_REPLY: {
        id: exports.SENDGRID_TEMPLATE_ID,
        name: 'Support Ticket Reply',
        description: 'Notify of support ticket reply',
        subject: 'Update on your support ticket',
        requiredVariables: ['user_name', 'ticket_id', 'reply_message'],
    },
};
const baseStyles = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background: #f3f4f6; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
  .header { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: white; padding: 40px 30px; text-align: center; }
  .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
  .content { padding: 40px 30px; }
  .content p { margin: 0 0 16px 0; color: #4b5563; font-size: 16px; }
  .button { display: inline-block; padding: 14px 32px; background: #4f46e5; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 10px 0; }
  .button:hover { background: #4338ca; }
  .info-box { background: #f9fafb; border-left: 4px solid #4f46e5; padding: 16px; margin: 20px 0; border-radius: 4px; }
  .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px; }
  .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px; }
  .danger-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px; }
  .footer { padding: 30px; text-align: center; font-size: 14px; color: #6b7280; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  .divider { height: 1px; background: #e5e7eb; margin: 30px 0; }
  .text-center { text-align: center; }
  .text-sm { font-size: 14px; }
  .text-xs { font-size: 12px; }
  .mt-20 { margin-top: 20px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
  th { background: #f9fafb; font-weight: 600; color: #1f2937; }
  .amount { font-size: 24px; font-weight: bold; color: #4f46e5; }
`;
exports.HTML_TEMPLATES = {
    WELCOME: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${getLogoHtml()}
      <h1>🎉 Welcome to VeloLink!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>Welcome to VeloLink! We're thrilled to have you join our community of creators and content enthusiasts.</p>

      <div class="success-box">
        <p style="margin: 0;"><strong>✨ Your journey starts here!</strong></p>
      </div>

      <p>Velo is the premier platform for sharing and monetizing digital content. Whether you're a creator looking to share your work or a buyer seeking exclusive content, you're in the right place.</p>

      <h3>What you can do:</h3>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li>Browse and purchase exclusive content</li>
        <li>Become a creator and monetize your digital content</li>
        <li>Secure transactions with instant access</li>
        <li>Track your purchases and manage your account</li>
      </ul>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL || 'https://velolink.club'}" class="button">Explore Velo</a>
      </div>

      <p class="text-sm" style="margin-top: 30px;">If you have any questions, our support team is always here to help!</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
      <p class="text-xs">Secure content marketplace for creators and buyers</p>
    </div>
  </div>
</body>
</html>
  `,
    CREATOR_WELCOME: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${getLogoHtml()}
      <h1>Welcome to Velo, Creator!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.creator_name}</strong>,</p>
      <p>Congratulations on joining Velo as a creator! We're excited to have you on board and can't wait to see what you'll create.</p>

      ${data.has_waitlist_bonus ? `
      <div class="success-box">
        <p style="margin: 0 0 8px 0;"><strong>🎁 Waitlist Bonus Unlocked!</strong></p>
        <p style="margin: 0;">As a thank you for being on our waitlist, you've received a <strong class="amount">$${data.bonus_amount}</strong> bonus!</p>
      </div>

      <div class="info-box">
        <p style="margin: 0 0 8px 0;"><strong>💡 How to unlock your bonus:</strong></p>
        <p style="margin: 0;">Your $${data.bonus_amount} bonus will be available for withdrawal once you make <strong>${data.sales_required} sales</strong>. Start uploading your content and sharing with your audience!</p>
      </div>
      ` : ''}

      <h3>Get Started:</h3>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li><strong>Complete your profile</strong> - Add a bio and profile image to attract buyers</li>
        <li><strong>Upload your first content</strong> - Share your exclusive digital content</li>
        <li><strong>Set up payouts</strong> - Add your bank details to receive earnings</li>
        <li><strong>Verify your identity</strong> - Complete KYC to unlock all features</li>
      </ul>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL || 'https://velo.com'}/creator/dashboard" class="button">Go to Creator Dashboard</a>
      </div>

      <div class="divider"></div>

      <h3>Creator Benefits:</h3>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li>Keep <strong>85%</strong> of every sale</li>
        <li>Instant access for your buyers</li>
        <li>Secure content hosting</li>
        <li>Analytics to track your performance</li>
      </ul>

      <p class="text-sm" style="margin-top: 30px;">Questions? Our support team is here to help you succeed!</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Velo. All rights reserved.</p>
      <p class="text-xs">Welcome to the creator economy!</p>
    </div>
  </div>
</body>
</html>
  `,
    WELCOME_CREATOR_WAITLIST: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${getLogoHtml()}
      <h1>🎉 Welcome to Velo, ${data.user_name}!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>Welcome to VeloLink! We're excited to see you here. As a valued member from our early waitlist, you have special benefits waiting for you.</p>

      <div class="success-box">
        <p style="margin: 0;"><strong>🎁 Waitlist Bonus: $50.00 Unlocked!</strong></p>
      </div>

      <h3>How Your Waitlist Bonus Works:</h3>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li>💰 You've received a <strong>$50.00 creator bonus</strong></li>
        <li>🔓 <strong>Bonus unlocks after 5 successful sales</strong> - your balance will then be available for withdrawal</li>
        <li>📊 Track your progress in your creator dashboard</li>
        <li>💸 Once unlocked, withdraw to your connected bank account anytime</li>
      </ul>

      <div class="info-box">
        <p style="margin: 0;"><strong>💡 Pro Tip:</strong> Start uploading quality content to begin making your first sales and unlock your bonus faster!</p>
      </div>

      <h3>What's Next:</h3>
      <ol style="color: #4b5563; line-height: 1.8;">
        <li>Complete your creator profile</li>
        <li>Add your first digital content</li>
        <li>Set your pricing</li>
        <li>Make your first sale and watch your bonus progress!</li>
      </ol>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL || 'https://velolink.club'}/creator/dashboard" class="button">Start Creating</a>
      </div>

      <p class="text-sm" style="margin-top: 30px;">Questions? Our support team is here to help you succeed!</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
      <p class="text-xs">Welcome to the Velo creator community!</p>
    </div>
  </div>
</body>
</html>
  `,
    WELCOME_CREATOR: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${getLogoHtml()}
      <h1>🎉 Welcome to Velo, ${data.user_name}!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>Welcome to VeloLink! We're thrilled to have you join our community of creators and content enthusiasts.</p>

      <div class="success-box">
        <p style="margin: 0;"><strong>✨ Your creative journey starts here!</strong></p>
      </div>

      <h3>What You Can Do as a Creator:</h3>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li>📤 Upload and share your exclusive digital content</li>
        <li>💰 Set your own prices and start earning</li>
        <li>🎯 Reach a global audience of buyers</li>
        <li>📊 Track sales and earnings in your dashboard</li>
        <li>🔐 Secure transactions with instant payment processing</li>
      </ul>

      <h3>Get Started in 3 Easy Steps:</h3>
      <ol style="color: #4b5563; line-height: 1.8;">
        <li>Complete your creator profile with a photo and bio</li>
        <li>Upload your first piece of content</li>
        <li>Set your price and start earning!</li>
      </ol>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL || 'https://velolink.club'}/creator/dashboard" class="button">Access Your Dashboard</a>
      </div>

      <div class="info-box">
        <p style="margin: 0;"><strong>💡 Creator Tips:</strong> Upload high-quality content regularly to build your audience and increase your earnings!</p>
      </div>

      <p class="text-sm" style="margin-top: 30px;">If you have any questions, our support team is always here to help!</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
      <p class="text-xs">Welcome to the Velo creator community!</p>
    </div>
  </div>
</body>
</html>
  `,
    EMAIL_VERIFICATION: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${getLogoHtml()}
      <h1>📧 Verify Your Email</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>Thank you for signing up with VeloLink! To complete your registration and start using your account, please use this verification code:</p>

      <div style="text-align: center; margin: 30px 0;">
        <div style="background: #f3f4f6; border: 2px solid #4f46e5; border-radius: 8px; padding: 20px; display: inline-block;">
          <p style="margin: 0 0 5px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 8px; font-family: 'Courier New', monospace;">${data.verification_code}</p>
        </div>
      </div>

      <div class="warning-box">
        <p style="margin: 0;"><strong>⏱ Important:</strong> This verification code expires in ${data.expiry_time}.</p>
      </div>

      <p class="text-sm">Enter this code on the verification page to activate your account.</p>

      <div class="info-box">
        <p style="margin: 0;"><strong>🔒 Security Tip:</strong> Never share this code with anyone. Velo will never ask for your verification code via phone or email.</p>
      </div>

      <p class="text-sm" style="margin-top: 30px; color: #6b7280;">If you didn't create a Velo account, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
      <p class="text-xs">This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `,
    PASSWORD_RESET: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${getLogoHtml()}
      <h1>🔐 Reset Your Password</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>We received a request to reset your password for your Velo account. Click the button below to create a new password:</p>

      <div class="text-center mt-20">
        <a href="${data.reset_link}" class="button">Reset Password</a>
      </div>

      <div class="warning-box">
        <p style="margin: 0;"><strong>⏱ Expires in:</strong> ${data.expiry_time}</p>
      </div>

      <p class="text-sm">If the button doesn't work, copy and paste this link into your browser:</p>
      <p class="text-xs" style="color: #6b7280; word-break: break-all;">${data.reset_link}</p>

      <div class="danger-box">
        <p style="margin: 0;"><strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.</p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
      <p class="text-xs">This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `,
    TWO_FACTOR_ENABLED: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${getLogoHtml()}
      <h1>🔒 2FA Enabled</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>Two-factor authentication has been successfully enabled on your Velo account.</p>

      <div class="success-box">
        <p style="margin: 0;"><strong>✅ Your account is now more secure!</strong></p>
      </div>

      <div class="info-box">
        <p style="margin: 0 0 8px 0;"><strong>Activity Details:</strong></p>
        <p style="margin: 0; font-size: 14px;">Date: ${data.enabled_date}</p>
        <p style="margin: 0; font-size: 14px;">IP Address: ${data.ip_address}</p>
      </div>

      <p>From now on, you'll need to enter a verification code from your authenticator app when logging in.</p>

      <div class="warning-box">
        <p style="margin: 0;"><strong>⚠️ Important:</strong> If you didn't enable 2FA, please contact support immediately and change your password.</p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,
    TWO_FACTOR_DISABLED: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${getLogoHtml()}
      <h1>🔓 2FA Disabled</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>Two-factor authentication has been disabled on your Velo account.</p>

      <div class="info-box">
        <p style="margin: 0 0 8px 0;"><strong>Activity Details:</strong></p>
        <p style="margin: 0; font-size: 14px;">Date: ${data.disabled_date}</p>
        <p style="margin: 0; font-size: 14px;">IP Address: ${data.ip_address}</p>
      </div>

      <p>Your account is now less secure without 2FA. We recommend enabling it again for better protection.</p>

      <div class="danger-box">
        <p style="margin: 0;"><strong>⚠️ Security Alert:</strong> If you didn't disable 2FA, please secure your account immediately by resetting your password and re-enabling 2FA.</p>
      </div>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL}/settings/security" class="button">Security Settings</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,
    ACCOUNT_VERIFIED: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${getLogoHtml()}
      <h1>✅ Account Verified!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>Great news! Your Velo account has been successfully verified on ${data.verification_date}.</p>

      <div class="success-box">
        <p style="margin: 0;"><strong>🎊 You're all set to start using VeloLink!</strong></p>
      </div>

      <p>You can now:</p>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li>Browse and purchase exclusive content</li>
        <li>Apply to become a creator</li>
        <li>Access all platform features</li>
        <li>Manage your account settings</li>
      </ul>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL}" class="button">Start Exploring</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,
    PASSWORD_CHANGED: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${getLogoHtml()}
      <h1>🔐 Password Changed</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>Your Velo account password was successfully changed.</p>

      <div class="info-box">
        <p style="margin: 0 0 8px 0;"><strong>Activity Details:</strong></p>
        <p style="margin: 0; font-size: 14px;">Date: ${data.change_date}</p>
        <p style="margin: 0; font-size: 14px;">IP Address: ${data.ip_address}</p>
      </div>

      <p>If you made this change, no further action is needed.</p>

      <div class="danger-box">
        <p style="margin: 0;"><strong>⚠️ Didn't change your password?</strong> Contact support immediately and secure your account.</p>
      </div>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL}/support" class="button">Contact Support</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,
    SECURITY_ALERT: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
      ${getLogoHtml()}
      <h1>⚠️ Security Alert</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>We detected unusual activity on your Velo account that requires your attention.</p>

      <div class="danger-box">
        <p style="margin: 0 0 8px 0;"><strong>Suspicious Activity:</strong></p>
        <p style="margin: 0;">${data.activity_description}</p>
      </div>

      <div class="info-box">
        <p style="margin: 0 0 8px 0;"><strong>Activity Details:</strong></p>
        <p style="margin: 0; font-size: 14px;">Date: ${data.activity_date}</p>
        <p style="margin: 0; font-size: 14px;">IP Address: ${data.ip_address}</p>
      </div>

      <p><strong>Recommended actions:</strong></p>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li>Change your password immediately</li>
        <li>Enable two-factor authentication</li>
        <li>Review recent account activity</li>
        <li>Contact support if you don't recognize this activity</li>
      </ul>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL}/settings/security" class="button">Secure My Account</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,
    PURCHASE_RECEIPT: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
      ${getLogoHtml()}
      <h1>🎉 Purchase Successful!</h1>
    </div>
    <div class="content">
      <p>Thank you for your purchase on VeloLink!</p>

      <div class="success-box">
        <p style="margin: 0;"><strong>✅ Payment confirmed - Your content is ready!</strong></p>
      </div>

      <h3 style="color: #1f2937; margin-top: 30px;">Purchase Details</h3>
      <table>
        <tr>
          <th>Content</th>
          <td>${data.content_title}</td>
        </tr>
        <tr>
          <th>Amount</th>
          <td class="amount">$${data.amount}</td>
        </tr>
        <tr>
          <th>Date</th>
          <td>${data.date}</td>
        </tr>
        <tr>
          <th>Email</th>
          <td>${data.buyer_email}</td>
        </tr>
        ${data.transaction_id ? `<tr><th>Transaction ID</th><td>${data.transaction_id}</td></tr>` : ''}
      </table>

      <div class="text-center mt-20">
        <a href="${data.access_link}" class="button">Access Your Content</a>
      </div>

      <div class="info-box">
        <p style="margin: 0;"><strong>💡 Tip:</strong> Bookmark your access link for future viewing. You'll always have access to your purchased content.</p>
      </div>

      <p class="text-sm" style="margin-top: 30px;">Questions about your purchase? Contact our support team anytime.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
      <p class="text-xs">Receipt ID: ${data.transaction_id || 'N/A'}</p>
    </div>
  </div>
</body>
</html>
  `,
    CREATOR_SALE_NOTIFICATION: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
      ${getLogoHtml()}
      <h1>💰 New Sale!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.creator_name}</strong>,</p>
      <p>Great news! Someone just purchased your content on VeloLink!</p>

      <div class="success-box">
        <p style="margin: 0;"><strong>🎊 Congratulations on your sale!</strong></p>
      </div>

      <h3 style="color: #1f2937; margin-top: 30px;">Sale Details</h3>
      <table>
        <tr>
          <th>Content</th>
          <td>${data.content_title}</td>
        </tr>
        <tr>
          <th>Sale Amount</th>
          <td class="amount">$${data.amount}</td>
        </tr>
        <tr>
          <th>Your Earnings (90%)</th>
          <td class="amount" style="color: #10b981;">$${(parseFloat(data.amount) * 0.85).toFixed(2)}</td>
        </tr>
        <tr>
          <th>Date</th>
          <td>${data.date}</td>
        </tr>
      </table>

      <div class="info-box">
        <p style="margin: 0;"><strong>💡 Earnings:</strong> Your earnings will be added to your balance and available for payout once they reach the minimum threshold.</p>
      </div>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL}/creator/earnings" class="button">View Earnings</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,
    PAYOUT_PROCESSED: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
      ${getLogoHtml()}
      <h1>💸 Payout Processed</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.creator_name}</strong>,</p>
      <p>Your payout has been successfully processed!</p>

      <div class="success-box">
        <p style="margin: 0;"><strong>✅ Funds are on the way to your bank account</strong></p>
      </div>

      <h3 style="color: #1f2937; margin-top: 30px;">Payout Details</h3>
      <table>
        <tr>
          <th>Amount</th>
          <td class="amount">$${data.amount}</td>
        </tr>
        <tr>
          <th>Date</th>
          <td>${data.payout_date}</td>
        </tr>
        <tr>
          <th>Transaction ID</th>
          <td>${data.transaction_id}</td>
        </tr>
      </table>

      <div class="info-box">
        <p style="margin: 0;"><strong>⏱ Processing Time:</strong> Payouts typically arrive in your bank account within 3-5 business days.</p>
      </div>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL}/creator/payouts" class="button">View Payout History</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
      <p class="text-xs">Transaction ID: ${data.transaction_id}</p>
    </div>
  </div>
</body>
</html>
  `,
    ADMIN_PAYOUT_REQUEST_ALERT: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
      ${getLogoHtml()}
      <h1>⚡ New Payout Request</h1>
    </div>
    <div class="content">
      <p><strong>Admin Alert:</strong> A creator has submitted a payout request that requires review.</p>

      <div class="warning-box">
        <p style="margin: 0;"><strong>⏱ Action Required:</strong> Please review and approve or reject this payout request.</p>
      </div>

      <h3 style="color: #1f2937; margin-top: 30px;">Request Details</h3>
      <table>
        <tr>
          <th>Creator</th>
          <td><strong>${data.creator_name}</strong></td>
        </tr>
        <tr>
          <th>Amount Requested</th>
          <td class="amount">$${data.amount}</td>
        </tr>
        <tr>
          <th>Available Balance</th>
          <td>$${data.available_balance}</td>
        </tr>
        <tr>
          <th>Request ID</th>
          <td>${data.request_id}</td>
        </tr>
      </table>

      <div class="info-box">
        <p style="margin: 0;"><strong>💡 Next Steps:</strong> Review the creator's balance and payout history before approving. Ensure all requirements are met.</p>
      </div>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL}/admin/payouts?request=${data.request_id}" class="button">Review Request</a>
      </div>

      <p class="text-sm" style="margin-top: 30px; color: #6b7280;">This is an automated notification. Please process payout requests within 2 business days.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
      <p class="text-xs">Request ID: ${data.request_id}</p>
    </div>
  </div>
</body>
</html>
  `,
    PAYOUT_APPROVED: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
      ${getLogoHtml()}
      <h1>✅ Payout Request Approved</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.creator_name}</strong>,</p>
      <p>Great news! Your payout request has been approved by our admin team.</p>

      <div class="success-box">
        <p style="margin: 0;"><strong>🎉 Your payout is now being processed!</strong></p>
      </div>

      <h3 style="color: #1f2937; margin-top: 30px;">Payout Details</h3>
      <table>
        <tr>
          <th>Amount</th>
          <td class="amount">$${data.amount}</td>
        </tr>
        <tr>
          <th>Request ID</th>
          <td>${data.request_id}</td>
        </tr>
        <tr>
          <th>Status</th>
          <td><span style="color: #10b981; font-weight: 600;">Processing</span></td>
        </tr>
      </table>

      <div class="info-box">
        <p style="margin: 0;"><strong>⏱ What's Next:</strong> Your funds will be transferred to your bank account within 2-5 business days. You'll receive another email once the transfer is complete.</p>
      </div>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL}/creator/payouts" class="button">View Payout Status</a>
      </div>

      <p class="text-sm" style="margin-top: 30px;">Questions about your payout? Contact our support team anytime.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
      <p class="text-xs">Request ID: ${data.request_id}</p>
    </div>
  </div>
</body>
</html>
  `,
    PAYOUT_REJECTED: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
      ${getLogoHtml()}
      <h1>Payout Request Status Update</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.creator_name}</strong>,</p>
      <p>We've reviewed your payout request for <strong>$${data.amount}</strong>. Unfortunately, we're unable to approve it at this time.</p>

      <div class="danger-box">
        <p style="margin: 0 0 8px 0;"><strong>Reason for rejection:</strong></p>
        <p style="margin: 0;">${data.reason}</p>
      </div>

      <h3 style="color: #1f2937; margin-top: 30px;">What you can do:</h3>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li>Review the rejection reason above</li>
        <li>Address any issues mentioned</li>
        <li>Contact support if you need clarification</li>
        <li>Submit a new request once requirements are met</li>
      </ul>

      <div class="info-box">
        <p style="margin: 0;"><strong>💡 Note:</strong> Your earnings remain in your account balance. You can submit a new payout request once the issues are resolved.</p>
      </div>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL}/creator/payouts" class="button">View Balance</a>
      </div>

      <p class="text-sm" style="margin-top: 30px;">If you have questions or need assistance, our support team is here to help.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,
    CONTENT_APPROVED: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
      ${getLogoHtml()}
      <h1>✅ Content Approved!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.creator_name}</strong>,</p>
      <p>Great news! Your content has been approved and is now live on VeloLink!</p>

      <div class="success-box">
        <p style="margin: 0;"><strong>🎉 "${data.content_title}" is now available for purchase!</strong></p>
      </div>

      <p>Your content has been reviewed and meets our quality standards. It's now visible to potential buyers on the platform.</p>

      <h3 style="color: #1f2937; margin-top: 30px;">Next Steps:</h3>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li>Share your content link on social media</li>
        <li>Track your content's performance in analytics</li>
        <li>Respond to buyer questions promptly</li>
        <li>Keep creating amazing content!</li>
      </ul>

      <div class="text-center mt-20">
        <a href="${data.content_link}" class="button">View Your Content</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,
    CONTENT_REJECTED: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
      ${getLogoHtml()}
      <h1>📋 Content Review Update</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.creator_name}</strong>,</p>
      <p>Thank you for submitting "${data.content_title}" to VeloLink. After reviewing your content, we're unable to approve it at this time.</p>

      <div class="warning-box">
        <p style="margin: 0 0 8px 0;"><strong>Reason for rejection:</strong></p>
        <p style="margin: 0;">${data.rejection_reason}</p>
      </div>

      <h3 style="color: #1f2937; margin-top: 30px;">What you can do:</h3>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li>Review our content guidelines</li>
        <li>Make the necessary changes</li>
        <li>Resubmit your content for review</li>
        <li>Contact support if you have questions</li>
      </ul>

      <p>We encourage you to address the issues and resubmit. Our team is here to help creators succeed!</p>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL}/creator/content" class="button">Manage Content</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,
    ACCOUNT_DELETION: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${getLogoHtml()}
      <h1>Account Deletion Confirmation</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>Your Velo account has been scheduled for deletion on ${data.deletion_date}.</p>

      <div class="warning-box">
        <p style="margin: 0;"><strong>⚠️ This action will permanently delete:</strong></p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>Your account information</li>
          <li>Your purchase history</li>
          <li>Your content (if you're a creator)</li>
          <li>All associated data</li>
        </ul>
      </div>

      <p>If you change your mind, you can cancel this request by logging into your account before the deletion date.</p>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL}/login" class="button">Cancel Deletion</a>
      </div>

      <p class="text-sm" style="margin-top: 30px; color: #6b7280;">We're sorry to see you go. If there's anything we can do to improve your experience, please let us know.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,
    NEWSLETTER: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${getLogoHtml()}
      <h1>📰 Velo Newsletter</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      ${data.newsletter_content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
      <p class="text-xs"><a href="${process.env.CLIENT_URL}/unsubscribe" style="color: #6b7280;">Unsubscribe from newsletter</a></p>
    </div>
  </div>
</body>
</html>
  `,
    SUPPORT_TICKET_RECEIVED: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${getLogoHtml()}
      <h1>🎫 Support Ticket Received</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>We've received your support request and our team is reviewing it.</p>

      <div class="success-box">
        <p style="margin: 0;"><strong>✅ Ticket Created Successfully</strong></p>
      </div>

      <h3 style="color: #1f2937; margin-top: 30px;">Ticket Details</h3>
      <table>
        <tr>
          <th>Ticket ID</th>
          <td><strong>${data.ticket_id}</strong></td>
        </tr>
        <tr>
          <th>Subject</th>
          <td>${data.subject}</td>
        </tr>
      </table>

      <p>Our support team typically responds within 24-48 hours. We'll email you as soon as we have an update.</p>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL}/support/tickets/${data.ticket_id}" class="button">View Ticket</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
      <p class="text-xs">Ticket ID: ${data.ticket_id}</p>
    </div>
  </div>
</body>
</html>
  `,
    SUPPORT_TICKET_REPLY: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${getLogoHtml()}
      <h1>💬 Support Team Reply</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>Our support team has replied to your ticket <strong>#${data.ticket_id}</strong>.</p>

      <div class="info-box">
        <p style="margin: 0 0 10px 0;"><strong>Support Team Reply:</strong></p>
        <p style="margin: 0;">${data.reply_message}</p>
      </div>

      <div class="text-center mt-20">
        <a href="${process.env.CLIENT_URL}/support/tickets/${data.ticket_id}" class="button">View Full Conversation</a>
      </div>

      <p class="text-sm" style="margin-top: 30px;">If you have additional questions, you can reply directly to the ticket.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VeloLink. All rights reserved.</p>
      <p class="text-xs">Ticket ID: ${data.ticket_id}</p>
    </div>
  </div>
</body>
</html>
  `,
};
//# sourceMappingURL=email-templates.js.map
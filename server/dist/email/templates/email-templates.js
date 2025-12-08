"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTML_TEMPLATES = exports.EMAIL_TEMPLATES = void 0;
exports.EMAIL_TEMPLATES = {
    WELCOME: {
        id: 'd-welcome-template-id',
        name: 'Welcome Email',
        description: 'Welcome new users to the platform',
        subject: 'Welcome to {{app_name}}!',
        requiredVariables: ['user_name', 'app_name'],
    },
    EMAIL_VERIFICATION: {
        id: 'd-email-verification-id',
        name: 'Email Verification',
        description: 'Verify user email address',
        subject: 'Verify your email address',
        requiredVariables: ['user_name', 'verification_link', 'expiry_time'],
    },
    PASSWORD_RESET: {
        id: 'd-password-reset-id',
        name: 'Password Reset',
        description: 'Send password reset link',
        subject: 'Reset your password',
        requiredVariables: ['user_name', 'reset_link', 'expiry_time'],
    },
    TWO_FACTOR_ENABLED: {
        id: 'd-2fa-enabled-id',
        name: '2FA Enabled',
        description: 'Notify user that 2FA was enabled',
        subject: 'Two-Factor Authentication Enabled',
        requiredVariables: ['user_name', 'enabled_date', 'ip_address'],
    },
    TWO_FACTOR_DISABLED: {
        id: 'd-2fa-disabled-id',
        name: '2FA Disabled',
        description: 'Notify user that 2FA was disabled',
        subject: 'Two-Factor Authentication Disabled',
        requiredVariables: ['user_name', 'disabled_date', 'ip_address'],
    },
    ACCOUNT_VERIFIED: {
        id: 'd-account-verified-id',
        name: 'Account Verified',
        description: 'Confirmation that account is verified',
        subject: 'Your account has been verified',
        requiredVariables: ['user_name', 'verification_date'],
    },
    PASSWORD_CHANGED: {
        id: 'd-password-changed-id',
        name: 'Password Changed',
        description: 'Notify user of password change',
        subject: 'Your password was changed',
        requiredVariables: ['user_name', 'change_date', 'ip_address'],
    },
    SECURITY_ALERT: {
        id: 'd-security-alert-id',
        name: 'Security Alert',
        description: 'Alert user of suspicious activity',
        subject: 'Security Alert: Unusual Activity Detected',
        requiredVariables: ['user_name', 'activity_description', 'activity_date', 'ip_address'],
    },
    NEWSLETTER: {
        id: 'd-newsletter-id',
        name: 'Newsletter',
        description: 'Monthly newsletter',
        subject: '{{newsletter_title}}',
        requiredVariables: ['user_name', 'newsletter_title', 'newsletter_content'],
    },
    TRANSACTION_RECEIPT: {
        id: 'd-transaction-receipt-id',
        name: 'Transaction Receipt',
        description: 'Send transaction receipt',
        subject: 'Receipt for your transaction',
        requiredVariables: ['user_name', 'transaction_id', 'amount', 'date', 'items'],
    },
    ACCOUNT_DELETION: {
        id: 'd-account-deletion-id',
        name: 'Account Deletion',
        description: 'Confirm account deletion',
        subject: 'Your account deletion request',
        requiredVariables: ['user_name', 'deletion_date'],
    },
    INVITATION: {
        id: 'd-invitation-id',
        name: 'Team Invitation',
        description: 'Invite user to join team',
        subject: 'You\'ve been invited to {{team_name}}',
        requiredVariables: ['invited_by', 'team_name', 'invitation_link'],
    },
};
exports.HTML_TEMPLATES = {
    WELCOME: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to ${data.app_name}!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.user_name},</p>
      <p>Welcome aboard! We're excited to have you join our community.</p>
      <p>Get started by exploring our platform and discovering all the amazing features we have to offer.</p>
      <p style="text-align: center;">
        <a href="#" class="button">Get Started</a>
      </p>
    </div>
    <div class="footer">
      <p>© 2024 ${data.app_name}. All rights reserved.</p>
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
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <p>Hi ${data.user_name},</p>
      <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
      <p style="text-align: center;">
        <a href="${data.verification_link}" class="button">Verify Email Address</a>
      </p>
      <div class="warning">
        <strong>⚠️ This link expires in ${data.expiry_time}</strong>
      </div>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>This is an automated message, please do not reply.</p>
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
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background: #FF9800; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .warning { background: #ffebee; border-left: 4px solid #f44336; padding: 10px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <p>Hi ${data.user_name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <p style="text-align: center;">
        <a href="${data.reset_link}" class="button">Reset Password</a>
      </p>
      <div class="warning">
        <strong>⏱ This link expires in ${data.expiry_time}</strong>
      </div>
      <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
    </div>
    <div class="footer">
      <p>This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `,
};
//# sourceMappingURL=email-templates.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.sendVerificationEmail = exports.markEmailAsVerified = exports.verifyEmailToken = exports.createEmailVerificationToken = exports.generateVerificationCode = exports.generateVerificationToken = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY || '');
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@velolink.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'VeloLink';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const generateVerificationToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateVerificationToken = generateVerificationToken;
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateVerificationCode = generateVerificationCode;
const createEmailVerificationToken = async (userId) => {
    const token = (0, exports.generateVerificationToken)();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.emailVerificationToken.deleteMany({
        where: { userId },
    });
    await prisma.emailVerificationToken.create({
        data: {
            userId,
            token,
            expiresAt,
        },
    });
    return token;
};
exports.createEmailVerificationToken = createEmailVerificationToken;
const verifyEmailToken = async (token) => {
    const verificationToken = await prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true },
    });
    if (!verificationToken) {
        return null;
    }
    if (verificationToken.expiresAt < new Date()) {
        await prisma.emailVerificationToken.delete({
            where: { id: verificationToken.id },
        });
        return null;
    }
    return { userId: verificationToken.userId };
};
exports.verifyEmailToken = verifyEmailToken;
const markEmailAsVerified = async (userId) => {
    await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true },
    });
    await prisma.emailVerificationToken.deleteMany({
        where: { userId },
    });
};
exports.markEmailAsVerified = markEmailAsVerified;
const sendVerificationEmail = async (email, displayName, token) => {
    const verificationUrl = `${CLIENT_URL}/verify-email?token=${token}`;
    const msg = {
        to: email,
        from: {
            email: FROM_EMAIL,
            name: FROM_NAME,
        },
        subject: 'Verify Your VeloLink Account',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #1f2937; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                      Velo<span style="font-weight: 300;">Link</span>
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
                      Welcome to VeloLink, ${displayName}!
                    </h2>

                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Thank you for creating your creator account. To get started, please verify your email address by clicking the button below:
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${verificationUrl}"
                             style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="color: #4f46e5; font-size: 14px; word-break: break-all; margin: 10px 0 0 0;">
                      ${verificationUrl}
                    </p>

                    <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-top: 30px;">
                      <p style="color: #92400e; font-size: 14px; margin: 0;">
                        <strong>Note:</strong> This link will expire in 24 hours. If you didn't create a VeloLink account, you can safely ignore this email.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      © 2025 VeloLink. All rights reserved.
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                      Secure payments for content creators
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
        text: `
      Welcome to VeloLink, ${displayName}!

      Thank you for creating your creator account. To get started, please verify your email address by visiting the following link:

      ${verificationUrl}

      This link will expire in 24 hours.

      If you didn't create a VeloLink account, you can safely ignore this email.

      © 2025 VeloLink. All rights reserved.
    `,
    };
    try {
        await mail_1.default.send(msg);
        console.log(`Verification email sent to ${email}`);
        return true;
    }
    catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendWelcomeEmail = async (email, displayName) => {
    const msg = {
        to: email,
        from: {
            email: FROM_EMAIL,
            name: FROM_NAME,
        },
        subject: 'Welcome to VeloLink - Email Verified!',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="background-color: #1f2937; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">
                      Velo<span style="font-weight: 300;">Link</span>
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px; text-align: center;">
                    <div style="background-color: #d1fae5; border-radius: 50%; width: 60px; height: 60px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 30px;">✓</span>
                    </div>
                    <h2 style="color: #1f2937; margin: 0 0 20px 0;">Email Verified Successfully!</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Great job, ${displayName}! Your email has been verified. You're one step closer to becoming a verified creator on VeloLink.
                    </p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 20px;">
                      <strong>Next step:</strong> Complete your identity verification to start monetizing your content.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${CLIENT_URL}/register/verify"
                             style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600;">
                            Continue to ID Verification
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 VeloLink</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
        text: `
      Email Verified Successfully!

      Great job, ${displayName}! Your email has been verified. You're one step closer to becoming a verified creator on VeloLink.

      Next step: Complete your identity verification to start monetizing your content.

      Visit: ${CLIENT_URL}/register/verify

      © 2025 VeloLink
    `,
    };
    try {
        await mail_1.default.send(msg);
        return true;
    }
    catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.default = {
    generateVerificationToken: exports.generateVerificationToken,
    generateVerificationCode: exports.generateVerificationCode,
    createEmailVerificationToken: exports.createEmailVerificationToken,
    verifyEmailToken: exports.verifyEmailToken,
    markEmailAsVerified: exports.markEmailAsVerified,
    sendVerificationEmail: exports.sendVerificationEmail,
    sendWelcomeEmail: exports.sendWelcomeEmail,
};
//# sourceMappingURL=emailService.js.map
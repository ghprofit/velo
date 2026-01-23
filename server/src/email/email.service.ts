import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type {
  EmailConfig,
  SendEmailOptions,
  EmailSendResult,
  BulkEmailResult,
} from './interfaces/email.interface';
import { HTML_TEMPLATES } from './templates/email-templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly config: EmailConfig;
  private readonly transporter: Transporter;
  private isConfigured = false;

  constructor() {
    // Initialize configuration from environment variables
    this.config = {
      apiKey: process.env.ZOHO_PASSWORD || '',
      fromEmail: process.env.ZOHO_EMAIL || 'noreply@velolink.club',
      fromName: process.env.ZOHO_FROM_NAME || 'VeloLink',
      replyToEmail: process.env.ZOHO_REPLY_TO_EMAIL,
    };

    // Initialize Zoho Mail SMTP transporter
    const zohoEmail = process.env.ZOHO_EMAIL;
    const zohoPassword = process.env.ZOHO_PASSWORD;
    const zohoHost = process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com';
    const zohoPort = parseInt(process.env.ZOHO_SMTP_PORT || '465', 10);

    if (zohoEmail && zohoPassword) {
      this.transporter = nodemailer.createTransport({
        host: zohoHost,
        port: zohoPort,
        secure: zohoPort === 465, // true for 465, false for other ports
        auth: {
          user: zohoEmail,
          pass: zohoPassword,
        },
        // Zoho-specific settings
        tls: {
          rejectUnauthorized: true,
        },
      });

      this.isConfigured = true;
      this.logger.log('Zoho Mail SMTP configured successfully');

      // Verify connection configuration
      this.transporter.verify((error) => {
        if (error) {
          this.logger.error('Zoho Mail SMTP verification failed:', error);
          this.isConfigured = false;
        } else {
          this.logger.log('Zoho Mail SMTP server is ready to send emails');
        }
      });
    } else {
      // Create a dummy transporter for simulation
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
      });
      this.logger.warn(
        'Zoho Mail credentials not found. Email sending will be simulated.',
      );
    }
  }

  /**
   * Send a single email using Zoho Mail SMTP
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
    try {
      this.logger.log(`Sending email to: ${options.to}`);

      // Validate input
      if (!options.to) {
        throw new BadRequestException('Recipient email is required');
      }

      if (!options.subject && !options.html) {
        throw new BadRequestException('Either subject or html content is required');
      }

      // Normalize recipient addresses
      const toAddresses = Array.isArray(options.to) ? options.to.join(', ') : options.to;

      // Build email options for nodemailer
      const mailOptions = {
        from: `${this.config.fromName} <${options.from || this.config.fromEmail}>`,
        to: toAddresses,
        cc: options.cc?.join(', '),
        bcc: options.bcc?.join(', '),
        replyTo: options.replyTo || this.config.replyToEmail,
        subject: options.subject || 'Notification',
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      // Send email
      if (this.isConfigured) {
        const info = await this.transporter.sendMail(mailOptions);

        this.logger.log(
          `Email sent successfully to ${options.to}. MessageId: ${info.messageId}`,
        );

        return {
          success: true,
          messageId: info.messageId || `sent-${Date.now()}`,
          statusCode: 200,
        };
      } else {
        // Simulate sending in development
        this.logger.warn(`[SIMULATED] Email would be sent to: ${options.to}`);
        this.logger.warn(`[SIMULATED] Subject: ${options.subject}`);
        return {
          success: true,
          messageId: `simulated-${Date.now()}`,
        };
      }
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      return {
        success: false,
        error: (error as any)?.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send bulk emails (processes sequentially to avoid rate limits)
   */
  async sendBulkEmails(
    recipients: Array<{ email: string; templateData?: Record<string, any> }>,
    options: Partial<SendEmailOptions>,
  ): Promise<BulkEmailResult> {
    this.logger.log(`Sending bulk email to ${recipients.length} recipients`);

    const result: BulkEmailResult = {
      totalRecipients: recipients.length,
      successCount: 0,
      failureCount: 0,
      failures: [],
    };

    // Send individual emails with a small delay to avoid rate limiting
    for (const recipient of recipients) {
      const emailResult = await this.sendEmail({
        to: recipient.email,
        ...options,
        html: options.html || '',
      } as SendEmailOptions);

      if (emailResult.success) {
        result.successCount++;
      } else {
        result.failureCount++;
        result.failures.push({
          email: recipient.email,
          error: emailResult.error || 'Unknown error',
        });
      }

      // Small delay between emails to avoid rate limiting (Zoho has limits)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.logger.log(
      `Bulk email completed. Success: ${result.successCount}, Failed: ${result.failureCount}`,
    );

    return result;
  }

  /**
   * Send email with HTML template
   */
  async sendHTMLTemplateEmail(
    to: string,
    templateKey: keyof typeof HTML_TEMPLATES,
    templateData: Record<string, any>,
    subject?: string,
  ): Promise<EmailSendResult> {
    const htmlGenerator = HTML_TEMPLATES[templateKey];

    if (!htmlGenerator) {
      throw new BadRequestException(`HTML template ${templateKey} not found`);
    }

    const htmlMessage = htmlGenerator(templateData as any);

    return this.sendEmail({
      to,
      subject: subject || 'Notification',
      html: htmlMessage,
    });
  }

  /**
   * Schedule an email to be sent later
   * Note: Zoho SMTP doesn't support scheduled sending natively
   */
  async scheduleEmail(
    options: SendEmailOptions,
    sendAt: Date,
  ): Promise<EmailSendResult> {
    this.logger.warn(
      'Zoho SMTP does not support scheduled emails natively. Sending immediately instead.',
    );
    return this.sendEmail(options);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    to: string,
    userName: string,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'WELCOME',
      {
        user_name: userName,
        app_name: this.config.fromName,
      },
      `Welcome to ${this.config.fromName}!`,
    );
  }

  /**
   * Send welcome email to creator from waitlist
   * Includes information about the $50 waitlist bonus
   */
  async sendWelcomeCreatorWaitlistEmail(
    to: string,
    userName: string,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'WELCOME_CREATOR_WAITLIST',
      {
        user_name: userName,
      },
      'Welcome to Velo - Your $50 Waitlist Bonus Awaits!',
    );
  }

  /**
   * Send welcome email to regular creator (non-waitlist)
   * Standard creator welcome without bonus information
   */
  async sendWelcomeCreatorEmail(
    to: string,
    userName: string,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'WELCOME_CREATOR',
      {
        user_name: userName,
      },
      'Welcome to Velo - Start Creating Today!',
    );
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(
    to: string,
    userName: string,
    verificationCode: string,
    expiryMinutes: number = 20,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'EMAIL_VERIFICATION',
      {
        user_name: userName,
        verification_code: verificationCode,
        expiry_time: `${expiryMinutes} minutes`,
      },
      'Verify your email address',
    );
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    to: string,
    userName: string,
    resetLink: string,
    expiryMinutes: number = 30,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'PASSWORD_RESET',
      {
        user_name: userName,
        reset_link: resetLink,
        expiry_time: `${expiryMinutes} minutes`,
      },
      'Reset your password',
    );
  }

  /**
   * Get email statistics
   * Note: Zoho Mail stats are available in Zoho dashboard
   */
  async getEmailStats(days: number = 7): Promise<any> {
    this.logger.log(`Getting email stats for last ${days} days`);
    return {
      message:
        'Email statistics are available in Zoho Mail dashboard.',
    };
  }

  /**
   * Validate email address format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Test email configuration
   */
  async testConfiguration(testEmail: string): Promise<EmailSendResult> {
    this.logger.log(`Testing email configuration by sending to ${testEmail}`);

    return this.sendEmail({
      to: testEmail,
      subject: 'Zoho Mail Configuration Test',
      html: '<h1>Test Email</h1><p>If you received this, your Zoho Mail configuration is working!</p>',
      text: 'Test Email - If you received this, your Zoho Mail configuration is working!',
    });
  }

  /**
   * Send purchase receipt email to buyer
   */
  async sendPurchaseReceipt(
    to: string,
    data: {
      buyer_email: string;
      content_title: string;
      amount: string;
      date: string;
      access_link: string;
      transaction_id?: string;
    },
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'PURCHASE_RECEIPT',
      data,
      'Receipt for your purchase on Velo',
    );
  }

  /**
   * Send sale notification email to creator
   */
  async sendCreatorSaleNotification(
    to: string,
    data: {
      creator_name: string;
      content_title: string;
      amount: string;
      date: string;
    },
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'CREATOR_SALE_NOTIFICATION',
      data,
      'New Sale: Someone purchased your content!',
    );
  }

  /**
   * Send payout processed email to creator
   */
  async sendPayoutProcessed(
    to: string,
    data: {
      creator_name: string;
      amount: string;
      payout_date: string;
      transaction_id: string;
    },
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'PAYOUT_PROCESSED',
      data,
      'Your payout has been processed',
    );
  }

  /**
   * Send admin payout request alert
   * Note: This sends to a single admin email. The caller should loop through all admin emails.
   */
  async sendAdminPayoutAlert(
    to: string,
    data: {
      creator_name: string;
      amount: string;
      request_id: string;
      available_balance: string;
    },
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'ADMIN_PAYOUT_REQUEST_ALERT',
      data,
      'New Payout Request - Action Required',
    );
  }

  /**
   * Send payout approved email to creator
   */
  async sendPayoutApproved(
    to: string,
    data: {
      creator_name: string;
      amount: string;
      request_id: string;
    },
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'PAYOUT_APPROVED',
      data,
      'Payout Request Approved',
    );
  }

  /**
   * Send payout rejected email to creator
   */
  async sendPayoutRejected(
    to: string,
    data: {
      creator_name: string;
      amount: string;
      reason: string;
    },
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'PAYOUT_REJECTED',
      data,
      'Payout Request Status Update',
    );
  }

  /**
   * Send content approved notification to creator
   */
  async sendContentApproved(
    to: string,
    data: {
      creator_name: string;
      content_title: string;
      content_link: string;
    },
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'CONTENT_APPROVED',
      data,
      'Your content has been approved!',
    );
  }

  /**
   * Send content rejected notification to creator
   */
  async sendContentRejected(
    to: string,
    data: {
      creator_name: string;
      content_title: string;
      rejection_reason: string;
    },
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'CONTENT_REJECTED',
      data,
      'Content Review Update',
    );
  }

  /**
   * Send 2FA enabled notification
   */
  async send2FAEnabled(
    to: string,
    userName: string,
    ipAddress: string,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'TWO_FACTOR_ENABLED',
      {
        user_name: userName,
        enabled_date: new Date().toLocaleString(),
        ip_address: ipAddress,
      },
      'Two-Factor Authentication Enabled',
    );
  }

  /**
   * Send 2FA disabled notification
   */
  async send2FADisabled(
    to: string,
    userName: string,
    ipAddress: string,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'TWO_FACTOR_DISABLED',
      {
        user_name: userName,
        disabled_date: new Date().toLocaleString(),
        ip_address: ipAddress,
      },
      'Two-Factor Authentication Disabled',
    );
  }

  /**
   * Send account verified notification
   */
  async sendAccountVerified(
    to: string,
    userName: string,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'ACCOUNT_VERIFIED',
      {
        user_name: userName,
        verification_date: new Date().toLocaleString(),
      },
      'Your account has been verified',
    );
  }

  /**
   * Send password changed notification
   */
  async sendPasswordChanged(
    to: string,
    userName: string,
    ipAddress: string,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'PASSWORD_CHANGED',
      {
        user_name: userName,
        change_date: new Date().toLocaleString(),
        ip_address: ipAddress,
      },
      'Your password was changed',
    );
  }

  /**
   * Send security alert
   */
  async sendSecurityAlert(
    to: string,
    userName: string,
    activityDescription: string,
    ipAddress: string,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'SECURITY_ALERT',
      {
        user_name: userName,
        activity_description: activityDescription,
        activity_date: new Date().toLocaleString(),
        ip_address: ipAddress,
      },
      'Security Alert: Unusual Activity Detected',
    );
  }

  /**
   * Send support ticket received confirmation
   */
  async sendSupportTicketReceived(
    to: string,
    userName: string,
    ticketId: string,
    subject: string,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'SUPPORT_TICKET_RECEIVED',
      {
        user_name: userName,
        ticket_id: ticketId,
        subject: subject,
      },
      'We received your support request',
    );
  }

  /**
   * Send support ticket reply notification
   */
  async sendSupportTicketReply(
    to: string,
    userName: string,
    ticketId: string,
    replyMessage: string,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'SUPPORT_TICKET_REPLY',
      {
        user_name: userName,
        ticket_id: ticketId,
        reply_message: replyMessage,
      },
      'Update on your support ticket',
    );
  }

  /**
   * Send account deletion confirmation
   */
  async sendAccountDeletion(
    to: string,
    userName: string,
    deletionDate: string,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'ACCOUNT_DELETION',
      {
        user_name: userName,
        deletion_date: deletionDate,
      },
      'Your account deletion request',
    );
  }

  /**
   * Send newsletter
   */
  async sendNewsletter(
    to: string,
    userName: string,
    newsletterContent: string,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(
      to,
      'NEWSLETTER',
      {
        user_name: userName,
        newsletter_content: newsletterContent,
      },
      'Velo Newsletter',
    );
  }

  /**
   * Send content approval notification (wrapper for sendContentApproved)
   */
  async sendContentApproval(
    to: string,
    creatorName: string,
    contentTitle: string,
    contentLink: string,
  ): Promise<EmailSendResult> {
    return this.sendContentApproved(to, {
      creator_name: creatorName,
      content_title: contentTitle,
      content_link: contentLink,
    });
  }

  /**
   * Send content rejection notification (wrapper for sendContentRejected)
   */
  async sendContentRejection(
    to: string,
    creatorName: string,
    contentTitle: string,
    rejectionReason: string,
  ): Promise<EmailSendResult> {
    return this.sendContentRejected(to, {
      creator_name: creatorName,
      content_title: contentTitle,
      rejection_reason: rejectionReason,
    });
  }
}

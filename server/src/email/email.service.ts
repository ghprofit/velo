import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SESClient, SendEmailCommand, SendRawEmailCommand } from '@aws-sdk/client-ses';
import * as nodemailer from 'nodemailer';
import type {
  EmailConfig,
  SendEmailOptions,
  EmailSendResult,
  BulkEmailResult,
} from './interfaces/email.interface';
import { EMAIL_TEMPLATES, HTML_TEMPLATES } from './templates/email-templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly config: EmailConfig;
  private readonly sesClient: SESClient;
  private isConfigured = false;

  constructor() {
    // Initialize configuration from environment variables
    this.config = {
      apiKey: '', // Not used for AWS SES
      fromEmail: process.env.SES_FROM_EMAIL || 'noreply@example.com',
      fromName: process.env.SES_FROM_NAME || 'VeloLink',
      replyToEmail: process.env.SES_REPLY_TO_EMAIL,
    };

    // Configure AWS SES
    const hasCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

    if (hasCredentials) {
      this.sesClient = new SESClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
      this.isConfigured = true;
      this.logger.log('AWS SES configured successfully');
    } else {
      // Create a dummy client for development mode
      this.sesClient = new SESClient({ region: 'us-east-1' });
      this.logger.warn(
        'AWS SES credentials not found. Email sending will be simulated.',
      );
    }
  }

  /**
   * Send a single email using AWS SES
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
    try {
      this.logger.log(`Sending email to: ${options.to}`);

      // Validate input
      if (!options.to) {
        throw new BadRequestException('Recipient email is required');
      }

      if (!options.subject && !options.templateId) {
        throw new BadRequestException(
          'Either subject or templateId is required',
        );
      }

      // Handle attachments with nodemailer
      if (options.attachments && options.attachments.length > 0) {
        return this.sendEmailWithAttachments(options);
      }

      // Prepare email addresses
      const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
      const ccAddresses = options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined;
      const bccAddresses = options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined;

      const fromAddress = options.from || `${this.config.fromName} <${this.config.fromEmail}>`;
      const replyToAddresses = options.replyTo ? [options.replyTo] : (this.config.replyToEmail ? [this.config.replyToEmail] : undefined);

      // Build SES email parameters
      const params: any = {
        Source: fromAddress,
        Destination: {
          ToAddresses: toAddresses,
          CcAddresses: ccAddresses,
          BccAddresses: bccAddresses,
        },
        Message: {
          Subject: {
            Data: options.subject || '',
            Charset: 'UTF-8',
          },
          Body: {},
        },
      };

      // Add HTML and/or Text body
      if (options.html) {
        params.Message.Body.Html = {
          Data: options.html,
          Charset: 'UTF-8',
        };
      }

      if (options.text) {
        params.Message.Body.Text = {
          Data: options.text,
          Charset: 'UTF-8',
        };
      }

      // Add Reply-To
      if (replyToAddresses) {
        params.ReplyToAddresses = replyToAddresses;
      }

      // Send email
      if (this.isConfigured) {
        const command = new SendEmailCommand(params);
        const response = await this.sesClient.send(command);

        this.logger.log(
          `Email sent successfully to ${options.to}. MessageId: ${response.MessageId}`,
        );

        return {
          success: true,
          messageId: response.MessageId || `ses-${Date.now()}`,
          statusCode: response.$metadata.httpStatusCode || 200,
        };
      } else {
        // Simulate sending in development
        this.logger.warn(`[SIMULATED] Email would be sent to: ${options.to}`);
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
   * Send email with attachments using nodemailer + AWS SES
   */
  private async sendEmailWithAttachments(options: SendEmailOptions): Promise<EmailSendResult> {
    try {
      // Build email message using nodemailer
      const mailOptions = {
        from: options.from || `${this.config.fromName} <${this.config.fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo || this.config.replyToEmail,
        attachments: options.attachments,
      };

      if (this.isConfigured) {
        // Use nodemailer's streamTransport to build raw MIME message
        const transporter = nodemailer.createTransport({
          streamTransport: true,
          newline: 'unix',
        } as any);

        const info: any = await transporter.sendMail(mailOptions);

        // Collect the raw email message from the stream
        const chunks: Buffer[] = [];
        for await (const chunk of info.message) {
          chunks.push(chunk);
        }
        const message = Buffer.concat(chunks);

        // Send the raw email using AWS SES
        const command = new SendRawEmailCommand({
          RawMessage: {
            Data: message,
          },
        });

        const response = await this.sesClient.send(command);

        this.logger.log(
          `Email with attachments sent successfully to ${options.to}. MessageId: ${response.MessageId}`,
        );

        return {
          success: true,
          messageId: response.MessageId || `ses-${Date.now()}`,
          statusCode: response.$metadata.httpStatusCode || 200,
        };
      } else {
        this.logger.warn(`[SIMULATED] Email with attachments would be sent to: ${options.to}`);
        return {
          success: true,
          messageId: `simulated-attach-${Date.now()}`,
        };
      }
    } catch (error) {
      this.logger.error('Failed to send email with attachments:', error);
      return {
        success: false,
        error: (error as any)?.message || 'Failed to send email with attachments',
      };
    }
  }

  /**
   * Send email using a predefined template
   * Uses HTML templates defined in code
   */
  async sendTemplateEmail(
    to: string,
    templateKey: keyof typeof EMAIL_TEMPLATES,
    templateData: Record<string, any>,
    options?: Partial<SendEmailOptions>,
  ): Promise<EmailSendResult> {
    const template = EMAIL_TEMPLATES[templateKey];

    if (!template) {
      throw new BadRequestException(`Template ${templateKey} not found`);
    }

    // Validate required variables
    const missingVars = template.requiredVariables.filter(
      (varName) => !(varName in templateData),
    );

    if (missingVars.length > 0) {
      throw new BadRequestException(
        `Missing required template variables: ${missingVars.join(', ')}`,
      );
    }

    // Generate HTML message from template
    const htmlGenerator = HTML_TEMPLATES[templateKey];
    if (!htmlGenerator) {
      throw new BadRequestException(`HTML template ${templateKey} not found`);
    }

    const htmlMessage = htmlGenerator(templateData as any);

    // Send email with HTML content
    return this.sendEmail({
      to,
      subject: template.subject || '',
      html: htmlMessage,
      ...options,
    });
  }

  /**
   * Send bulk emails (up to 50 recipients per batch for AWS SES)
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

    // AWS SES allows up to 50 recipients per API call
    const batchSize = 50;
    const batches = this.chunkArray(recipients, batchSize);

    for (const batch of batches) {
      try {
        // Send individual emails for bulk sends
        // Note: AWS SES doesn't have the same batch personalization as SendGrid
        for (const recipient of batch) {
          const emailResult = await this.sendEmail({
            to: recipient.email,
            ...options,
          });

          if (emailResult.success) {
            result.successCount++;
          } else {
            result.failureCount++;
            result.failures.push({
              email: recipient.email,
              error: emailResult.error || 'Unknown error',
            });
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        this.logger.error(`Failed to send batch of ${batch.length} emails:`, error);
        result.failureCount += batch.length;
        batch.forEach((recipient) => {
          result.failures.push({
            email: recipient.email,
            error: (error as any)?.message || 'Batch send failed',
          });
        });
      }
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

    // Use HTML template from code
    const template = EMAIL_TEMPLATES[templateKey];

    return this.sendEmail({
      to,
      subject: subject || template?.subject || 'Notification',
      html: htmlMessage,
    });
  }

  /**
   * Schedule an email to be sent later
   * Note: AWS SES does not support native scheduling.
   * This method immediately sends the email.
   * For true scheduling, implement with AWS EventBridge or similar service.
   * @deprecated Use AWS EventBridge for scheduled emails
   */
  async scheduleEmail(
    options: SendEmailOptions,
    sendAt: Date,
  ): Promise<EmailSendResult> {
    this.logger.warn(
      `AWS SES does not support native scheduling. Email will be sent immediately. ` +
      `Scheduled time ${sendAt.toISOString()} was requested but ignored.`
    );

    // Send immediately since AWS SES doesn't support scheduling
    return this.sendEmail(options);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    to: string,
    userName: string,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(to, 'WELCOME', {
      user_name: userName,
      app_name: this.config.fromName,
    }, `Welcome to ${this.config.fromName}!`);
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(
    to: string,
    userName: string,
    verificationLink: string,
    expiryMinutes: number = 60,
  ): Promise<EmailSendResult> {
    return this.sendHTMLTemplateEmail(to, 'EMAIL_VERIFICATION', {
      user_name: userName,
      verification_link: verificationLink,
      expiry_time: `${expiryMinutes} minutes`,
    }, 'Verify your email address');
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
    return this.sendHTMLTemplateEmail(to, 'PASSWORD_RESET', {
      user_name: userName,
      reset_link: resetLink,
      expiry_time: `${expiryMinutes} minutes`,
    }, 'Reset your password');
  }

  /**
   * Get email statistics (if configured)
   */
  async getEmailStats(days: number = 7): Promise<any> {
    // This would require AWS CloudWatch API for SES stats
    // Implementation requires CloudWatch integration
    this.logger.log(`Getting email stats for last ${days} days`);
    return {
      message: 'Stats endpoint not implemented. Use AWS CloudWatch or SES console for metrics.',
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
   * Chunk array into batches
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Test email configuration
   */
  async testConfiguration(testEmail: string): Promise<EmailSendResult> {
    this.logger.log(`Testing email configuration by sending to ${testEmail}`);

    return this.sendEmail({
      to: testEmail,
      subject: 'AWS SES Configuration Test',
      html: '<h1>Test Email</h1><p>If you received this, your AWS SES configuration is working!</p>',
      text: 'Test Email - If you received this, your AWS SES configuration is working!',
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
   * Send email verification code (6-digit)
   */
  async sendEmailVerificationCode(
    to: string,
    userName: string,
    verificationCode: string,
    expiryMinutes: number = 15,
  ): Promise<EmailSendResult> {
    const expiryTime = `${expiryMinutes} minutes`;

    return this.sendHTMLTemplateEmail(
      to,
      'EMAIL_VERIFICATION_CODE',
      {
        user_name: userName,
        verification_code: verificationCode,
        expiry_time: expiryTime,
      },
      'Your Velo verification code',
    );
  }
}

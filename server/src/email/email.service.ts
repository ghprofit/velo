import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SESClient, SendEmailCommand, SendRawEmailCommand } from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';
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
  private readonly sesClient: SESClient;
  private isConfigured = false;

  constructor() {
    // Initialize configuration from environment variables
    this.config = {
      apiKey: process.env.AWS_ACCESS_KEY_ID || '',
      fromEmail: process.env.SES_FROM_EMAIL || 'noreply@example.com',
      fromName: process.env.SES_FROM_NAME || 'VeloLink',
      replyToEmail: process.env.SES_REPLY_TO_EMAIL,
    };

    // Initialize AWS SES Client
    const awsRegion = process.env.AWS_REGION || 'us-east-1';
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (awsAccessKeyId && awsSecretAccessKey) {
      this.sesClient = new SESClient({
        region: awsRegion,
        credentials: {
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey,
        },
      });
      this.isConfigured = true;
      this.logger.log('AWS SES configured successfully');
    } else {
      // Create a dummy client to prevent errors
      this.sesClient = new SESClient({ region: awsRegion });
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

      if (!options.subject && !options.html) {
        throw new BadRequestException('Either subject or html content is required');
      }

      // If attachments are present, use raw email
      if (options.attachments && options.attachments.length > 0) {
        return this.sendEmailWithAttachments(options);
      }

      // Normalize recipient addresses
      const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

      // Build email command for AWS SES
      const params = {
        Source: `${this.config.fromName} <${options.from || this.config.fromEmail}>`,
        Destination: {
          ToAddresses: toAddresses,
          CcAddresses: options.cc || [],
          BccAddresses: options.bcc || [],
        },
        Message: {
          Subject: {
            Data: options.subject || 'Notification',
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: options.html || options.text || '',
              Charset: 'UTF-8',
            },
            ...(options.text && {
              Text: {
                Data: options.text,
                Charset: 'UTF-8',
              },
            }),
          },
        },
        ...(options.replyTo || this.config.replyToEmail
          ? {
              ReplyToAddresses: [options.replyTo || this.config.replyToEmail || ''],
            }
          : {}),
      };

      // Send email
      if (this.isConfigured) {
        const command = new SendEmailCommand(params);
        const response = await this.sesClient.send(command);

        this.logger.log(
          `Email sent successfully to ${options.to}. MessageId: ${response.MessageId}`,
        );

        return {
          success: true,
          messageId: response.MessageId || `sent-${Date.now()}`,
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
   * Send email with attachments using raw email
   * Uses nodemailer to build MIME message, then sends via AWS SES SendRawEmailCommand
   */
  private async sendEmailWithAttachments(
    options: SendEmailOptions,
  ): Promise<EmailSendResult> {
    try {
      this.logger.log(`Sending email with attachments to: ${options.to}`);

      // Create a transporter using streamTransport to build MIME message
      const transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
      } as any);

      // Build email options for nodemailer
      const mailOptions = {
        from: `${this.config.fromName} <${options.from || this.config.fromEmail}>`,
        to: options.to,
        cc: options.cc?.join(', '),
        bcc: options.bcc?.join(', '),
        replyTo: options.replyTo || this.config.replyToEmail,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      // Generate raw MIME message
      const info: any = await transporter.sendMail(mailOptions);

      // Collect message from stream
      const chunks: Buffer[] = [];
      for await (const chunk of info.message) {
        chunks.push(chunk);
      }
      const rawMessage = Buffer.concat(chunks);

      if (this.isConfigured) {
        // Send via AWS SES
        const command = new SendRawEmailCommand({
          RawMessage: {
            Data: rawMessage,
          },
        });

        const response = await this.sesClient.send(command);

        this.logger.log(
          `Email with attachments sent successfully to ${options.to}. MessageId: ${response.MessageId}`,
        );

        return {
          success: true,
          messageId: response.MessageId || `sent-${Date.now()}`,
          statusCode: 200,
        };
      } else {
        this.logger.warn(
          `[SIMULATED] Email with attachments would be sent to: ${options.to}`,
        );
        return {
          success: true,
          messageId: `simulated-${Date.now()}`,
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
   * Send bulk emails (up to 1000 recipients per batch)
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

    // Send individual emails (AWS SES doesn't have built-in bulk like SendGrid)
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
   * Note: AWS SES doesn't support scheduled sending natively
   * This would require additional infrastructure (e.g., EventBridge, Lambda)
   */
  async scheduleEmail(
    options: SendEmailOptions,
    sendAt: Date,
  ): Promise<EmailSendResult> {
    this.logger.warn(
      'AWS SES does not support scheduled emails natively. Sending immediately instead.',
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
   * Note: AWS SES stats require CloudWatch integration
   */
  async getEmailStats(days: number = 7): Promise<any> {
    this.logger.log(`Getting email stats for last ${days} days`);
    return {
      message:
        'AWS SES stats require CloudWatch integration. Use AWS Console for detailed metrics.',
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

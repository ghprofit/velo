import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
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
  private isConfigured = false;

  constructor() {
    // Initialize configuration from environment variables
    this.config = {
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
      fromName: process.env.SENDGRID_FROM_NAME || 'NestJS App',
      replyToEmail: process.env.SENDGRID_REPLY_TO_EMAIL,
    };

    // Configure SendGrid
    if (this.config.apiKey) {
      sgMail.setApiKey(this.config.apiKey);
      this.isConfigured = true;
      this.logger.log('SendGrid configured successfully');
    } else {
      this.logger.warn(
        'SendGrid API key not found. Email sending will be simulated.',
      );
    }
  }

  /**
   * Send a single email
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

      // Build email message
      const msg: any = {
        to: options.to,
        from: {
          email: options.from || this.config.fromEmail,
          name: options.fromName || this.config.fromName,
        },
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo || this.config.replyToEmail,
      };

      // Add template if provided
      if (options.templateId) {
        msg.templateId = options.templateId;
        msg.dynamicTemplateData = options.templateData || {};
      }

      // Add CC and BCC
      if (options.cc && options.cc.length > 0) {
        msg.cc = options.cc;
      }

      if (options.bcc && options.bcc.length > 0) {
        msg.bcc = options.bcc;
      }

      // Add attachments
      if (options.attachments && options.attachments.length > 0) {
        msg.attachments = options.attachments;
      }

      // Add custom args for tracking
      if (options.customArgs) {
        msg.customArgs = options.customArgs;
      }

      // Add scheduled sending
      if (options.sendAt) {
        msg.sendAt = options.sendAt;
      }

      // Add batch ID
      if (options.batchId) {
        msg.batchId = options.batchId;
      }

      // Send email
      if (this.isConfigured) {
        const [response] = await sgMail.send(msg);

        this.logger.log(
          `Email sent successfully to ${options.to}. Status: ${response.statusCode}`,
        );

        return {
          success: true,
          messageId: response.headers['x-message-id'] as string,
          statusCode: response.statusCode,
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
   * Send email using a predefined template
   * Uses single SendGrid template with {{{message}}} placeholder
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

    // Send email with single template ID and message as HTML
    return this.sendEmail({
      to,
      subject: template.subject || '',
      templateId: template.id,
      templateData: {
        message: htmlMessage,
      },
      ...options,
    });
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

    // SendGrid allows up to 1000 recipients per API call
    const batchSize = 1000;
    const batches = this.chunkArray(recipients, batchSize);

    for (const batch of batches) {
      try {
        if (options.templateId) {
          // Use personalization for template emails
          const personalizations = batch.map((recipient) => ({
            to: { email: recipient.email },
            dynamicTemplateData: {
              ...options.templateData,
              ...recipient.templateData,
            },
          }));

          const msg: any = {
            from: {
              email: options.from || this.config.fromEmail,
              name: options.fromName || this.config.fromName,
            },
            templateId: options.templateId,
            personalizations,
          };

          if (this.isConfigured) {
            await sgMail.send(msg);
            result.successCount += batch.length;
          } else {
            this.logger.warn(
              `[SIMULATED] Bulk email would be sent to ${batch.length} recipients`,
            );
            result.successCount += batch.length;
          }
        } else {
          // Send individual emails for non-template bulk sends
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
          }
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
   * Send email with HTML template using single SendGrid template
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

    // Use single SendGrid template with message placeholder
    const template = EMAIL_TEMPLATES[templateKey];

    return this.sendEmail({
      to,
      subject: subject || template?.subject || 'Notification',
      templateId: template?.id || process.env.SENDGRID_TEMPLATE_ID,
      templateData: {
        message: htmlMessage,
      },
    });
  }

  /**
   * Schedule an email to be sent later
   */
  async scheduleEmail(
    options: SendEmailOptions,
    sendAt: Date,
  ): Promise<EmailSendResult> {
    const unixTimestamp = Math.floor(sendAt.getTime() / 1000);

    return this.sendEmail({
      ...options,
      sendAt: unixTimestamp,
    });
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
    // This would require SendGrid API for stats
    // Implementation depends on your SendGrid plan
    this.logger.log(`Getting email stats for last ${days} days`);
    return {
      message: 'Stats endpoint not implemented. Use SendGrid dashboard.',
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
      subject: 'SendGrid Configuration Test',
      html: '<h1>Test Email</h1><p>If you received this, your SendGrid configuration is working!</p>',
      text: 'Test Email - If you received this, your SendGrid configuration is working!',
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
}

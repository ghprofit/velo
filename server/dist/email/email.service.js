"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const client_ses_1 = require("@aws-sdk/client-ses");
const nodemailer_1 = __importDefault(require("nodemailer"));
const email_templates_1 = require("./templates/email-templates");
let EmailService = EmailService_1 = class EmailService {
    constructor() {
        this.logger = new common_1.Logger(EmailService_1.name);
        this.isConfigured = false;
        this.config = {
            apiKey: process.env.AWS_ACCESS_KEY_ID || '',
            fromEmail: process.env.SES_FROM_EMAIL || 'noreply@example.com',
            fromName: process.env.SES_FROM_NAME || 'VeloLink',
            replyToEmail: process.env.SES_REPLY_TO_EMAIL,
        };
        const awsRegion = process.env.AWS_REGION || 'us-east-1';
        const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        if (awsAccessKeyId && awsSecretAccessKey) {
            this.sesClient = new client_ses_1.SESClient({
                region: awsRegion,
                credentials: {
                    accessKeyId: awsAccessKeyId,
                    secretAccessKey: awsSecretAccessKey,
                },
            });
            this.isConfigured = true;
            this.logger.log('AWS SES configured successfully');
        }
        else {
            this.sesClient = new client_ses_1.SESClient({ region: awsRegion });
            this.logger.warn('AWS SES credentials not found. Email sending will be simulated.');
        }
    }
    async sendEmail(options) {
        try {
            this.logger.log(`Sending email to: ${options.to}`);
            if (!options.to) {
                throw new common_1.BadRequestException('Recipient email is required');
            }
            if (!options.subject && !options.html) {
                throw new common_1.BadRequestException('Either subject or html content is required');
            }
            if (options.attachments && options.attachments.length > 0) {
                return this.sendEmailWithAttachments(options);
            }
            const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
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
            if (this.isConfigured) {
                const command = new client_ses_1.SendEmailCommand(params);
                const response = await this.sesClient.send(command);
                this.logger.log(`Email sent successfully to ${options.to}. MessageId: ${response.MessageId}`);
                return {
                    success: true,
                    messageId: response.MessageId || `sent-${Date.now()}`,
                    statusCode: 200,
                };
            }
            else {
                this.logger.warn(`[SIMULATED] Email would be sent to: ${options.to}`);
                this.logger.warn(`[SIMULATED] Subject: ${options.subject}`);
                return {
                    success: true,
                    messageId: `simulated-${Date.now()}`,
                };
            }
        }
        catch (error) {
            this.logger.error('Failed to send email:', error);
            return {
                success: false,
                error: error?.message || 'Failed to send email',
            };
        }
    }
    async sendEmailWithAttachments(options) {
        try {
            this.logger.log(`Sending email with attachments to: ${options.to}`);
            const transporter = nodemailer_1.default.createTransport({
                streamTransport: true,
                newline: 'unix',
            });
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
            const info = await transporter.sendMail(mailOptions);
            const chunks = [];
            for await (const chunk of info.message) {
                chunks.push(chunk);
            }
            const rawMessage = Buffer.concat(chunks);
            if (this.isConfigured) {
                const command = new client_ses_1.SendRawEmailCommand({
                    RawMessage: {
                        Data: rawMessage,
                    },
                });
                const response = await this.sesClient.send(command);
                this.logger.log(`Email with attachments sent successfully to ${options.to}. MessageId: ${response.MessageId}`);
                return {
                    success: true,
                    messageId: response.MessageId || `sent-${Date.now()}`,
                    statusCode: 200,
                };
            }
            else {
                this.logger.warn(`[SIMULATED] Email with attachments would be sent to: ${options.to}`);
                return {
                    success: true,
                    messageId: `simulated-${Date.now()}`,
                };
            }
        }
        catch (error) {
            this.logger.error('Failed to send email with attachments:', error);
            return {
                success: false,
                error: error?.message || 'Failed to send email with attachments',
            };
        }
    }
    async sendBulkEmails(recipients, options) {
        this.logger.log(`Sending bulk email to ${recipients.length} recipients`);
        const result = {
            totalRecipients: recipients.length,
            successCount: 0,
            failureCount: 0,
            failures: [],
        };
        for (const recipient of recipients) {
            const emailResult = await this.sendEmail({
                to: recipient.email,
                ...options,
                html: options.html || '',
            });
            if (emailResult.success) {
                result.successCount++;
            }
            else {
                result.failureCount++;
                result.failures.push({
                    email: recipient.email,
                    error: emailResult.error || 'Unknown error',
                });
            }
        }
        this.logger.log(`Bulk email completed. Success: ${result.successCount}, Failed: ${result.failureCount}`);
        return result;
    }
    async sendHTMLTemplateEmail(to, templateKey, templateData, subject) {
        const htmlGenerator = email_templates_1.HTML_TEMPLATES[templateKey];
        if (!htmlGenerator) {
            throw new common_1.BadRequestException(`HTML template ${templateKey} not found`);
        }
        const htmlMessage = htmlGenerator(templateData);
        return this.sendEmail({
            to,
            subject: subject || 'Notification',
            html: htmlMessage,
        });
    }
    async scheduleEmail(options, sendAt) {
        this.logger.warn('AWS SES does not support scheduled emails natively. Sending immediately instead.');
        return this.sendEmail(options);
    }
    async sendWelcomeEmail(to, userName) {
        return this.sendHTMLTemplateEmail(to, 'WELCOME', {
            user_name: userName,
            app_name: this.config.fromName,
        }, `Welcome to ${this.config.fromName}!`);
    }
    async sendEmailVerification(to, userName, verificationCode, expiryMinutes = 20) {
        return this.sendHTMLTemplateEmail(to, 'EMAIL_VERIFICATION', {
            user_name: userName,
            verification_code: verificationCode,
            expiry_time: `${expiryMinutes} minutes`,
        }, 'Verify your email address');
    }
    async sendPasswordReset(to, userName, resetLink, expiryMinutes = 30) {
        return this.sendHTMLTemplateEmail(to, 'PASSWORD_RESET', {
            user_name: userName,
            reset_link: resetLink,
            expiry_time: `${expiryMinutes} minutes`,
        }, 'Reset your password');
    }
    async getEmailStats(days = 7) {
        this.logger.log(`Getting email stats for last ${days} days`);
        return {
            message: 'AWS SES stats require CloudWatch integration. Use AWS Console for detailed metrics.',
        };
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    async testConfiguration(testEmail) {
        this.logger.log(`Testing email configuration by sending to ${testEmail}`);
        return this.sendEmail({
            to: testEmail,
            subject: 'AWS SES Configuration Test',
            html: '<h1>Test Email</h1><p>If you received this, your AWS SES configuration is working!</p>',
            text: 'Test Email - If you received this, your AWS SES configuration is working!',
        });
    }
    async sendPurchaseReceipt(to, data) {
        return this.sendHTMLTemplateEmail(to, 'PURCHASE_RECEIPT', data, 'Receipt for your purchase on Velo');
    }
    async sendCreatorSaleNotification(to, data) {
        return this.sendHTMLTemplateEmail(to, 'CREATOR_SALE_NOTIFICATION', data, 'New Sale: Someone purchased your content!');
    }
    async sendPayoutProcessed(to, data) {
        return this.sendHTMLTemplateEmail(to, 'PAYOUT_PROCESSED', data, 'Your payout has been processed');
    }
    async sendAdminPayoutAlert(to, data) {
        return this.sendHTMLTemplateEmail(to, 'ADMIN_PAYOUT_REQUEST_ALERT', data, 'New Payout Request - Action Required');
    }
    async sendPayoutApproved(to, data) {
        return this.sendHTMLTemplateEmail(to, 'PAYOUT_APPROVED', data, 'Payout Request Approved');
    }
    async sendPayoutRejected(to, data) {
        return this.sendHTMLTemplateEmail(to, 'PAYOUT_REJECTED', data, 'Payout Request Status Update');
    }
    async sendContentApproved(to, data) {
        return this.sendHTMLTemplateEmail(to, 'CONTENT_APPROVED', data, 'Your content has been approved!');
    }
    async sendContentRejected(to, data) {
        return this.sendHTMLTemplateEmail(to, 'CONTENT_REJECTED', data, 'Content Review Update');
    }
    async send2FAEnabled(to, userName, ipAddress) {
        return this.sendHTMLTemplateEmail(to, 'TWO_FACTOR_ENABLED', {
            user_name: userName,
            enabled_date: new Date().toLocaleString(),
            ip_address: ipAddress,
        }, 'Two-Factor Authentication Enabled');
    }
    async send2FADisabled(to, userName, ipAddress) {
        return this.sendHTMLTemplateEmail(to, 'TWO_FACTOR_DISABLED', {
            user_name: userName,
            disabled_date: new Date().toLocaleString(),
            ip_address: ipAddress,
        }, 'Two-Factor Authentication Disabled');
    }
    async sendAccountVerified(to, userName) {
        return this.sendHTMLTemplateEmail(to, 'ACCOUNT_VERIFIED', {
            user_name: userName,
            verification_date: new Date().toLocaleString(),
        }, 'Your account has been verified');
    }
    async sendPasswordChanged(to, userName, ipAddress) {
        return this.sendHTMLTemplateEmail(to, 'PASSWORD_CHANGED', {
            user_name: userName,
            change_date: new Date().toLocaleString(),
            ip_address: ipAddress,
        }, 'Your password was changed');
    }
    async sendSecurityAlert(to, userName, activityDescription, ipAddress) {
        return this.sendHTMLTemplateEmail(to, 'SECURITY_ALERT', {
            user_name: userName,
            activity_description: activityDescription,
            activity_date: new Date().toLocaleString(),
            ip_address: ipAddress,
        }, 'Security Alert: Unusual Activity Detected');
    }
    async sendSupportTicketReceived(to, userName, ticketId, subject) {
        return this.sendHTMLTemplateEmail(to, 'SUPPORT_TICKET_RECEIVED', {
            user_name: userName,
            ticket_id: ticketId,
            subject: subject,
        }, 'We received your support request');
    }
    async sendSupportTicketReply(to, userName, ticketId, replyMessage) {
        return this.sendHTMLTemplateEmail(to, 'SUPPORT_TICKET_REPLY', {
            user_name: userName,
            ticket_id: ticketId,
            reply_message: replyMessage,
        }, 'Update on your support ticket');
    }
    async sendAccountDeletion(to, userName, deletionDate) {
        return this.sendHTMLTemplateEmail(to, 'ACCOUNT_DELETION', {
            user_name: userName,
            deletion_date: deletionDate,
        }, 'Your account deletion request');
    }
    async sendNewsletter(to, userName, newsletterContent) {
        return this.sendHTMLTemplateEmail(to, 'NEWSLETTER', {
            user_name: userName,
            newsletter_content: newsletterContent,
        }, 'Velo Newsletter');
    }
    async sendContentApproval(to, creatorName, contentTitle, contentLink) {
        return this.sendContentApproved(to, {
            creator_name: creatorName,
            content_title: contentTitle,
            content_link: contentLink,
        });
    }
    async sendContentRejection(to, creatorName, contentTitle, rejectionReason) {
        return this.sendContentRejected(to, {
            creator_name: creatorName,
            content_title: contentTitle,
            rejection_reason: rejectionReason,
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map
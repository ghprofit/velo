"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const client_ses_1 = require("@aws-sdk/client-ses");
const nodemailer = __importStar(require("nodemailer"));
const email_templates_1 = require("./templates/email-templates");
let EmailService = EmailService_1 = class EmailService {
    constructor() {
        this.logger = new common_1.Logger(EmailService_1.name);
        this.isConfigured = false;
        this.config = {
            apiKey: '',
            fromEmail: process.env.SES_FROM_EMAIL || 'noreply@example.com',
            fromName: process.env.SES_FROM_NAME || 'VeloLink',
            replyToEmail: process.env.SES_REPLY_TO_EMAIL,
        };
        const hasCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
        if (hasCredentials) {
            this.sesClient = new client_ses_1.SESClient({
                region: process.env.AWS_REGION || 'us-east-1',
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
            });
            this.isConfigured = true;
            this.logger.log('AWS SES configured successfully');
        }
        else {
            this.sesClient = new client_ses_1.SESClient({ region: 'us-east-1' });
            this.logger.warn('AWS SES credentials not found. Email sending will be simulated.');
        }
    }
    async sendEmail(options) {
        try {
            this.logger.log(`Sending email to: ${options.to}`);
            if (!options.to) {
                throw new common_1.BadRequestException('Recipient email is required');
            }
            if (!options.subject && !options.templateId) {
                throw new common_1.BadRequestException('Either subject or templateId is required');
            }
            if (options.attachments && options.attachments.length > 0) {
                return this.sendEmailWithAttachments(options);
            }
            const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
            const ccAddresses = options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined;
            const bccAddresses = options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined;
            const fromAddress = options.from || `${this.config.fromName} <${this.config.fromEmail}>`;
            const replyToAddresses = options.replyTo ? [options.replyTo] : (this.config.replyToEmail ? [this.config.replyToEmail] : undefined);
            const params = {
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
            if (replyToAddresses) {
                params.ReplyToAddresses = replyToAddresses;
            }
            if (this.isConfigured) {
                const command = new client_ses_1.SendEmailCommand(params);
                const response = await this.sesClient.send(command);
                this.logger.log(`Email sent successfully to ${options.to}. MessageId: ${response.MessageId}`);
                return {
                    success: true,
                    messageId: response.MessageId || `ses-${Date.now()}`,
                    statusCode: response.$metadata.httpStatusCode || 200,
                };
            }
            else {
                this.logger.warn(`[SIMULATED] Email would be sent to: ${options.to}`);
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
                const transporter = nodemailer.createTransport({
                    streamTransport: true,
                    newline: 'unix',
                });
                const info = await transporter.sendMail(mailOptions);
                const chunks = [];
                for await (const chunk of info.message) {
                    chunks.push(chunk);
                }
                const message = Buffer.concat(chunks);
                const command = new client_ses_1.SendRawEmailCommand({
                    RawMessage: {
                        Data: message,
                    },
                });
                const response = await this.sesClient.send(command);
                this.logger.log(`Email with attachments sent successfully to ${options.to}. MessageId: ${response.MessageId}`);
                return {
                    success: true,
                    messageId: response.MessageId || `ses-${Date.now()}`,
                    statusCode: response.$metadata.httpStatusCode || 200,
                };
            }
            else {
                this.logger.warn(`[SIMULATED] Email with attachments would be sent to: ${options.to}`);
                return {
                    success: true,
                    messageId: `simulated-attach-${Date.now()}`,
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
    async sendTemplateEmail(to, templateKey, templateData, options) {
        const template = email_templates_1.EMAIL_TEMPLATES[templateKey];
        if (!template) {
            throw new common_1.BadRequestException(`Template ${templateKey} not found`);
        }
        const missingVars = template.requiredVariables.filter((varName) => !(varName in templateData));
        if (missingVars.length > 0) {
            throw new common_1.BadRequestException(`Missing required template variables: ${missingVars.join(', ')}`);
        }
        const htmlGenerator = email_templates_1.HTML_TEMPLATES[templateKey];
        if (!htmlGenerator) {
            throw new common_1.BadRequestException(`HTML template ${templateKey} not found`);
        }
        const htmlMessage = htmlGenerator(templateData);
        return this.sendEmail({
            to,
            subject: template.subject || '',
            html: htmlMessage,
            ...options,
        });
    }
    async sendBulkEmails(recipients, options) {
        this.logger.log(`Sending bulk email to ${recipients.length} recipients`);
        const result = {
            totalRecipients: recipients.length,
            successCount: 0,
            failureCount: 0,
            failures: [],
        };
        const batchSize = 50;
        const batches = this.chunkArray(recipients, batchSize);
        for (const batch of batches) {
            try {
                for (const recipient of batch) {
                    const emailResult = await this.sendEmail({
                        to: recipient.email,
                        ...options,
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
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            catch (error) {
                this.logger.error(`Failed to send batch of ${batch.length} emails:`, error);
                result.failureCount += batch.length;
                batch.forEach((recipient) => {
                    result.failures.push({
                        email: recipient.email,
                        error: error?.message || 'Batch send failed',
                    });
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
        const template = email_templates_1.EMAIL_TEMPLATES[templateKey];
        return this.sendEmail({
            to,
            subject: subject || template?.subject || 'Notification',
            html: htmlMessage,
        });
    }
    async scheduleEmail(options, sendAt) {
        this.logger.warn(`AWS SES does not support native scheduling. Email will be sent immediately. ` +
            `Scheduled time ${sendAt.toISOString()} was requested but ignored.`);
        return this.sendEmail(options);
    }
    async sendWelcomeEmail(to, userName) {
        return this.sendHTMLTemplateEmail(to, 'WELCOME', {
            user_name: userName,
            app_name: this.config.fromName,
        }, `Welcome to ${this.config.fromName}!`);
    }
    async sendEmailVerification(to, userName, verificationLink, expiryMinutes = 60) {
        return this.sendHTMLTemplateEmail(to, 'EMAIL_VERIFICATION', {
            user_name: userName,
            verification_link: verificationLink,
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
            message: 'Stats endpoint not implemented. Use AWS CloudWatch or SES console for metrics.',
        };
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
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
    async sendEmailVerificationCode(to, userName, verificationCode, expiryMinutes = 15) {
        const expiryTime = `${expiryMinutes} minutes`;
        return this.sendHTMLTemplateEmail(to, 'EMAIL_VERIFICATION_CODE', {
            user_name: userName,
            verification_code: verificationCode,
            expiry_time: expiryTime,
        }, 'Your Velo verification code');
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map
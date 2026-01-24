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
const nodemailer_1 = __importDefault(require("nodemailer"));
const email_templates_1 = require("./templates/email-templates");
let EmailService = EmailService_1 = class EmailService {
    constructor() {
        this.logger = new common_1.Logger(EmailService_1.name);
        this.isConfigured = false;
        this.config = {
            apiKey: process.env.ZOHO_PASSWORD || '',
            fromEmail: process.env.ZOHO_EMAIL || 'noreply@velolink.club',
            fromName: process.env.ZOHO_FROM_NAME || 'VeloLink',
            replyToEmail: process.env.ZOHO_REPLY_TO_EMAIL,
        };
        const zohoEmail = process.env.ZOHO_EMAIL;
        const zohoPassword = process.env.ZOHO_PASSWORD;
        const zohoHost = process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com';
        const zohoPort = parseInt(process.env.ZOHO_SMTP_PORT || '465', 10);
        if (zohoEmail && zohoPassword) {
            this.transporter = nodemailer_1.default.createTransport({
                host: zohoHost,
                port: zohoPort,
                secure: zohoPort === 465,
                auth: {
                    user: zohoEmail,
                    pass: zohoPassword,
                },
                tls: {
                    rejectUnauthorized: true,
                },
            });
            this.isConfigured = true;
            this.logger.log('Zoho Mail SMTP configured successfully');
            this.transporter.verify((error) => {
                if (error) {
                    this.logger.error('Zoho Mail SMTP verification failed:', error);
                    this.isConfigured = false;
                }
                else {
                    this.logger.log('Zoho Mail SMTP server is ready to send emails');
                }
            });
        }
        else {
            this.transporter = nodemailer_1.default.createTransport({
                streamTransport: true,
                newline: 'unix',
            });
            this.logger.warn('Zoho Mail credentials not found. Email sending will be simulated.');
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
            const toAddresses = Array.isArray(options.to) ? options.to.join(', ') : options.to;
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
            if (this.isConfigured) {
                const info = await this.transporter.sendMail(mailOptions);
                this.logger.log(`Email sent successfully to ${options.to}. MessageId: ${info.messageId}`);
                return {
                    success: true,
                    messageId: info.messageId || `sent-${Date.now()}`,
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
            await new Promise(resolve => setTimeout(resolve, 100));
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
        this.logger.warn('Zoho SMTP does not support scheduled emails natively. Sending immediately instead.');
        return this.sendEmail(options);
    }
    async sendWelcomeEmail(to, userName) {
        return this.sendHTMLTemplateEmail(to, 'WELCOME', {
            user_name: userName,
            app_name: this.config.fromName,
        }, `Welcome to ${this.config.fromName}!`);
    }
    async sendWelcomeCreatorWaitlistEmail(to, userName) {
        return this.sendHTMLTemplateEmail(to, 'WELCOME_CREATOR_WAITLIST', {
            user_name: userName,
        }, 'Welcome to Velo - Your $50 Waitlist Bonus Awaits!');
    }
    async sendWelcomeCreatorEmail(to, userName) {
        return this.sendHTMLTemplateEmail(to, 'WELCOME_CREATOR', {
            user_name: userName,
        }, 'Welcome to Velo - Start Creating Today!');
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
            message: 'Email statistics are available in Zoho Mail dashboard.',
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
            subject: 'Zoho Mail Configuration Test',
            html: '<h1>Test Email</h1><p>If you received this, your Zoho Mail configuration is working!</p>',
            text: 'Test Email - If you received this, your Zoho Mail configuration is working!',
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
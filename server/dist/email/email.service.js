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
const mail_1 = __importDefault(require("@sendgrid/mail"));
const email_templates_1 = require("./templates/email-templates");
let EmailService = EmailService_1 = class EmailService {
    constructor() {
        this.logger = new common_1.Logger(EmailService_1.name);
        this.isConfigured = false;
        this.config = {
            apiKey: process.env.SENDGRID_API_KEY || '',
            fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
            fromName: process.env.SENDGRID_FROM_NAME || 'NestJS App',
            replyToEmail: process.env.SENDGRID_REPLY_TO_EMAIL,
        };
        if (this.config.apiKey) {
            mail_1.default.setApiKey(this.config.apiKey);
            this.isConfigured = true;
            this.logger.log('SendGrid configured successfully');
        }
        else {
            this.logger.warn('SendGrid API key not found. Email sending will be simulated.');
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
            const msg = {
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
            if (options.templateId) {
                msg.templateId = options.templateId;
                msg.dynamicTemplateData = options.templateData || {};
            }
            if (options.cc && options.cc.length > 0) {
                msg.cc = options.cc;
            }
            if (options.bcc && options.bcc.length > 0) {
                msg.bcc = options.bcc;
            }
            if (options.attachments && options.attachments.length > 0) {
                msg.attachments = options.attachments;
            }
            if (options.customArgs) {
                msg.customArgs = options.customArgs;
            }
            if (options.sendAt) {
                msg.sendAt = options.sendAt;
            }
            if (options.batchId) {
                msg.batchId = options.batchId;
            }
            if (this.isConfigured) {
                const [response] = await mail_1.default.send(msg);
                this.logger.log(`Email sent successfully to ${options.to}. Status: ${response.statusCode}`);
                return {
                    success: true,
                    messageId: response.headers['x-message-id'],
                    statusCode: response.statusCode,
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
    async sendTemplateEmail(to, templateKey, templateData, options) {
        const template = email_templates_1.EMAIL_TEMPLATES[templateKey];
        if (!template) {
            throw new common_1.BadRequestException(`Template ${templateKey} not found`);
        }
        const missingVars = template.requiredVariables.filter((varName) => !(varName in templateData));
        if (missingVars.length > 0) {
            throw new common_1.BadRequestException(`Missing required template variables: ${missingVars.join(', ')}`);
        }
        return this.sendEmail({
            to,
            subject: template.subject || '',
            templateId: template.id,
            templateData,
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
        const batchSize = 1000;
        const batches = this.chunkArray(recipients, batchSize);
        for (const batch of batches) {
            try {
                if (options.templateId) {
                    const personalizations = batch.map((recipient) => ({
                        to: { email: recipient.email },
                        dynamicTemplateData: {
                            ...options.templateData,
                            ...recipient.templateData,
                        },
                    }));
                    const msg = {
                        from: {
                            email: options.from || this.config.fromEmail,
                            name: options.fromName || this.config.fromName,
                        },
                        templateId: options.templateId,
                        personalizations,
                    };
                    if (this.isConfigured) {
                        await mail_1.default.send(msg);
                        result.successCount += batch.length;
                    }
                    else {
                        this.logger.warn(`[SIMULATED] Bulk email would be sent to ${batch.length} recipients`);
                        result.successCount += batch.length;
                    }
                }
                else {
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
                    }
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
        const html = htmlGenerator(templateData);
        return this.sendEmail({
            to,
            subject: subject || 'Notification',
            html,
        });
    }
    async scheduleEmail(options, sendAt) {
        const unixTimestamp = Math.floor(sendAt.getTime() / 1000);
        return this.sendEmail({
            ...options,
            sendAt: unixTimestamp,
        });
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
            message: 'Stats endpoint not implemented. Use SendGrid dashboard.',
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
            subject: 'SendGrid Configuration Test',
            html: '<h1>Test Email</h1><p>If you received this, your SendGrid configuration is working!</p>',
            text: 'Test Email - If you received this, your SendGrid configuration is working!',
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map
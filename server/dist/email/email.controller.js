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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EmailController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailController = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("./email.service");
const dto_1 = require("./dto");
let EmailController = EmailController_1 = class EmailController {
    constructor(emailService) {
        this.emailService = emailService;
        this.logger = new common_1.Logger(EmailController_1.name);
    }
    async sendEmail(sendEmailDto) {
        this.logger.log(`Sending email to: ${sendEmailDto.to}`);
        const result = await this.emailService.sendEmail({
            to: sendEmailDto.to,
            subject: sendEmailDto.subject,
            text: sendEmailDto.text,
            html: sendEmailDto.html,
            from: sendEmailDto.from,
            fromName: sendEmailDto.fromName,
            replyTo: sendEmailDto.replyTo,
            cc: sendEmailDto.cc,
            bcc: sendEmailDto.bcc,
            attachments: sendEmailDto.attachments,
            customArgs: sendEmailDto.customArgs,
        });
        return {
            success: result.success,
            messageId: result.messageId,
            message: result.success ? 'Email sent successfully' : result.error || 'Failed to send email',
            timestamp: new Date(),
        };
    }
    async sendTemplateEmail(dto) {
        this.logger.log(`Sending template email to: ${dto.to}`);
        const result = await this.emailService.sendEmail({
            to: dto.to,
            subject: '',
            templateId: dto.templateId,
            templateData: dto.templateData,
            from: dto.from,
            fromName: dto.fromName,
            replyTo: dto.replyTo,
            cc: dto.cc,
            bcc: dto.bcc,
            customArgs: dto.customArgs,
        });
        return {
            success: result.success,
            messageId: result.messageId,
            message: result.success ? 'Template email sent successfully' : result.error || 'Failed to send email',
            timestamp: new Date(),
        };
    }
    async sendBulkEmail(dto) {
        this.logger.log(`Sending bulk email to ${dto.recipients.length} recipients`);
        const result = await this.emailService.sendBulkEmails(dto.recipients, {
            subject: dto.subject,
            text: dto.text,
            html: dto.html,
            templateId: dto.templateId,
            templateData: dto.commonTemplateData,
            from: dto.from,
            fromName: dto.fromName,
            replyTo: dto.replyTo,
            customArgs: dto.customArgs,
        });
        return {
            success: result.failureCount === 0,
            totalRecipients: result.totalRecipients,
            successCount: result.successCount,
            failureCount: result.failureCount,
            failures: result.failures,
            message: `Bulk email completed. ${result.successCount}/${result.totalRecipients} sent successfully`,
            timestamp: new Date(),
        };
    }
    async sendWelcomeEmail(body) {
        this.logger.log(`Sending welcome email to: ${body.email}`);
        const result = await this.emailService.sendWelcomeEmail(body.email, body.userName);
        return {
            success: result.success,
            messageId: result.messageId,
            message: result.success ? 'Welcome email sent' : result.error || 'Failed',
            timestamp: new Date(),
        };
    }
    async sendEmailVerification(body) {
        this.logger.log(`Sending verification email to: ${body.email}`);
        const result = await this.emailService.sendEmailVerification(body.email, body.userName, body.verificationLink);
        return {
            success: result.success,
            messageId: result.messageId,
            message: result.success ? 'Verification email sent' : result.error || 'Failed',
            timestamp: new Date(),
        };
    }
    async sendPasswordReset(body) {
        this.logger.log(`Sending password reset email to: ${body.email}`);
        const result = await this.emailService.sendPasswordReset(body.email, body.userName, body.resetLink);
        return {
            success: result.success,
            messageId: result.messageId,
            message: result.success ? 'Password reset email sent' : result.error || 'Failed',
            timestamp: new Date(),
        };
    }
    async testEmail(body) {
        this.logger.log(`Testing email configuration with: ${body.email}`);
        const result = await this.emailService.testConfiguration(body.email);
        return {
            success: result.success,
            messageId: result.messageId,
            message: result.success ? 'Test email sent successfully' : result.error || 'Failed',
            timestamp: new Date(),
        };
    }
    async getStats(days) {
        return this.emailService.getEmailStats(parseInt(days) || 7);
    }
    healthCheck() {
        return {
            status: 'ok',
            service: 'Email Service',
            provider: 'SendGrid',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.EmailController = EmailController;
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SendEmailDto]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Post)('send-template'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SendTemplateEmailDto]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendTemplateEmail", null);
__decorate([
    (0, common_1.Post)('send-bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SendBulkEmailDto]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendBulkEmail", null);
__decorate([
    (0, common_1.Post)('welcome'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendWelcomeEmail", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendEmailVerification", null);
__decorate([
    (0, common_1.Post)('password-reset'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendPasswordReset", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "testEmail", null);
__decorate([
    (0, common_1.Get)('stats/:days'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmailController.prototype, "healthCheck", null);
exports.EmailController = EmailController = EmailController_1 = __decorate([
    (0, common_1.Controller)('email'),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailController);
//# sourceMappingURL=email.controller.js.map
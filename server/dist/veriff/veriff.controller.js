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
var VeriffController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeriffController = void 0;
const common_1 = require("@nestjs/common");
const veriff_service_1 = require("./veriff.service");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const dto_1 = require("./dto");
let VeriffController = VeriffController_1 = class VeriffController {
    constructor(veriffService, prisma) {
        this.veriffService = veriffService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(VeriffController_1.name);
    }
    async createSession(createSessionDto) {
        this.logger.log('Creating new verification session');
        try {
            const session = await this.veriffService.createSession(createSessionDto);
            return session;
        }
        catch (error) {
            this.logger.error('Failed to create session:', error);
            throw error;
        }
    }
    async getVerificationStatus(sessionId) {
        this.logger.log(`Getting verification status for session: ${sessionId}`);
        try {
            const status = await this.veriffService.getVerificationStatus(sessionId);
            return status;
        }
        catch (error) {
            this.logger.error(`Failed to get verification status for ${sessionId}:`, error);
            throw error;
        }
    }
    async getSessionMedia(sessionId) {
        this.logger.log(`Getting session media for: ${sessionId}`);
        try {
            const media = await this.veriffService.getSessionMedia(sessionId);
            return media;
        }
        catch (error) {
            this.logger.error(`Failed to get session media for ${sessionId}:`, error);
            throw error;
        }
    }
    async resubmitSession(sessionId, updateData) {
        this.logger.log(`Resubmitting session: ${sessionId}`);
        try {
            const session = await this.veriffService.resubmitSession(sessionId, updateData);
            return session;
        }
        catch (error) {
            this.logger.error(`Failed to resubmit session ${sessionId}:`, error);
            throw error;
        }
    }
    async cancelSession(sessionId) {
        this.logger.log(`Canceling session: ${sessionId}`);
        try {
            await this.veriffService.cancelSession(sessionId);
        }
        catch (error) {
            this.logger.error(`Failed to cancel session ${sessionId}:`, error);
            throw error;
        }
    }
    async handleWebhook(webhookData, signature) {
        this.logger.log('Received Veriff webhook');
        try {
            if (signature) {
                const rawBody = JSON.stringify(webhookData);
                const isValid = this.veriffService.verifyWebhookSignature(rawBody, signature);
                if (!isValid) {
                    this.logger.error('Invalid webhook signature');
                    throw new common_1.BadRequestException('Invalid webhook signature');
                }
            }
            else {
                this.logger.warn('Webhook received without signature');
            }
            this.logger.log(`Webhook received for session: ${webhookData.verification.id}`);
            this.logger.log(`Verification status: ${webhookData.verification.status}`);
            this.logger.log(`Verification code: ${webhookData.verification.code}`);
            const sessionId = webhookData.verification.id;
            const status = webhookData.verification.status;
            const code = webhookData.verification.code;
            const creatorProfile = await this.prisma.creatorProfile.findUnique({
                where: { veriffSessionId: sessionId },
            });
            if (!creatorProfile) {
                this.logger.warn(`No creator profile found for session: ${sessionId}`);
                return { received: true };
            }
            let verificationStatus;
            let verifiedAt = null;
            if (status === 'approved' && code === 9001) {
                this.logger.log('Verification approved');
                verificationStatus = client_1.VerificationStatus.VERIFIED;
                verifiedAt = new Date();
            }
            else if (status === 'declined' && code === 9103) {
                this.logger.log(`Verification declined: ${webhookData.verification.reason}`);
                verificationStatus = client_1.VerificationStatus.REJECTED;
            }
            else if (code === 9102) {
                this.logger.log('Verification requires resubmission');
                verificationStatus = client_1.VerificationStatus.IN_PROGRESS;
            }
            else {
                this.logger.log(`Unknown status/code: ${status}/${code}`);
                return { received: true };
            }
            await this.prisma.creatorProfile.update({
                where: { id: creatorProfile.id },
                data: {
                    verificationStatus,
                    verifiedAt,
                    veriffDecisionId: sessionId,
                },
            });
            this.logger.log(`Updated verification status for creator ${creatorProfile.id}: ${verificationStatus}`);
            return { received: true };
        }
        catch (error) {
            this.logger.error('Failed to process webhook:', error);
            throw error;
        }
    }
    healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
    debugConfig() {
        return {
            message: 'Veriff configuration check',
            baseUrlConfigured: process.env.VERIFF_BASE_URL || 'NOT SET',
            apiKeyConfigured: process.env.VERIFF_API_KEY ? 'SET (hidden)' : 'NOT SET',
            apiSecretConfigured: process.env.VERIFF_API_SECRET ? 'SET (hidden)' : 'NOT SET',
            webhookSecretConfigured: process.env.VERIFF_WEBHOOK_SECRET ? 'SET (hidden)' : 'NOT SET',
            note: 'If any value shows NOT SET, check your .env file',
        };
    }
};
exports.VeriffController = VeriffController;
__decorate([
    (0, common_1.Post)('sessions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSessionDto]),
    __metadata("design:returntype", Promise)
], VeriffController.prototype, "createSession", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId/decision'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VeriffController.prototype, "getVerificationStatus", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId/media'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VeriffController.prototype, "getSessionMedia", null);
__decorate([
    (0, common_1.Patch)('sessions/:sessionId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VeriffController.prototype, "resubmitSession", null);
__decorate([
    (0, common_1.Delete)('sessions/:sessionId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VeriffController.prototype, "cancelSession", null);
__decorate([
    (0, common_1.Post)('webhooks/decision'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-hmac-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.WebhookDecisionDto, String]),
    __metadata("design:returntype", Promise)
], VeriffController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], VeriffController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('debug/config'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], VeriffController.prototype, "debugConfig", null);
exports.VeriffController = VeriffController = VeriffController_1 = __decorate([
    (0, common_1.Controller)('veriff'),
    __metadata("design:paramtypes", [veriff_service_1.VeriffService,
        prisma_service_1.PrismaService])
], VeriffController);
//# sourceMappingURL=veriff.controller.js.map
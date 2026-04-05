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
    async handleUserRedirect(response, request) {
        this.logger.log('User redirected from Veriff verification flow');
        const sessionId = request.query.id;
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        if (sessionId) {
            this.logger.log(`Redirect received for session: ${sessionId}`);
            try {
                const creatorProfile = await this.prisma.creatorProfile.findUnique({
                    where: { veriffSessionId: sessionId },
                    select: { id: true, verificationStatus: true },
                });
                if (creatorProfile) {
                    this.logger.log(`Creator ${creatorProfile.id} current status: ${creatorProfile.verificationStatus}`);
                    if (creatorProfile.verificationStatus === client_1.VerificationStatus.VERIFIED) {
                        response.redirect(`${clientUrl}/creator/verify-identity?verified=true`);
                        return;
                    }
                    if (creatorProfile.verificationStatus === client_1.VerificationStatus.REJECTED) {
                        response.redirect(`${clientUrl}/creator/verify-identity?verified=false&reason=rejected`);
                        return;
                    }
                    response.redirect(`${clientUrl}/creator/verify-identity?status=pending`);
                    return;
                }
                else {
                    this.logger.warn(`No creator profile found for session: ${sessionId}`);
                }
            }
            catch (error) {
                this.logger.error('Error checking verification status:', error);
            }
        }
        else {
            this.logger.warn('User redirect received without session ID');
        }
        response.redirect(`${clientUrl}/creator/verify-identity?status=pending`);
    }
    async handleWebhook(request) {
        this.logger.log('Received Veriff webhook');
        this.logger.log(`Headers: ${JSON.stringify(request.headers)}`);
        this.logger.log(`Body type: ${typeof request.body}, isBuffer: ${Buffer.isBuffer(request.body)}`);
        try {
            let webhookData;
            let rawBody;
            if (typeof request.body === 'object' && !Buffer.isBuffer(request.body)) {
                this.logger.warn('Body received as parsed JSON object instead of Buffer');
                webhookData = request.body;
                rawBody = Buffer.from(JSON.stringify(webhookData));
            }
            else if (Buffer.isBuffer(request.body)) {
                rawBody = request.body;
                webhookData = JSON.parse(rawBody.toString('utf-8'));
            }
            else {
                this.logger.error(`Unexpected body type: ${typeof request.body}`);
                throw new common_1.BadRequestException('Invalid request body format');
            }
            this.logger.log(`Webhook data parsed: ${JSON.stringify(webhookData, null, 2)}`);
            const signature = request.headers['x-hmac-signature'];
            if (signature) {
                try {
                    const isValid = this.veriffService.verifyWebhookSignature(rawBody, signature);
                    if (!isValid) {
                        this.logger.error('Invalid webhook signature - REJECTED');
                        throw new common_1.UnauthorizedException('Invalid webhook signature');
                    }
                    this.logger.log('Webhook signature verified successfully');
                }
                catch (signatureError) {
                    this.logger.error('Signature verification error:', signatureError);
                    if (process.env.NODE_ENV !== 'development') {
                        throw signatureError;
                    }
                    this.logger.warn('DEVELOPMENT MODE: Continuing despite signature verification error');
                }
            }
            else {
                this.logger.warn('Webhook received without signature');
                if (process.env.NODE_ENV !== 'development') {
                    throw new common_1.UnauthorizedException('Missing webhook signature');
                }
                this.logger.warn('DEVELOPMENT MODE: Proceeding without signature');
            }
            let sessionId;
            let decision;
            let webhookId;
            if (webhookData.data?.verification?.decision) {
                sessionId = webhookData.sessionId || webhookData.vendorData || '';
                decision = webhookData.data.verification.decision;
                webhookId = `${sessionId}_${webhookData.eventType || 'decision'}`;
                this.logger.log(`📦 New format webhook - SessionId: ${sessionId}, Decision: ${decision}`);
            }
            else if (webhookData.verification) {
                sessionId = webhookData.verification.id;
                decision = webhookData.verification.status;
                webhookId = webhookData.verification.id;
                this.logger.log(`📦 Legacy format webhook - SessionId: ${sessionId}, Status: ${decision}, Code: ${webhookData.verification.code}`);
            }
            else {
                this.logger.error('❌ Unknown webhook format - cannot extract session ID or decision');
                this.logger.error(`Webhook data: ${JSON.stringify(webhookData, null, 2)}`);
                return { received: true };
            }
            const existingWebhook = await this.prisma.processedWebhook.findUnique({
                where: { webhookId },
            });
            if (existingWebhook) {
                this.logger.log(`✓ Webhook already processed: ${webhookId}`);
                return { received: true };
            }
            await this.prisma.$transaction(async (tx) => {
                await tx.processedWebhook.create({
                    data: {
                        webhookId,
                        provider: 'VERIFF',
                        eventType: `${decision}`,
                        payload: webhookData,
                    },
                });
                let creatorProfile = await tx.creatorProfile.findUnique({
                    where: { veriffSessionId: sessionId },
                });
                if (!creatorProfile && webhookData.vendorData) {
                    creatorProfile = await tx.creatorProfile.findUnique({
                        where: { id: webhookData.vendorData },
                    });
                    this.logger.log(`Found creator by vendorData: ${webhookData.vendorData}`);
                }
                if (!creatorProfile) {
                    this.logger.warn(`❌ No creator profile found for session: ${sessionId}`);
                    return;
                }
                let verificationStatus;
                let verifiedAt = null;
                if (decision === 'approved') {
                    this.logger.log('✅ Verification APPROVED');
                    verificationStatus = client_1.VerificationStatus.VERIFIED;
                    verifiedAt = new Date();
                }
                else if (decision === 'declined' || decision === 'rejected') {
                    this.logger.log(`❌ Verification DECLINED/REJECTED`);
                    verificationStatus = client_1.VerificationStatus.REJECTED;
                }
                else if (decision === 'resubmission_requested') {
                    this.logger.log('⚠️  Verification RESUBMISSION REQUESTED');
                    verificationStatus = client_1.VerificationStatus.REJECTED;
                }
                else if (decision === 'submitted' || decision === 'started') {
                    this.logger.log('⏳ Verification still SUBMITTED/IN_PROGRESS - no final decision yet');
                    return;
                }
                else if (decision === 'expired') {
                    this.logger.log('⏱️  Verification session EXPIRED');
                    verificationStatus = client_1.VerificationStatus.EXPIRED;
                }
                else {
                    this.logger.log(`ℹ️  Unknown decision: ${decision}`);
                    return;
                }
                await tx.creatorProfile.update({
                    where: { id: creatorProfile.id },
                    data: {
                        verificationStatus,
                        verifiedAt,
                        veriffDecisionId: sessionId,
                    },
                });
                this.logger.log(`✅ Updated verification status for creator ${creatorProfile.id}: ${verificationStatus}`);
                const user = await tx.user.findUnique({
                    where: { id: creatorProfile.userId },
                    select: { email: true },
                });
                this.logger.log(`User email: ${user?.email}, Final Status: ${verificationStatus}`);
            });
            return { received: true };
        }
        catch (error) {
            this.logger.error('Failed to process webhook:', error);
            if (error instanceof Error) {
                this.logger.error(`Error message: ${error.message}`);
                this.logger.error(`Error stack: ${error.stack}`);
            }
            this.logger.warn('Returning 200 OK despite error - webhook was received, may need manual review');
            return { received: true };
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
            webhookUrl: `${process.env.API_URL || process.env.BACKEND_URL}/api/veriff/webhooks/decision`,
            note: 'If any value shows NOT SET, check your .env file',
        };
    }
    async debugWebhookStatus(sessionId) {
        this.logger.log(`Checking webhook status for session: ${sessionId}`);
        const webhook = await this.prisma.processedWebhook.findUnique({
            where: { webhookId: sessionId },
        });
        const creatorProfile = await this.prisma.creatorProfile.findUnique({
            where: { veriffSessionId: sessionId },
            select: {
                id: true,
                verificationStatus: true,
                verifiedAt: true,
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });
        return {
            sessionId,
            webhookReceived: !!webhook,
            webhookData: webhook
                ? {
                    eventType: webhook.eventType,
                    processedAt: webhook.createdAt,
                }
                : null,
            creatorProfile: creatorProfile
                ? {
                    email: creatorProfile.user.email,
                    status: creatorProfile.verificationStatus,
                    verifiedAt: creatorProfile.verifiedAt,
                }
                : 'NOT FOUND',
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
    (0, common_1.Get)('webhooks/decision'),
    (0, common_1.HttpCode)(common_1.HttpStatus.FOUND),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VeriffController.prototype, "handleUserRedirect", null);
__decorate([
    (0, common_1.Post)('webhooks/decision'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
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
__decorate([
    (0, common_1.Get)('debug/webhook/:sessionId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VeriffController.prototype, "debugWebhookStatus", null);
exports.VeriffController = VeriffController = VeriffController_1 = __decorate([
    (0, common_1.Controller)('veriff'),
    __metadata("design:paramtypes", [veriff_service_1.VeriffService,
        prisma_service_1.PrismaService])
], VeriffController);
//# sourceMappingURL=veriff.controller.js.map
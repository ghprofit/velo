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
var VeriffUsageExample_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeriffUsageExample = void 0;
const common_1 = require("@nestjs/common");
const veriff_service_1 = require("../veriff.service");
let VeriffUsageExample = VeriffUsageExample_1 = class VeriffUsageExample {
    constructor(veriffService) {
        this.veriffService = veriffService;
        this.logger = new common_1.Logger(VeriffUsageExample_1.name);
    }
    async createVerificationSession(userId, userDetails) {
        try {
            const sessionData = {
                verification: {
                    callback: 'https://your-domain.com/veriff/webhooks/decision',
                    person: {
                        firstName: userDetails.firstName,
                        lastName: userDetails.lastName,
                        dateOfBirth: userDetails.dateOfBirth,
                    },
                    vendorData: userId,
                },
            };
            const session = await this.veriffService.createSession(sessionData);
            this.logger.log(`Verification session created: ${session.verification.id}`);
            return {
                sessionId: session.verification.id,
                verificationUrl: session.verification.url,
                status: session.verification.status,
            };
        }
        catch (error) {
            this.logger.error('Failed to create verification session:', error);
            throw error;
        }
    }
    async createSessionWithDocumentInfo(userId, userDetails) {
        try {
            const sessionData = {
                verification: {
                    callback: 'https://your-domain.com/veriff/webhooks/decision',
                    person: {
                        firstName: userDetails.firstName,
                        lastName: userDetails.lastName,
                        idNumber: userDetails.idNumber,
                    },
                    document: {
                        number: userDetails.documentNumber,
                        type: 'PASSPORT',
                        country: 'US',
                    },
                    vendorData: JSON.stringify({
                        userId: userId,
                        email: userDetails.email,
                        timestamp: new Date().toISOString(),
                    }),
                },
            };
            const session = await this.veriffService.createSession(sessionData);
            return {
                sessionId: session.verification.id,
                verificationUrl: session.verification.url,
            };
        }
        catch (error) {
            this.logger.error('Failed to create session with document info:', error);
            throw error;
        }
    }
    async checkVerificationStatus(sessionId) {
        try {
            const status = await this.veriffService.getVerificationStatus(sessionId);
            this.logger.log(`Verification status: ${status.verification.status}`);
            this.logger.log(`Verification code: ${status.verification.code}`);
            if (this.veriffService.isVerificationApproved(status)) {
                this.logger.log('✓ Verification APPROVED');
                const person = status.verification.person;
                const document = status.verification.document;
                return {
                    approved: true,
                    person: {
                        firstName: person?.firstName,
                        lastName: person?.lastName,
                        dateOfBirth: person?.dateOfBirth,
                        nationality: person?.nationality,
                        gender: person?.gender,
                    },
                    document: {
                        number: document?.number,
                        type: document?.type,
                        country: document?.country,
                        validFrom: document?.validFrom,
                        validUntil: document?.validUntil,
                    },
                };
            }
            else if (this.veriffService.isVerificationDeclined(status)) {
                this.logger.warn(`✗ Verification DECLINED: ${status.verification.reason}`);
                return {
                    approved: false,
                    reason: status.verification.reason,
                    reasonCode: status.verification.reasonCode,
                };
            }
            else if (this.veriffService.isResubmissionRequired(status)) {
                this.logger.log('↻ Resubmission REQUIRED');
                return {
                    resubmissionRequired: true,
                    reason: status.verification.reason,
                };
            }
            else {
                this.logger.log(`Status: ${status.verification.status}`);
                return {
                    status: status.verification.status,
                    code: status.verification.code,
                };
            }
        }
        catch (error) {
            this.logger.error('Failed to get verification status:', error);
            throw error;
        }
    }
    async getSessionMedia(sessionId) {
        try {
            const media = await this.veriffService.getSessionMedia(sessionId);
            this.logger.log('Session media retrieved');
            return media;
        }
        catch (error) {
            this.logger.error('Failed to get session media:', error);
            throw error;
        }
    }
    async handleResubmission(sessionId, updatedData) {
        try {
            const updateData = {
                verification: {
                    person: {
                        firstName: updatedData?.firstName,
                        lastName: updatedData?.lastName,
                    },
                },
            };
            const session = await this.veriffService.resubmitSession(sessionId, updateData);
            this.logger.log('Session resubmitted successfully');
            return {
                sessionId: session.verification.id,
                verificationUrl: session.verification.url,
            };
        }
        catch (error) {
            this.logger.error('Failed to resubmit session:', error);
            throw error;
        }
    }
    async cancelVerification(sessionId) {
        try {
            await this.veriffService.cancelSession(sessionId);
            this.logger.log('Session canceled successfully');
            return {
                canceled: true,
                sessionId: sessionId,
            };
        }
        catch (error) {
            this.logger.error('Failed to cancel session:', error);
            throw error;
        }
    }
    async completeUserOnboarding(userId, userDetails) {
        try {
            const session = await this.createVerificationSession(userId, userDetails);
            return {
                success: true,
                message: 'Verification session created. Please check your email.',
                verificationUrl: session.verificationUrl,
            };
        }
        catch (error) {
            this.logger.error('Failed to complete user onboarding:', error);
            throw error;
        }
    }
    async processWebhookDecision(webhookData) {
        try {
            const sessionId = webhookData.verification.id;
            const status = webhookData.verification.status;
            const code = webhookData.verification.code;
            const vendorData = webhookData.verification.vendorData;
            this.logger.log(`Processing webhook for session: ${sessionId}`);
            const userId = vendorData;
            if (status === 'approved') {
                this.logger.log(`User ${userId} verification approved`);
            }
            else if (status === 'declined') {
                this.logger.log(`User ${userId} verification declined`);
            }
            else if (code === 9102) {
                this.logger.log(`User ${userId} needs to resubmit verification`);
            }
            return {
                processed: true,
                sessionId: sessionId,
                status: status,
            };
        }
        catch (error) {
            this.logger.error('Failed to process webhook decision:', error);
            throw error;
        }
    }
};
exports.VeriffUsageExample = VeriffUsageExample;
exports.VeriffUsageExample = VeriffUsageExample = VeriffUsageExample_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [veriff_service_1.VeriffService])
], VeriffUsageExample);
//# sourceMappingURL=usage.example.js.map
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
var CreatorsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const veriff_service_1 = require("../veriff/veriff.service");
const client_1 = require("@prisma/client");
let CreatorsService = CreatorsService_1 = class CreatorsService {
    constructor(prisma, veriffService) {
        this.prisma = prisma;
        this.veriffService = veriffService;
        this.logger = new common_1.Logger(CreatorsService_1.name);
    }
    async initiateVerification(userId) {
        try {
            this.logger.log(`Initiating verification for user: ${userId}`);
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { creatorProfile: true },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (!user.creatorProfile) {
                throw new common_1.BadRequestException('Creator profile not found');
            }
            if (user.creatorProfile.verificationStatus === client_1.VerificationStatus.VERIFIED) {
                throw new common_1.BadRequestException('Creator is already verified');
            }
            if (user.creatorProfile.veriffSessionId) {
                this.logger.warn(`User ${userId} already has an active verification session`);
            }
            const sessionData = {
                verification: {
                    callback: `${process.env.APP_URL}/api/veriff/webhooks/decision`,
                    person: {
                        firstName: user.creatorProfile.firstName || undefined,
                        lastName: user.creatorProfile.lastName || undefined,
                        dateOfBirth: user.creatorProfile.dateOfBirth
                            ? user.creatorProfile.dateOfBirth.toISOString().split('T')[0]
                            : undefined,
                    },
                    vendorData: userId,
                },
            };
            const session = await this.veriffService.createSession(sessionData);
            await this.prisma.creatorProfile.update({
                where: { id: user.creatorProfile.id },
                data: {
                    veriffSessionId: session.verification.id,
                    verificationStatus: client_1.VerificationStatus.IN_PROGRESS,
                },
            });
            this.logger.log(`Verification session created: ${session.verification.id} for user ${userId}`);
            return {
                sessionId: session.verification.id,
                verificationUrl: session.verification.url,
                status: session.verification.status,
            };
        }
        catch (error) {
            this.logger.error(`Failed to initiate verification for user ${userId}:`, error);
            throw error;
        }
    }
    async getMyVerificationStatus(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { creatorProfile: true },
            });
            if (!user || !user.creatorProfile) {
                throw new common_1.NotFoundException('Creator profile not found');
            }
            return {
                verificationStatus: user.creatorProfile.verificationStatus,
                veriffSessionId: user.creatorProfile.veriffSessionId,
                verifiedAt: user.creatorProfile.verifiedAt,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get verification status for user ${userId}:`, error);
            throw error;
        }
    }
    async processVeriffWebhook(sessionId, status, code, vendorData) {
        try {
            this.logger.log(`Processing Veriff webhook for session: ${sessionId}`);
            const creatorProfile = await this.prisma.creatorProfile.findUnique({
                where: { veriffSessionId: sessionId },
            });
            if (!creatorProfile) {
                this.logger.warn(`No creator profile found for session: ${sessionId}`);
                return;
            }
            let verificationStatus;
            let verifiedAt = null;
            if (status === 'approved' && code === 9001) {
                verificationStatus = client_1.VerificationStatus.VERIFIED;
                verifiedAt = new Date();
                this.logger.log(`Verification approved for creator: ${creatorProfile.id}`);
            }
            else if (status === 'declined' && code === 9103) {
                verificationStatus = client_1.VerificationStatus.REJECTED;
                this.logger.log(`Verification declined for creator: ${creatorProfile.id}`);
            }
            else if (code === 9102) {
                verificationStatus = client_1.VerificationStatus.IN_PROGRESS;
                this.logger.log(`Resubmission required for creator: ${creatorProfile.id}`);
            }
            else {
                this.logger.log(`Unknown status/code for creator ${creatorProfile.id}: ${status}/${code}`);
                return;
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
        }
        catch (error) {
            this.logger.error(`Failed to process webhook for session ${sessionId}:`, error);
            throw error;
        }
    }
    async setupBankAccount(userId, bankAccountDto) {
        try {
            this.logger.log(`Setting up bank account for user: ${userId}`);
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { creatorProfile: true },
            });
            if (!user || !user.creatorProfile) {
                throw new common_1.NotFoundException('Creator profile not found');
            }
            if (user.creatorProfile.verificationStatus !== client_1.VerificationStatus.VERIFIED) {
                throw new common_1.BadRequestException('Creator must be verified before setting up payout');
            }
            const updatedProfile = await this.prisma.creatorProfile.update({
                where: { id: user.creatorProfile.id },
                data: {
                    bankAccountName: bankAccountDto.bankAccountName,
                    bankName: bankAccountDto.bankName,
                    bankAccountNumber: bankAccountDto.bankAccountNumber,
                    bankRoutingNumber: bankAccountDto.bankRoutingNumber,
                    bankSwiftCode: bankAccountDto.bankSwiftCode,
                    bankIban: bankAccountDto.bankIban,
                    bankCountry: bankAccountDto.bankCountry,
                    bankCurrency: bankAccountDto.bankCurrency || 'USD',
                    payoutSetupCompleted: true,
                },
            });
            this.logger.log(`Bank account setup completed for user: ${userId}`);
            return {
                bankAccountName: updatedProfile.bankAccountName,
                bankName: updatedProfile.bankName,
                bankAccountNumber: `****${updatedProfile.bankAccountNumber.slice(-4)}`,
                bankCountry: updatedProfile.bankCountry,
                bankCurrency: updatedProfile.bankCurrency,
                payoutSetupCompleted: updatedProfile.payoutSetupCompleted,
            };
        }
        catch (error) {
            this.logger.error(`Failed to setup bank account for user ${userId}:`, error);
            throw error;
        }
    }
    async getBankAccount(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { creatorProfile: true },
            });
            if (!user || !user.creatorProfile) {
                throw new common_1.NotFoundException('Creator profile not found');
            }
            const profile = user.creatorProfile;
            if (!profile.payoutSetupCompleted) {
                return null;
            }
            return {
                bankAccountName: profile.bankAccountName,
                bankName: profile.bankName,
                bankAccountNumber: `****${profile.bankAccountNumber.slice(-4)}`,
                bankCountry: profile.bankCountry,
                bankCurrency: profile.bankCurrency,
                payoutSetupCompleted: profile.payoutSetupCompleted,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get bank account for user ${userId}:`, error);
            throw error;
        }
    }
    async requestPayout(userId, requestedAmount) {
        try {
            this.logger.log(`Payout request initiated by user: ${userId} for amount: ${requestedAmount}`);
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { creatorProfile: true },
            });
            if (!user || !user.creatorProfile) {
                throw new common_1.NotFoundException('Creator profile not found');
            }
            if (requestedAmount < 10) {
                throw new common_1.BadRequestException('Minimum payout amount is $10');
            }
            const availableBalance = user.creatorProfile.totalEarnings;
            if (requestedAmount > availableBalance) {
                throw new common_1.BadRequestException(`Insufficient balance. Available: $${availableBalance.toFixed(2)}, Requested: $${requestedAmount.toFixed(2)}`);
            }
            const existingPendingRequest = await this.prisma.payoutRequest.findFirst({
                where: {
                    creatorId: user.creatorProfile.id,
                    status: { in: ['PENDING', 'APPROVED', 'PROCESSING'] },
                },
            });
            if (existingPendingRequest) {
                throw new common_1.BadRequestException('You already have a pending payout request');
            }
            const payoutRequest = await this.prisma.payoutRequest.create({
                data: {
                    creatorId: user.creatorProfile.id,
                    requestedAmount,
                    availableBalance,
                    currency: user.creatorProfile.bankCurrency || 'USD',
                    status: 'PENDING',
                    emailVerifiedAt: user.emailVerified ? new Date() : null,
                    kycVerifiedAt: user.creatorProfile.verificationStatus === client_1.VerificationStatus.VERIFIED
                        ? user.creatorProfile.verifiedAt
                        : null,
                    bankSetupAt: user.creatorProfile.payoutSetupCompleted ? new Date() : null,
                },
            });
            this.logger.log(`Payout request created: ${payoutRequest.id} for user ${userId}`);
            return {
                id: payoutRequest.id,
                requestedAmount: payoutRequest.requestedAmount,
                availableBalance: payoutRequest.availableBalance,
                currency: payoutRequest.currency,
                status: payoutRequest.status,
                createdAt: payoutRequest.createdAt,
                message: 'Payout request submitted successfully. It will be reviewed by our team.',
            };
        }
        catch (error) {
            this.logger.error(`Failed to create payout request for user ${userId}:`, error);
            throw error;
        }
    }
    async getPayoutRequests(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { creatorProfile: true },
            });
            if (!user || !user.creatorProfile) {
                throw new common_1.NotFoundException('Creator profile not found');
            }
            const requests = await this.prisma.payoutRequest.findMany({
                where: { creatorId: user.creatorProfile.id },
                orderBy: { createdAt: 'desc' },
                include: {
                    payout: {
                        select: {
                            id: true,
                            amount: true,
                            status: true,
                            processedAt: true,
                            paymentId: true,
                        },
                    },
                },
            });
            return requests.map(request => ({
                id: request.id,
                requestedAmount: request.requestedAmount,
                availableBalance: request.availableBalance,
                currency: request.currency,
                status: request.status,
                reviewedAt: request.reviewedAt,
                reviewNotes: request.reviewNotes,
                createdAt: request.createdAt,
                payout: request.payout,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to get payout requests for user ${userId}:`, error);
            throw error;
        }
    }
    async getPayoutRequestById(userId, requestId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { creatorProfile: true },
            });
            if (!user || !user.creatorProfile) {
                throw new common_1.NotFoundException('Creator profile not found');
            }
            const request = await this.prisma.payoutRequest.findFirst({
                where: {
                    id: requestId,
                    creatorId: user.creatorProfile.id,
                },
                include: {
                    payout: {
                        select: {
                            id: true,
                            amount: true,
                            status: true,
                            processedAt: true,
                            paymentId: true,
                            notes: true,
                        },
                    },
                },
            });
            if (!request) {
                throw new common_1.NotFoundException('Payout request not found');
            }
            return {
                id: request.id,
                requestedAmount: request.requestedAmount,
                availableBalance: request.availableBalance,
                currency: request.currency,
                status: request.status,
                emailVerifiedAt: request.emailVerifiedAt,
                kycVerifiedAt: request.kycVerifiedAt,
                bankSetupAt: request.bankSetupAt,
                reviewedBy: request.reviewedBy,
                reviewedAt: request.reviewedAt,
                reviewNotes: request.reviewNotes,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
                payout: request.payout,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get payout request ${requestId} for user ${userId}:`, error);
            throw error;
        }
    }
};
exports.CreatorsService = CreatorsService;
exports.CreatorsService = CreatorsService = CreatorsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        veriff_service_1.VeriffService])
], CreatorsService);
//# sourceMappingURL=creators.service.js.map
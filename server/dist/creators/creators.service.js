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
const email_service_1 = require("../email/email.service");
const notifications_service_1 = require("../notifications/notifications.service");
const stripe_service_1 = require("../stripe/stripe.service");
const create_notification_dto_1 = require("../notifications/dto/create-notification.dto");
const client_1 = require("@prisma/client");
let CreatorsService = CreatorsService_1 = class CreatorsService {
    constructor(prisma, veriffService, emailService, notificationsService, stripeService) {
        this.prisma = prisma;
        this.veriffService = veriffService;
        this.emailService = emailService;
        this.notificationsService = notificationsService;
        this.stripeService = stripeService;
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
            const apiUrl = process.env.API_URL || process.env.BACKEND_URL || 'http://localhost:8000';
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
            this.logger.log(`Creator profile data: firstName=${user.creatorProfile.firstName}, lastName=${user.creatorProfile.lastName}, dateOfBirth=${user.creatorProfile.dateOfBirth}`);
            const sessionData = {
                verification: {
                    callback: `${apiUrl}/api/veriff/webhooks/decision`,
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
            this.logger.log(`Veriff session data: ${JSON.stringify(sessionData, null, 2)}`);
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
                emailVerified: user.emailVerified,
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
                include: { user: true },
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
            const emailSubject = verificationStatus === client_1.VerificationStatus.VERIFIED
                ? 'Identity Verification Approved'
                : 'Identity Verification Update';
            const emailMessage = verificationStatus === client_1.VerificationStatus.VERIFIED
                ? `Congratulations! Your identity has been verified. You can now upload content.`
                : `Your identity verification status has been updated to: ${verificationStatus}`;
            try {
                await this.emailService.sendEmail({
                    to: creatorProfile.user.email,
                    subject: emailSubject,
                    html: emailMessage,
                });
                this.logger.log(`Verification status email sent to ${creatorProfile.user.email}`);
            }
            catch (error) {
                this.logger.error('Failed to send verification email:', error);
            }
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
            let stripeAccountId = user.creatorProfile.stripeAccountId;
            if (!stripeAccountId) {
                this.logger.log(`Creating Stripe Connect account for user: ${userId}`);
                const stripeAccount = await this.stripeService.createConnectAccount(user.email, {
                    userId: user.id,
                    creatorId: user.creatorProfile.id,
                    displayName: user.creatorProfile.displayName,
                });
                stripeAccountId = stripeAccount.id;
                this.logger.log(`Stripe Connect account created: ${stripeAccountId}`);
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
                    stripeAccountId,
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
                stripeAccountId: updatedProfile.stripeAccountId,
            };
        }
        catch (error) {
            this.logger.error(`Failed to setup bank account for user ${userId}:`, error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error?.message || 'Failed to setup bank account');
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
                stripeAccountId: profile.stripeAccountId || undefined,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get bank account for user ${userId}:`, error);
            throw error;
        }
    }
    async deleteBankAccount(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { creatorProfile: true },
            });
            if (!user || !user.creatorProfile) {
                throw new common_1.NotFoundException('Creator profile not found');
            }
            const activePayouts = await this.prisma.payoutRequest.findMany({
                where: {
                    creatorId: user.creatorProfile.id,
                    status: {
                        in: ['PENDING', 'APPROVED', 'PROCESSING'],
                    },
                },
            });
            if (activePayouts.length > 0) {
                throw new common_1.BadRequestException('Cannot delete bank account while you have pending payout requests. Please wait for them to be completed or cancelled.');
            }
            await this.prisma.creatorProfile.update({
                where: { id: user.creatorProfile.id },
                data: {
                    bankAccountName: null,
                    bankName: null,
                    bankAccountNumber: null,
                    bankRoutingNumber: null,
                    bankSwiftCode: null,
                    bankIban: null,
                    bankCountry: null,
                    bankCurrency: 'USD',
                    payoutSetupCompleted: false,
                },
            });
            this.logger.log(`Bank account deleted for user: ${userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete bank account for user ${userId}:`, error);
            throw error;
        }
    }
    async requestPayout(userId, requestedAmount) {
        try {
            this.logger.log(`Payout request initiated by user: ${userId} for amount: ${requestedAmount}`);
            const result = await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.findUnique({
                    where: { id: userId },
                    include: { creatorProfile: true },
                });
                if (!user || !user.creatorProfile) {
                    throw new common_1.NotFoundException('Creator profile not found');
                }
                if (requestedAmount < 50) {
                    throw new common_1.BadRequestException('Minimum payout amount is $50');
                }
                let availableBalance = user.creatorProfile.availableBalance || 0;
                const activePayoutsAggregation = await tx.payoutRequest.aggregate({
                    where: {
                        creatorId: user.creatorProfile.id,
                        status: { in: ['PENDING', 'APPROVED', 'PROCESSING'] },
                    },
                    _sum: {
                        requestedAmount: true,
                    },
                });
                const reservedForPayouts = activePayoutsAggregation._sum.requestedAmount || 0;
                availableBalance = Math.max(0, availableBalance - reservedForPayouts);
                let bonusMessage = '';
                if (user.creatorProfile.waitlistBonus > 0 && !user.creatorProfile.bonusWithdrawn) {
                    if (user.creatorProfile.totalPurchases >= 5) {
                        availableBalance = availableBalance + user.creatorProfile.waitlistBonus;
                    }
                    else {
                        const remainingSales = 5 - user.creatorProfile.totalPurchases;
                        bonusMessage = ` (Plus $${user.creatorProfile.waitlistBonus.toFixed(2)} bonus unlocks after ${remainingSales} more sale${remainingSales > 1 ? 's' : ''})`;
                    }
                }
                if (requestedAmount > availableBalance) {
                    throw new common_1.BadRequestException(`Insufficient balance. Available: $${availableBalance.toFixed(2)}${bonusMessage}, Requested: $${requestedAmount.toFixed(2)}`);
                }
                const existingPendingRequest = await tx.payoutRequest.findFirst({
                    where: {
                        creatorId: user.creatorProfile.id,
                        status: 'PENDING',
                    },
                });
                if (existingPendingRequest) {
                    throw new common_1.BadRequestException('You already have a pending payout request');
                }
                const payoutRequest = await tx.payoutRequest.create({
                    data: {
                        creatorId: user.creatorProfile.id,
                        requestedAmount,
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
                    payoutRequest,
                    user,
                    availableBalance,
                };
            }, { maxWait: 5000, timeout: 10000 });
            try {
                if (!result.user.creatorProfile) {
                    throw new Error('Creator profile not found after transaction');
                }
                await this.notificationsService.notifyAdmins(create_notification_dto_1.NotificationType.PAYOUT_REQUEST, 'New Payout Request', `${result.user.creatorProfile.displayName} has requested a payout of $${requestedAmount.toFixed(2)}`, {
                    requestId: result.payoutRequest.id,
                    creatorId: result.user.creatorProfile.id,
                    creatorName: result.user.creatorProfile.displayName,
                    amount: requestedAmount,
                    availableBalance: result.availableBalance,
                });
                const admins = await this.prisma.user.findMany({
                    where: {
                        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
                        isActive: true,
                    },
                    select: { email: true },
                });
                const emailData = {
                    creator_name: result.user.creatorProfile.displayName,
                    amount: `${requestedAmount.toFixed(2)}`,
                    request_id: result.payoutRequest.id,
                    available_balance: `${result.availableBalance.toFixed(2)}`,
                };
                for (const admin of admins) {
                    try {
                        await this.emailService.sendAdminPayoutAlert(admin.email, emailData);
                    }
                    catch (emailError) {
                        this.logger.error(`Failed to send payout alert email to ${admin.email}:`, emailError);
                    }
                }
                this.logger.log(`Admin notifications sent for payout request: ${result.payoutRequest.id}`);
            }
            catch (notificationError) {
                this.logger.error(`Failed to send admin notifications for payout request ${result.payoutRequest.id}:`, notificationError);
            }
            return {
                id: result.payoutRequest.id,
                requestedAmount: result.payoutRequest.requestedAmount,
                availableBalance: result.availableBalance,
                currency: result.payoutRequest.currency,
                status: result.payoutRequest.status,
                createdAt: result.payoutRequest.createdAt,
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
            const completedPayouts = await this.prisma.payout.aggregate({
                where: {
                    creatorId: user.creatorProfile.id,
                    status: 'COMPLETED',
                },
                _sum: {
                    amount: true,
                },
            });
            const totalPayouts = completedPayouts._sum.amount || 0;
            let currentBalance = user.creatorProfile.totalEarnings - totalPayouts;
            if (user.creatorProfile.waitlistBonus > 0 && !user.creatorProfile.bonusWithdrawn) {
                if (user.creatorProfile.totalPurchases >= 5) {
                    currentBalance = currentBalance + user.creatorProfile.waitlistBonus;
                }
            }
            return requests.map(request => ({
                id: request.id,
                requestedAmount: request.requestedAmount,
                availableBalance: currentBalance,
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
            const currentBalance = user.creatorProfile.totalEarnings;
            return {
                id: request.id,
                requestedAmount: request.requestedAmount,
                availableBalance: currentBalance,
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
    async getStripeOnboardingLink(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { creatorProfile: true },
            });
            if (!user || !user.creatorProfile) {
                throw new common_1.NotFoundException('Creator profile not found');
            }
            if (!user.creatorProfile.stripeAccountId) {
                throw new common_1.BadRequestException('Please set up your bank account details first before completing Stripe onboarding');
            }
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
            const accountLink = await this.stripeService.createAccountLink(user.creatorProfile.stripeAccountId, `${clientUrl}/creator/settings?tab=payout&refresh=true`, `${clientUrl}/creator/settings?tab=payout&success=true`);
            this.logger.log(`Stripe onboarding link created for user: ${userId}`);
            return {
                url: accountLink.url,
                expiresAt: new Date(accountLink.expires_at * 1000),
            };
        }
        catch (error) {
            this.logger.error(`Failed to create Stripe onboarding link for user ${userId}:`, error);
            throw error;
        }
    }
    async getStripeAccountStatus(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { creatorProfile: true },
            });
            if (!user || !user.creatorProfile) {
                throw new common_1.NotFoundException('Creator profile not found');
            }
            if (!user.creatorProfile.stripeAccountId) {
                return {
                    hasAccount: false,
                    onboardingComplete: false,
                    chargesEnabled: false,
                    payoutsEnabled: false,
                };
            }
            const account = await this.stripeService.getConnectAccount(user.creatorProfile.stripeAccountId);
            return {
                hasAccount: true,
                onboardingComplete: account.details_submitted || false,
                chargesEnabled: account.charges_enabled || false,
                payoutsEnabled: account.payouts_enabled || false,
                requiresAction: !account.details_submitted,
                accountId: account.id,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get Stripe account status for user ${userId}:`, error);
            throw error;
        }
    }
};
exports.CreatorsService = CreatorsService;
exports.CreatorsService = CreatorsService = CreatorsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        veriff_service_1.VeriffService,
        email_service_1.EmailService,
        notifications_service_1.NotificationsService,
        stripe_service_1.StripeService])
], CreatorsService);
//# sourceMappingURL=creators.service.js.map
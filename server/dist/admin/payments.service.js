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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const notifications_service_1 = require("../notifications/notifications.service");
const stripe_service_1 = require("../stripe/stripe.service");
const create_notification_dto_1 = require("../notifications/dto/create-notification.dto");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(prisma, emailService, notificationsService, stripeService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.notificationsService = notificationsService;
        this.stripeService = stripeService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async getPaymentStats() {
        const completedPurchases = await this.prisma.purchase.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true },
            _count: true,
        });
        const completedPayouts = await this.prisma.payout.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true },
        });
        const pendingPayouts = await this.prisma.payout.aggregate({
            where: { status: 'PENDING' },
            _sum: { amount: true },
        });
        const pendingRequests = await this.prisma.payoutRequest.aggregate({
            where: { status: 'PENDING' },
            _sum: { requestedAmount: true },
        });
        const rejectedRequests = await this.prisma.payoutRequest.count({
            where: { status: 'REJECTED' },
        });
        const totalPending = (pendingPayouts._sum.amount || 0) + (pendingRequests._sum.requestedAmount || 0);
        const failedTransactions = await this.prisma.purchase.count({
            where: { status: 'FAILED' },
        });
        return {
            totalRevenue: completedPurchases._sum.amount || 0,
            totalPayouts: completedPayouts._sum.amount || 0,
            pendingPayouts: totalPending,
            rejectedPayouts: rejectedRequests,
            failedTransactions,
        };
    }
    async getTransactions(query) {
        const { search, status, paymentMethod, startDate, endDate, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        if (status && ['REJECTED', 'APPROVED', 'PROCESSING'].includes(status)) {
            return this.getPayoutRequestTransactions(query);
        }
        const where = {};
        if (search) {
            where.OR = [
                { id: { contains: search, mode: 'insensitive' } },
                { transactionId: { contains: search, mode: 'insensitive' } },
                {
                    content: {
                        creator: {
                            displayName: { contains: search, mode: 'insensitive' },
                        },
                    },
                },
            ];
        }
        if (status) {
            where.status = status;
        }
        if (paymentMethod) {
            where.paymentProvider = paymentMethod;
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const [transactions, total] = await Promise.all([
            this.prisma.purchase.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    content: {
                        include: {
                            creator: {
                                select: {
                                    displayName: true,
                                    user: {
                                        select: {
                                            email: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    buyerSession: {
                        select: {
                            email: true,
                            fingerprint: true,
                        },
                    },
                },
            }),
            this.prisma.purchase.count({ where }),
        ]);
        return {
            success: true,
            data: transactions.map((t) => ({
                id: t.id,
                transactionId: t.transactionId,
                creatorName: t.content.creator.displayName,
                creatorEmail: t.content.creator.user.email,
                buyerEmail: t.buyerSession.email || 'Anonymous',
                contentTitle: t.content.title,
                amount: t.amount,
                currency: t.currency,
                paymentMethod: t.paymentProvider,
                status: t.status,
                createdAt: t.createdAt,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getPayoutRequestTransactions(query) {
        const { search, status, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { id: { contains: search, mode: 'insensitive' } },
                {
                    creator: {
                        displayName: { contains: search, mode: 'insensitive' },
                    },
                },
                {
                    creator: {
                        user: {
                            email: { contains: search, mode: 'insensitive' },
                        },
                    },
                },
            ];
        }
        if (status) {
            where.status = status;
        }
        const [payoutRequests, total] = await Promise.all([
            this.prisma.payoutRequest.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    creator: {
                        select: {
                            displayName: true,
                            user: {
                                select: {
                                    email: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.payoutRequest.count({ where }),
        ]);
        return {
            success: true,
            data: payoutRequests.map((pr) => ({
                id: pr.id,
                transactionId: pr.id,
                creatorName: pr.creator.displayName,
                creatorEmail: pr.creator.user.email,
                buyerEmail: 'Payout Request',
                contentTitle: 'Withdrawal Request',
                amount: pr.requestedAmount,
                currency: pr.currency,
                paymentMethod: 'Bank Transfer',
                status: pr.status,
                createdAt: pr.createdAt,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getTransactionById(id) {
        const transaction = await this.prisma.purchase.findUnique({
            where: { id },
            include: {
                content: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                displayName: true,
                                profileImage: true,
                                user: {
                                    select: {
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
                buyerSession: true,
            },
        });
        if (!transaction) {
            return {
                success: false,
                message: 'Transaction not found',
            };
        }
        return {
            success: true,
            data: {
                id: transaction.id,
                transactionId: transaction.transactionId,
                paymentIntentId: transaction.paymentIntentId,
                creator: {
                    id: transaction.content.creator.id,
                    name: transaction.content.creator.displayName,
                    email: transaction.content.creator.user.email,
                    profileImage: transaction.content.creator.profileImage,
                },
                buyer: {
                    email: transaction.buyerSession.email,
                    sessionId: transaction.buyerSession.id,
                    fingerprint: transaction.buyerSession.fingerprint,
                    ipAddress: transaction.buyerSession.ipAddress,
                },
                content: {
                    id: transaction.content.id,
                    title: transaction.content.title,
                    thumbnailUrl: transaction.content.thumbnailUrl,
                },
                amount: transaction.amount,
                currency: transaction.currency,
                paymentProvider: transaction.paymentProvider,
                status: transaction.status,
                accessToken: transaction.accessToken,
                viewCount: transaction.viewCount,
                lastViewedAt: transaction.lastViewedAt,
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt,
            },
        };
    }
    async getPayouts(query) {
        const { search, status, startDate, endDate, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { id: { contains: search, mode: 'insensitive' } },
                {
                    creator: {
                        displayName: { contains: search, mode: 'insensitive' },
                    },
                },
            ];
        }
        if (status) {
            where.status = status;
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const [payouts, total] = await Promise.all([
            this.prisma.payout.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    creator: {
                        select: {
                            displayName: true,
                            user: {
                                select: {
                                    email: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.payout.count({ where }),
        ]);
        return {
            success: true,
            data: payouts.map((p) => ({
                id: p.id,
                creatorName: p.creator.displayName,
                creatorEmail: p.creator.user.email,
                amount: p.amount,
                currency: p.currency,
                status: p.status,
                paymentMethod: p.paymentMethod,
                paymentId: p.paymentId,
                processedAt: p.processedAt,
                notes: p.notes,
                createdAt: p.createdAt,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async processPayout(payoutId) {
        const payout = await this.prisma.payout.findUnique({
            where: { id: payoutId },
            include: {
                creator: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!payout) {
            throw new common_1.NotFoundException('Payout not found');
        }
        if (payout.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Cannot process payout with status: ${payout.status}`);
        }
        if (!payout.creator.stripeAccountId) {
            throw new common_1.BadRequestException('Creator does not have a connected payout account. Please complete payout setup.');
        }
        this.logger.log(`Processing payout ${payoutId} for creator ${payout.creator.id}`);
        try {
            await this.prisma.payout.update({
                where: { id: payoutId },
                data: { status: 'PROCESSING' },
            });
            const stripeAccount = await this.stripeService.getConnectAccount(payout.creator.stripeAccountId);
            if (!stripeAccount.charges_enabled || !stripeAccount.payouts_enabled) {
                throw new common_1.BadRequestException('Creator Stripe account is not fully set up. Please complete onboarding.');
            }
            const stripePayout = await this.stripeService.createPayout(payout.amount, payout.currency, payout.creator.stripeAccountId, {
                payoutId: payout.id,
                creatorId: payout.creator.id,
                creatorEmail: payout.creator.user.email,
            });
            this.logger.log(`Stripe payout created: ${stripePayout.id} for payout ${payoutId}`);
            const updatedPayout = await this.prisma.$transaction(async (tx) => {
                if (payout.creator.waitlistBonus > 0 &&
                    !payout.creator.bonusWithdrawn &&
                    payout.creator.totalPurchases >= 5) {
                    await tx.creatorProfile.update({
                        where: { id: payout.creator.id },
                        data: { bonusWithdrawn: true },
                    });
                }
                const status = stripePayout.status === 'paid' ? 'COMPLETED' : 'PROCESSING';
                const updatedPayout = await tx.payout.update({
                    where: { id: payoutId },
                    data: {
                        status,
                        paymentId: stripePayout.id,
                        processedAt: status === 'COMPLETED' ? new Date() : null,
                        notes: `Stripe payout: ${stripePayout.id}. Status: ${stripePayout.status}`,
                    },
                });
                if (updatedPayout.id) {
                    const payoutRequest = await tx.payoutRequest.findFirst({
                        where: { payoutId: updatedPayout.id },
                    });
                    if (payoutRequest) {
                        await tx.payoutRequest.update({
                            where: { id: payoutRequest.id },
                            data: { status },
                        });
                    }
                }
                return updatedPayout;
            });
            await this.notificationsService.createNotification({
                userId: payout.creator.userId,
                type: create_notification_dto_1.NotificationType.PAYOUT_SENT,
                title: 'Payout Processed',
                message: `Your payout of $${payout.amount.toFixed(2)} has been processed and is on its way to your bank account.`,
                metadata: {
                    payoutId: payout.id,
                    amount: payout.amount,
                    stripePayoutId: stripePayout.id,
                },
            });
            await this.emailService.sendPayoutProcessed(payout.creator.user.email, {
                creator_name: payout.creator.displayName,
                amount: payout.amount.toFixed(2),
                payout_date: new Date().toLocaleDateString(),
                transaction_id: stripePayout.id,
            });
            this.logger.log(`Payout ${payoutId} processed successfully`);
            return {
                success: true,
                message: 'Payout processed successfully',
                data: {
                    id: updatedPayout.id,
                    amount: updatedPayout.amount,
                    status: updatedPayout.status,
                    paymentId: updatedPayout.paymentId,
                    stripeStatus: stripePayout.status,
                    estimatedArrival: stripePayout.arrival_date
                        ? new Date(stripePayout.arrival_date * 1000).toLocaleDateString()
                        : 'Processing',
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to process payout ${payoutId}:`, error);
            await this.prisma.payout.update({
                where: { id: payoutId },
                data: {
                    status: 'FAILED',
                    notes: `Failed to process: ${error?.message || 'Unknown error'}`,
                },
            });
            await this.notificationsService.createNotification({
                userId: payout.creator.userId,
                type: create_notification_dto_1.NotificationType.PAYOUT_REJECTED,
                title: 'Payout Failed',
                message: `Your payout of $${payout.amount.toFixed(2)} failed to process. Please contact support.`,
                metadata: {
                    payoutId: payout.id,
                    amount: payout.amount,
                    error: error?.message || 'Unknown error',
                },
            });
            throw new common_1.BadRequestException(`Failed to process payout: ${error?.message || 'Unknown error'}`);
        }
    }
    async getRevenueChart(period) {
        const now = new Date();
        let startDate;
        let groupBy;
        switch (period) {
            case 'weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                groupBy = 'day';
                break;
            case 'monthly':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                groupBy = 'day';
                break;
            case 'yearly':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                groupBy = 'month';
                break;
        }
        const purchases = await this.prisma.purchase.findMany({
            where: {
                status: 'COMPLETED',
                createdAt: {
                    gte: startDate,
                },
            },
            select: {
                amount: true,
                createdAt: true,
            },
        });
        const grouped = {};
        purchases.forEach((purchase) => {
            const key = groupBy === 'day'
                ? (purchase.createdAt.toISOString().split('T')[0] || '')
                : `${purchase.createdAt.getFullYear()}-${String(purchase.createdAt.getMonth() + 1).padStart(2, '0')}`;
            if (!grouped[key]) {
                grouped[key] = { revenue: 0, count: 0 };
            }
            grouped[key].revenue += purchase.amount;
            grouped[key].count += 1;
        });
        return Object.entries(grouped)
            .map(([period, data]) => ({
            period,
            revenue: data.revenue,
            count: data.count,
        }))
            .sort((a, b) => a.period.localeCompare(b.period));
    }
    async getPayoutRequests(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status && query.status !== 'ALL') {
            where.status = query.status;
        }
        if (query.creatorId) {
            where.creatorId = query.creatorId;
        }
        const [requests, total] = await Promise.all([
            this.prisma.payoutRequest.findMany({
                where,
                include: {
                    creator: {
                        include: {
                            user: {
                                select: {
                                    email: true,
                                    displayName: true,
                                },
                            },
                        },
                    },
                    payout: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.payoutRequest.count({ where }),
        ]);
        return {
            success: true,
            data: requests,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getPayoutRequestDetails(requestId) {
        const request = await this.prisma.payoutRequest.findUnique({
            where: { id: requestId },
            include: {
                creator: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                displayName: true,
                            },
                        },
                    },
                },
                payout: true,
            },
        });
        if (!request) {
            throw new common_1.NotFoundException('Payout request not found');
        }
        return {
            success: true,
            data: request,
        };
    }
    async approvePayoutRequest(requestId, adminUserId, reviewNotes) {
        const request = await this.prisma.payoutRequest.findUnique({
            where: { id: requestId },
            include: {
                creator: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!request) {
            throw new common_1.NotFoundException('Payout request not found');
        }
        if (request.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Cannot approve payout request with status: ${request.status}`);
        }
        if (request.creator.availableBalance < request.requestedAmount) {
            throw new common_1.BadRequestException('Creator no longer has sufficient available balance');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedRequest = await tx.payoutRequest.update({
                where: { id: requestId },
                data: {
                    status: 'PROCESSING',
                    reviewedBy: adminUserId,
                    reviewedAt: new Date(),
                    reviewNotes: reviewNotes || 'Approved for processing',
                },
            });
            const payout = await tx.payout.create({
                data: {
                    creatorId: request.creatorId,
                    amount: request.requestedAmount,
                    currency: request.currency,
                    status: 'PROCESSING',
                    paymentMethod: 'STRIPE',
                    notes: `Approved by admin - Request ID: ${requestId}`,
                },
            });
            await tx.payoutRequest.update({
                where: { id: requestId },
                data: { payoutId: payout.id },
            });
            return { request: updatedRequest, payout };
        });
        await this.notificationsService.createNotification({
            userId: request.creator.userId,
            type: create_notification_dto_1.NotificationType.PAYOUT_APPROVED,
            title: 'Payout Request Approved',
            message: `Your payout request for $${request.requestedAmount.toFixed(2)} has been approved and will be processed shortly.`,
            metadata: {
                requestId: requestId,
                payoutId: result.payout.id,
                amount: request.requestedAmount,
            },
        });
        await this.emailService.sendPayoutApproved(request.creator.user.email, {
            creator_name: request.creator.displayName,
            amount: `$${request.requestedAmount.toFixed(2)}`,
            request_id: requestId,
        });
        return {
            success: true,
            message: 'Payout request approved',
            data: result,
        };
    }
    async rejectPayoutRequest(requestId, adminUserId, reviewNotes) {
        const request = await this.prisma.payoutRequest.findUnique({
            where: { id: requestId },
            include: {
                creator: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!request) {
            throw new common_1.NotFoundException('Payout request not found');
        }
        if (request.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Cannot reject payout request with status: ${request.status}`);
        }
        const updatedRequest = await this.prisma.payoutRequest.update({
            where: { id: requestId },
            data: {
                status: 'REJECTED',
                reviewedBy: adminUserId,
                reviewedAt: new Date(),
                reviewNotes: reviewNotes,
            },
        });
        await this.notificationsService.createNotification({
            userId: request.creator.userId,
            type: create_notification_dto_1.NotificationType.PAYOUT_REJECTED,
            title: 'Payout Request Rejected',
            message: `Your payout request for $${request.requestedAmount.toFixed(2)} has been rejected. Reason: ${reviewNotes}`,
            metadata: {
                requestId: requestId,
                amount: request.requestedAmount,
                reason: reviewNotes,
            },
        });
        await this.emailService.sendPayoutRejected(request.creator.user.email, {
            creator_name: request.creator.displayName,
            amount: `$${request.requestedAmount.toFixed(2)}`,
            reason: reviewNotes,
        });
        return {
            success: true,
            message: 'Payout request rejected',
            data: updatedRequest,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        notifications_service_1.NotificationsService,
        stripe_service_1.StripeService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map
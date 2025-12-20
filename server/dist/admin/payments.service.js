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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
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
        const failedTransactions = await this.prisma.purchase.count({
            where: { status: 'FAILED' },
        });
        return {
            totalRevenue: completedPurchases._sum.amount || 0,
            totalPayouts: completedPayouts._sum.amount || 0,
            pendingPayouts: pendingPayouts._sum.amount || 0,
            failedTransactions,
        };
    }
    async getTransactions(query) {
        const { search, status, paymentMethod, startDate, endDate, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
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
                creator: t.content.creator.displayName,
                creatorEmail: t.content.creator.user.email,
                buyer: t.buyerSession.email || 'Anonymous',
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
        });
        if (!payout) {
            return {
                success: false,
                message: 'Payout not found',
            };
        }
        if (payout.status !== 'PENDING') {
            return {
                success: false,
                message: `Cannot process payout with status: ${payout.status}`,
            };
        }
        const updatedPayout = await this.prisma.payout.update({
            where: { id: payoutId },
            data: {
                status: 'PROCESSING',
            },
        });
        return {
            success: true,
            message: 'Payout is being processed',
            data: updatedPayout,
        };
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map
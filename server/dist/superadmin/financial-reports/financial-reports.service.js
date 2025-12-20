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
exports.FinancialReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const query_financial_reports_dto_1 = require("./dto/query-financial-reports.dto");
let FinancialReportsService = class FinancialReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getDateRange(timeRange, customStart, customEnd) {
        const now = new Date();
        let startDate;
        let endDate = new Date(now);
        switch (timeRange) {
            case query_financial_reports_dto_1.TimeRange.TODAY:
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
                break;
            case query_financial_reports_dto_1.TimeRange.YESTERDAY:
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                startDate = new Date(yesterday.setHours(0, 0, 0, 0));
                endDate = new Date(yesterday.setHours(23, 59, 59, 999));
                break;
            case query_financial_reports_dto_1.TimeRange.LAST_7_DAYS:
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
                break;
            case query_financial_reports_dto_1.TimeRange.LAST_30_DAYS:
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 30);
                break;
            case query_financial_reports_dto_1.TimeRange.THIS_MONTH:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case query_financial_reports_dto_1.TimeRange.LAST_MONTH:
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                startDate = lastMonth;
                endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                break;
            case query_financial_reports_dto_1.TimeRange.THIS_YEAR:
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case query_financial_reports_dto_1.TimeRange.CUSTOM:
                startDate = customStart ? new Date(customStart) : new Date(now);
                startDate.setDate(startDate.getDate() - 30);
                endDate = customEnd ? new Date(customEnd) : new Date(now);
                break;
            default:
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 30);
        }
        return { startDate, endDate };
    }
    async getFinancialOverview(query) {
        const { startDate, endDate } = this.getDateRange(query.timeRange || query_financial_reports_dto_1.TimeRange.LAST_30_DAYS, query.startDate, query.endDate);
        const revenueData = await this.prisma.purchase.aggregate({
            where: {
                status: 'COMPLETED',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                amount: true,
            },
            _count: true,
        });
        const payoutData = await this.prisma.payout.aggregate({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                amount: true,
            },
            _count: true,
        });
        const pendingPayouts = await this.prisma.payout.aggregate({
            where: {
                status: 'PENDING',
            },
            _sum: {
                amount: true,
            },
            _count: true,
        });
        const totalRevenue = revenueData._sum.amount || 0;
        const totalPayouts = payoutData._sum.amount || 0;
        const platformRevenue = totalRevenue - totalPayouts;
        const avgTransactionValue = revenueData._count > 0 ? totalRevenue / revenueData._count : 0;
        const topCreators = await this.prisma.creatorProfile.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                totalEarnings: true,
                user: {
                    select: {
                        email: true,
                    },
                },
            },
            orderBy: {
                totalEarnings: 'desc',
            },
            take: 5,
        });
        return {
            totalRevenue,
            totalPayouts,
            platformRevenue,
            pendingPayoutsAmount: pendingPayouts._sum.amount || 0,
            pendingPayoutsCount: pendingPayouts._count,
            totalTransactions: revenueData._count,
            avgTransactionValue,
            topCreators: topCreators.map((creator) => ({
                id: creator.id,
                name: `${creator.firstName || ''} ${creator.lastName || ''}`.trim() || creator.user.email,
                email: creator.user.email,
                totalEarnings: creator.totalEarnings,
            })),
            dateRange: {
                startDate,
                endDate,
            },
        };
    }
    async getRevenueReport(query) {
        const { startDate, endDate } = this.getDateRange(query.timeRange || query_financial_reports_dto_1.TimeRange.LAST_30_DAYS, query.startDate, query.endDate);
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {
            status: 'COMPLETED',
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        };
        if (query.creatorId) {
            where.content = {
                creatorId: query.creatorId,
            };
        }
        const [purchases, total] = await Promise.all([
            this.prisma.purchase.findMany({
                where,
                include: {
                    content: {
                        include: {
                            creator: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    user: {
                                        select: {
                                            email: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.purchase.count({ where }),
        ]);
        return {
            data: purchases.map((purchase) => ({
                id: purchase.id,
                amount: purchase.amount,
                currency: purchase.currency,
                paymentProvider: purchase.paymentProvider,
                transactionId: purchase.transactionId,
                status: purchase.status,
                createdAt: purchase.createdAt,
                content: {
                    id: purchase.content.id,
                    title: purchase.content.title,
                    price: purchase.content.price,
                },
                creator: {
                    id: purchase.content.creator.id,
                    name: `${purchase.content.creator.firstName || ''} ${purchase.content.creator.lastName || ''}`.trim() || purchase.content.creator.user.email,
                    email: purchase.content.creator.user.email,
                },
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getPayoutReport(query) {
        const { startDate, endDate } = this.getDateRange(query.timeRange || query_financial_reports_dto_1.TimeRange.LAST_30_DAYS, query.startDate, query.endDate);
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        };
        if (query.creatorId) {
            where.creatorId = query.creatorId;
        }
        if (query.status) {
            where.status = query.status;
        }
        const [payouts, total] = await Promise.all([
            this.prisma.payout.findMany({
                where,
                include: {
                    creator: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            paypalEmail: true,
                            stripeAccountId: true,
                            user: {
                                select: {
                                    email: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.payout.count({ where }),
        ]);
        return {
            data: payouts.map((payout) => ({
                id: payout.id,
                amount: payout.amount,
                currency: payout.currency,
                status: payout.status,
                paymentMethod: payout.paymentMethod,
                paymentId: payout.paymentId,
                processedAt: payout.processedAt,
                notes: payout.notes,
                createdAt: payout.createdAt,
                creator: {
                    id: payout.creator.id,
                    name: `${payout.creator.firstName || ''} ${payout.creator.lastName || ''}`.trim() || payout.creator.user.email,
                    email: payout.creator.user.email,
                    paypalEmail: payout.creator.paypalEmail,
                    stripeAccountId: payout.creator.stripeAccountId,
                },
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getRevenueAnalytics(query) {
        const { startDate, endDate } = this.getDateRange(query.timeRange || query_financial_reports_dto_1.TimeRange.LAST_30_DAYS, query.startDate, query.endDate);
        const dailyRevenue = await this.prisma.$queryRaw `
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(amount), 0) as revenue,
        COUNT(*) as count
      FROM purchases
      WHERE status = 'COMPLETED'
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
        return {
            dailyRevenue: dailyRevenue.map((item) => ({
                date: item.date,
                revenue: Number(item.revenue),
                transactions: Number(item.count),
            })),
            dateRange: {
                startDate,
                endDate,
            },
        };
    }
    async getPayoutStats() {
        const [pending, processing, completed, failed] = await Promise.all([
            this.prisma.payout.aggregate({
                where: { status: 'PENDING' },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.payout.aggregate({
                where: { status: 'PROCESSING' },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.payout.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.payout.aggregate({
                where: { status: 'FAILED' },
                _sum: { amount: true },
                _count: true,
            }),
        ]);
        return {
            pending: {
                count: pending._count,
                amount: pending._sum.amount || 0,
            },
            processing: {
                count: processing._count,
                amount: processing._sum.amount || 0,
            },
            completed: {
                count: completed._count,
                amount: completed._sum.amount || 0,
            },
            failed: {
                count: failed._count,
                amount: failed._sum.amount || 0,
            },
        };
    }
    async getCreatorEarnings(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.creatorId) {
            where.id = query.creatorId;
        }
        const [creators, total] = await Promise.all([
            this.prisma.creatorProfile.findMany({
                where,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    totalEarnings: true,
                    totalPurchases: true,
                    payoutStatus: true,
                    user: {
                        select: {
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            payouts: true,
                        },
                    },
                },
                orderBy: {
                    totalEarnings: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.creatorProfile.count({ where }),
        ]);
        return {
            data: creators.map((creator) => ({
                id: creator.id,
                name: `${creator.firstName || ''} ${creator.lastName || ''}`.trim() || creator.user.email,
                email: creator.user.email,
                totalEarnings: creator.totalEarnings,
                totalPurchases: creator.totalPurchases,
                payoutStatus: creator.payoutStatus,
                totalPayouts: creator._count.payouts,
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.FinancialReportsService = FinancialReportsService;
exports.FinancialReportsService = FinancialReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinancialReportsService);
//# sourceMappingURL=financial-reports.service.js.map
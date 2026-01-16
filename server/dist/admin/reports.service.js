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
var ReportsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = ReportsService_1 = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ReportsService_1.name);
    }
    async getCreatorPerformance(limit, sortBy) {
        try {
            const creators = await this.prisma.creatorProfile.findMany({
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                    content: {
                        include: {
                            purchases: {
                                where: {
                                    status: 'COMPLETED',
                                },
                                select: {
                                    amount: true,
                                    createdAt: true,
                                },
                            },
                        },
                    },
                },
            });
            const performanceData = creators.map((creator) => {
                const totalRevenue = creator.content.reduce((sum, content) => sum +
                    content.purchases.reduce((purchaseSum, purchase) => purchaseSum + Number(purchase.amount), 0), 0);
                const contentCount = creator.content.length;
                const totalViews = creator.content.reduce((sum, content) => sum + (content.viewCount || 0), 0);
                const engagement = totalViews > 0 ? (creator.content.reduce((sum, content) => sum + content.purchases.length, 0) / totalViews) * 100 : 0;
                return {
                    creatorId: creator.id,
                    creatorName: creator.displayName,
                    totalViews,
                    totalRevenue,
                    contentCount,
                    engagement: Math.round(engagement * 10) / 10,
                    category: 'Digital Content',
                };
            });
            performanceData.sort((a, b) => {
                if (sortBy === 'revenue') {
                    return b.totalRevenue - a.totalRevenue;
                }
                else if (sortBy === 'views') {
                    return b.totalViews - a.totalViews;
                }
                else {
                    return b.engagement - a.engagement;
                }
            });
            return {
                success: true,
                data: performanceData.slice(0, limit),
            };
        }
        catch (error) {
            this.logger.error('Error fetching creator performance:', error);
            throw error;
        }
    }
    async getAnalyticsOverview() {
        try {
            const now = new Date();
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
            const [currentRevenue, lastMonthRevenue, currentCreators, lastMonthCreators, currentContent, lastMonthContent, currentTransactions,] = await Promise.all([
                this.prisma.purchase.aggregate({
                    where: {
                        status: 'COMPLETED',
                        createdAt: { gte: startOfThisMonth },
                    },
                    _sum: { amount: true },
                    _count: true,
                }),
                this.prisma.purchase.aggregate({
                    where: {
                        status: 'COMPLETED',
                        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                    },
                    _sum: { amount: true },
                }),
                this.prisma.creatorProfile.count({
                    where: {
                        user: {
                            emailVerified: true,
                        },
                        verificationStatus: 'VERIFIED',
                    },
                }),
                this.prisma.creatorProfile.count({
                    where: {
                        user: {
                            emailVerified: true,
                        },
                        verificationStatus: 'VERIFIED',
                        createdAt: { lte: endOfLastMonth },
                    },
                }),
                this.prisma.content.count({
                    where: {
                        createdAt: { gte: startOfThisMonth },
                    },
                }),
                this.prisma.content.count({
                    where: {
                        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                    },
                }),
                this.prisma.purchase.count({
                    where: {
                        status: 'COMPLETED',
                        createdAt: { gte: startOfThisMonth },
                    },
                }),
            ]);
            const totalRevenue = Number(currentRevenue._sum.amount || 0);
            const lastRevenue = Number(lastMonthRevenue._sum.amount || 0);
            const revenueGrowth = lastRevenue > 0 ? ((totalRevenue - lastRevenue) / lastRevenue) * 100 : 0;
            const creatorsGrowth = lastMonthCreators > 0
                ? ((currentCreators - lastMonthCreators) / lastMonthCreators) * 100
                : 0;
            const contentGrowth = lastMonthContent > 0
                ? ((currentContent - lastMonthContent) / lastMonthContent) * 100
                : 0;
            const avgTransactionValue = currentTransactions > 0 ? totalRevenue / currentTransactions : 0;
            return {
                success: true,
                data: {
                    totalRevenue,
                    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
                    activeCreators: currentCreators,
                    creatorsGrowth: Math.round(creatorsGrowth * 10) / 10,
                    contentUploaded: currentContent,
                    contentGrowth: Math.round(contentGrowth * 10) / 10,
                    avgTransactionValue: Math.round(avgTransactionValue * 100) / 100,
                },
            };
        }
        catch (error) {
            this.logger.error('Error fetching analytics overview:', error);
            throw error;
        }
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = ReportsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map
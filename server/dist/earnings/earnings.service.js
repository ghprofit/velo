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
exports.EarningsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EarningsService = class EarningsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCreatorProfile(userId) {
        const creatorProfile = await this.prisma.creatorProfile.findUnique({
            where: { userId },
        });
        if (!creatorProfile) {
            throw new common_1.NotFoundException('Creator profile not found');
        }
        return creatorProfile;
    }
    async getBalance(userId) {
        const creatorProfile = await this.getCreatorProfile(userId);
        const purchasesAggregation = await this.prisma.purchase.aggregate({
            where: {
                content: {
                    creatorId: creatorProfile.id,
                },
                status: 'COMPLETED',
            },
            _sum: {
                amount: true,
            },
        });
        const lifetimeEarnings = purchasesAggregation._sum.amount || 0;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const pendingPurchasesAggregation = await this.prisma.purchase.aggregate({
            where: {
                content: {
                    creatorId: creatorProfile.id,
                },
                status: 'COMPLETED',
                createdAt: {
                    gte: sevenDaysAgo,
                },
            },
            _sum: {
                amount: true,
            },
        });
        const pendingBalance = pendingPurchasesAggregation._sum.amount || 0;
        const payoutsAggregation = await this.prisma.payout.aggregate({
            where: {
                creatorId: creatorProfile.id,
                status: 'COMPLETED',
            },
            _sum: {
                amount: true,
            },
        });
        const totalPayouts = payoutsAggregation._sum.amount || 0;
        const availableBalance = lifetimeEarnings - pendingBalance - totalPayouts;
        return {
            lifetimeEarnings,
            pendingBalance,
            availableBalance: Math.max(0, availableBalance),
            totalPayouts,
            currency: 'USD',
        };
    }
    async getPayouts(userId, page = 1, limit = 10) {
        const creatorProfile = await this.getCreatorProfile(userId);
        const skip = (page - 1) * limit;
        const total = await this.prisma.payout.count({
            where: {
                creatorId: creatorProfile.id,
            },
        });
        const payouts = await this.prisma.payout.findMany({
            where: {
                creatorId: creatorProfile.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: limit,
        });
        const totalPages = Math.ceil(total / limit);
        return {
            payouts,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }
    async getTransactions(userId, page = 1, limit = 10, type, search) {
        const creatorProfile = await this.getCreatorProfile(userId);
        const purchases = type !== 'payout'
            ? await this.prisma.purchase.findMany({
                where: {
                    content: {
                        creatorId: creatorProfile.id,
                        ...(search && {
                            title: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        }),
                    },
                    status: 'COMPLETED',
                },
                include: {
                    content: {
                        select: {
                            title: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })
            : [];
        const payouts = type !== 'purchase'
            ? await this.prisma.payout.findMany({
                where: {
                    creatorId: creatorProfile.id,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })
            : [];
        const purchaseTransactions = purchases.map((purchase) => ({
            id: purchase.id,
            type: 'purchase',
            amount: purchase.amount,
            currency: purchase.currency,
            status: purchase.status,
            date: purchase.createdAt,
            description: `Purchase of "${purchase.content.title}"`,
            contentTitle: purchase.content.title,
            buyerSessionId: purchase.buyerSessionId,
        }));
        const payoutTransactions = payouts.map((payout) => ({
            id: payout.id,
            type: 'payout',
            amount: payout.amount,
            currency: payout.currency,
            status: payout.status,
            date: payout.createdAt,
            description: `Payout via ${payout.paymentMethod}`,
            paymentMethod: payout.paymentMethod,
        }));
        let allTransactions = [...purchaseTransactions, ...payoutTransactions].sort((a, b) => b.date.getTime() - a.date.getTime());
        if (search) {
            allTransactions = allTransactions.filter((transaction) => transaction.description
                .toLowerCase()
                .includes(search.toLowerCase()) ||
                transaction.contentTitle?.toLowerCase().includes(search.toLowerCase()));
        }
        const total = allTransactions.length;
        const totalPages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;
        const paginatedTransactions = allTransactions.slice(skip, skip + limit);
        return {
            transactions: paginatedTransactions,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }
};
exports.EarningsService = EarningsService;
exports.EarningsService = EarningsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EarningsService);
//# sourceMappingURL=earnings.service.js.map
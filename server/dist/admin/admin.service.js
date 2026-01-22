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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const totalCreators = await this.prisma.creatorProfile.count();
        const activeCreators = await this.prisma.creatorProfile.count({
            where: {
                user: {
                    isActive: true
                }
            },
        });
        const inactiveCreators = totalCreators - activeCreators;
        const earningsAggregate = await this.prisma.creatorProfile.aggregate({
            _sum: {
                totalEarnings: true,
            },
        });
        const totalEarnings = earningsAggregate._sum?.totalEarnings || 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const transactionsToday = await this.prisma.payout.count({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
        return {
            totalCreators,
            activeCreators,
            inactiveCreators,
            totalEarnings: Math.round(totalEarnings),
            transactionsToday,
        };
    }
    async getRevenueOverTime(period) {
        const days = parseInt(period);
        const data = [];
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            const dayRevenue = await this.prisma.purchase.aggregate({
                where: {
                    createdAt: {
                        gte: date,
                        lt: nextDate,
                    },
                    status: 'COMPLETED',
                },
                _sum: {
                    amount: true,
                },
            });
            data.push({
                date: date.toISOString().split('T')[0],
                amount: dayRevenue._sum?.amount || 0,
            });
        }
        return {
            data,
            period: `${days} days`,
        };
    }
    async getRecentActivity(limit = 10) {
        const recentPayouts = await this.prisma.payout.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        const activities = recentPayouts.map((payout) => {
            let status = 'Pending';
            let statusColor = 'bg-yellow-100 text-yellow-700';
            const activity = `Requested payout of $${payout.amount}`;
            switch (payout.status) {
                case 'COMPLETED':
                    status = 'Active';
                    statusColor = 'bg-green-100 text-green-700';
                    break;
                case 'FAILED':
                    status = 'Failed';
                    statusColor = 'bg-red-100 text-red-700';
                    break;
                case 'PENDING':
                    status = 'Pending';
                    statusColor = 'bg-yellow-100 text-yellow-700';
                    break;
                case 'PROCESSING':
                    status = 'Processing';
                    statusColor = 'bg-blue-100 text-blue-700';
                    break;
            }
            return {
                id: payout.id,
                creator: payout.creator?.displayName || 'Unknown',
                activity,
                date: payout.createdAt.toISOString(),
                status,
                statusColor,
            };
        });
        return { data: activities };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map
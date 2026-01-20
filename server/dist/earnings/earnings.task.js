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
var EarningsTaskService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EarningsTaskService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
let EarningsTaskService = EarningsTaskService_1 = class EarningsTaskService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(EarningsTaskService_1.name);
    }
    async releasePendingEarnings() {
        this.logger.log('Starting scheduled task: Release pending earnings');
        try {
            const purchasesToRelease = await this.prisma.purchase.findMany({
                where: {
                    earningsReleased: false,
                    earningsPendingUntil: {
                        lte: new Date(),
                    },
                    status: 'COMPLETED',
                },
                include: {
                    content: {
                        select: {
                            creatorId: true,
                        },
                    },
                },
            });
            this.logger.log(`Found ${purchasesToRelease.length} purchases ready to release earnings`);
            for (const purchase of purchasesToRelease) {
                try {
                    await this.prisma.$transaction(async (tx) => {
                        const earningsAmount = purchase.basePrice
                            ? purchase.basePrice * 0.9
                            : purchase.amount * 0.85;
                        await tx.creatorProfile.update({
                            where: { id: purchase.content.creatorId },
                            data: {
                                pendingBalance: { decrement: earningsAmount },
                                availableBalance: { increment: earningsAmount },
                            },
                        });
                        await tx.purchase.update({
                            where: { id: purchase.id },
                            data: {
                                earningsReleased: true,
                            },
                        });
                        this.logger.log(`Released earnings for purchase ${purchase.id}: $${earningsAmount.toFixed(2)} moved to available balance`);
                    });
                }
                catch (error) {
                    this.logger.error(`Failed to release earnings for purchase ${purchase.id}:`, error);
                }
            }
            this.logger.log('Completed scheduled task: Release pending earnings');
        }
        catch (error) {
            this.logger.error('Error in releasePendingEarnings task:', error);
        }
    }
    async triggerManualRelease() {
        this.logger.log('Manual trigger: Release pending earnings');
        const before = await this.prisma.purchase.count({
            where: {
                earningsReleased: false,
                earningsPendingUntil: { lte: new Date() },
                status: 'COMPLETED',
            },
        });
        await this.releasePendingEarnings();
        const after = await this.prisma.purchase.count({
            where: {
                earningsReleased: false,
                earningsPendingUntil: { lte: new Date() },
                status: 'COMPLETED',
            },
        });
        return {
            released: before - after,
            total: before,
        };
    }
};
exports.EarningsTaskService = EarningsTaskService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EarningsTaskService.prototype, "releasePendingEarnings", null);
exports.EarningsTaskService = EarningsTaskService = EarningsTaskService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EarningsTaskService);
//# sourceMappingURL=earnings.task.js.map
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
exports.PayoutEligibleGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PayoutEligibleGuard = class PayoutEligibleGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId;
        if (!userId) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                emailVerified: true,
                creatorProfile: {
                    select: {
                        verificationStatus: true,
                        payoutSetupCompleted: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        if (!user.creatorProfile) {
            throw new common_1.ForbiddenException('Creator profile not found');
        }
        const missingRequirements = [];
        if (!user.emailVerified) {
            missingRequirements.push('Email verification');
        }
        if (user.creatorProfile.verificationStatus !== 'VERIFIED') {
            missingRequirements.push('KYC verification');
        }
        if (!user.creatorProfile.payoutSetupCompleted) {
            missingRequirements.push('Bank details setup');
        }
        if (missingRequirements.length > 0) {
            throw new common_1.ForbiddenException(`Payout request not allowed. Please complete the following requirements: ${missingRequirements.join(', ')}`);
        }
        return true;
    }
};
exports.PayoutEligibleGuard = PayoutEligibleGuard;
exports.PayoutEligibleGuard = PayoutEligibleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayoutEligibleGuard);
//# sourceMappingURL=payout-eligible.guard.js.map
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
exports.CreatorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CreatorsService = class CreatorsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCreators(query) {
        const { search, kycStatus, accountStatus, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { displayName: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (kycStatus && kycStatus !== 'all') {
            where.verificationStatus = kycStatus.toUpperCase();
        }
        if (accountStatus && accountStatus !== 'all') {
            if (accountStatus.toLowerCase() === 'active') {
                where.user = { ...where.user, isActive: true };
            }
            else if (accountStatus.toLowerCase() === 'suspended') {
                where.user = { ...where.user, isActive: false };
            }
        }
        const [creators, total] = await Promise.all([
            this.prisma.creatorProfile.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    displayName: true,
                    createdAt: true,
                    verificationStatus: true,
                    totalEarnings: true,
                    totalPurchases: true,
                    payoutStatus: true,
                    payoutSetupCompleted: true,
                    stripeAccountId: true,
                    paypalEmail: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            isActive: true,
                            lastLogin: true,
                            createdAt: true,
                        },
                    },
                    content: {
                        select: {
                            viewCount: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.creatorProfile.count({ where }),
        ]);
        const formattedCreators = creators.map((creator) => {
            const totalViews = creator.content.reduce((sum, c) => sum + (c.viewCount || 0), 0);
            const hasPayoutMethod = creator.payoutSetupCompleted || !!creator.stripeAccountId || !!creator.paypalEmail;
            const effectivePayoutStatus = hasPayoutMethod ? creator.payoutStatus : 'PENDING';
            return {
                id: creator.id,
                name: creator.displayName,
                email: creator.user.email,
                kycStatus: creator.verificationStatus,
                accountStatus: creator.user.isActive ? 'ACTIVE' : 'SUSPENDED',
                joinDate: creator.createdAt.toISOString(),
                lastLogin: creator.user.lastLogin?.toISOString() || null,
                isActive: creator.user.isActive,
                totalEarnings: creator.totalEarnings,
                totalViews: totalViews,
                totalPurchases: creator.totalPurchases,
                payoutStatus: effectivePayoutStatus,
            };
        });
        return {
            success: true,
            data: formattedCreators,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getCreatorStats() {
        const [totalCreators, activeCreators, suspendedCreators, kycPending, kycVerified, kycFailed,] = await Promise.all([
            this.prisma.creatorProfile.count(),
            this.prisma.creatorProfile.count({
                where: { user: { isActive: true } },
            }),
            this.prisma.creatorProfile.count({
                where: { user: { isActive: false } },
            }),
            this.prisma.creatorProfile.count({
                where: { verificationStatus: 'PENDING' },
            }),
            this.prisma.creatorProfile.count({
                where: { verificationStatus: 'VERIFIED' },
            }),
            this.prisma.creatorProfile.count({
                where: { verificationStatus: 'REJECTED' },
            }),
        ]);
        return {
            success: true,
            data: {
                totalCreators,
                activeCreators,
                suspendedCreators,
                kycPending,
                kycVerified,
                kycFailed,
            },
        };
    }
    async getCreatorById(id) {
        const creator = await this.prisma.creatorProfile.findUnique({
            where: { id },
            select: {
                id: true,
                displayName: true,
                bio: true,
                profileImage: true,
                coverImage: true,
                createdAt: true,
                verificationStatus: true,
                totalEarnings: true,
                totalPurchases: true,
                payoutStatus: true,
                payoutSetupCompleted: true,
                stripeAccountId: true,
                paypalEmail: true,
                policyStrikes: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        isActive: true,
                        lastLogin: true,
                        createdAt: true,
                    },
                },
                content: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        createdAt: true,
                        viewCount: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
                payouts: {
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        createdAt: true,
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!creator) {
            return {
                success: false,
                message: 'Creator not found',
            };
        }
        const totalViews = creator.content.reduce((sum, c) => sum + (c.viewCount || 0), 0);
        const recentContent = creator.content.slice(0, 10).map(c => ({
            id: c.id,
            title: c.title,
            status: c.status,
            createdAt: c.createdAt,
        }));
        const hasPayoutMethod = creator.payoutSetupCompleted || !!creator.stripeAccountId || !!creator.paypalEmail;
        const effectivePayoutStatus = hasPayoutMethod ? creator.payoutStatus : 'PENDING';
        return {
            success: true,
            data: {
                id: creator.id,
                name: creator.displayName,
                email: creator.user.email,
                bio: creator.bio,
                profileImage: creator.profileImage,
                coverImage: creator.coverImage,
                kycStatus: creator.verificationStatus,
                accountStatus: creator.user.isActive ? 'ACTIVE' : 'SUSPENDED',
                joinDate: creator.createdAt.toISOString(),
                lastLogin: creator.user.lastLogin?.toISOString() || null,
                totalEarnings: creator.totalEarnings,
                totalViews: totalViews,
                totalPurchases: creator.totalPurchases,
                payoutStatus: effectivePayoutStatus,
                policyStrikes: creator.policyStrikes,
                recentContent: recentContent,
                recentPayouts: creator.payouts,
            },
        };
    }
};
exports.CreatorsService = CreatorsService;
exports.CreatorsService = CreatorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreatorsService);
//# sourceMappingURL=creators.service.js.map
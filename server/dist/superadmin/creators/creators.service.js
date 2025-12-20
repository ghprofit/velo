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
const prisma_service_1 = require("../../prisma/prisma.service");
let CreatorsService = class CreatorsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCreators(query) {
        const { search, kycStatus, payoutStatus, strikes, page = 1, limit = 20 } = query;
        const where = {
            role: 'CREATOR',
        };
        const creatorProfileFilter = {
            isNot: null,
        };
        if (kycStatus && kycStatus !== 'all') {
            creatorProfileFilter.verificationStatus = kycStatus;
        }
        if (payoutStatus && payoutStatus !== 'all') {
            creatorProfileFilter.payoutStatus = payoutStatus;
        }
        if (strikes && strikes !== 'all') {
            if (strikes === '3+') {
                creatorProfileFilter.policyStrikes = { gte: 3 };
            }
            else {
                creatorProfileFilter.policyStrikes = parseInt(strikes, 10);
            }
        }
        where.creatorProfile = creatorProfileFilter;
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                {
                    creatorProfile: {
                        is: {
                            ...creatorProfileFilter,
                            displayName: { contains: search, mode: 'insensitive' }
                        }
                    }
                },
                {
                    creatorProfile: {
                        is: {
                            ...creatorProfileFilter,
                            firstName: { contains: search, mode: 'insensitive' }
                        }
                    }
                },
                {
                    creatorProfile: {
                        is: {
                            ...creatorProfileFilter,
                            lastName: { contains: search, mode: 'insensitive' }
                        }
                    }
                },
                { id: { contains: search, mode: 'insensitive' } },
            ];
            delete where.creatorProfile;
        }
        const [creators, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: {
                    creatorProfile: true,
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: creators.map((creator) => this.formatCreatorResponse(creator)),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getCreatorById(id) {
        const creator = await this.prisma.user.findUnique({
            where: { id },
            include: {
                creatorProfile: {
                    include: {
                        content: {
                            take: 10,
                            orderBy: { createdAt: 'desc' },
                        },
                        payouts: {
                            take: 5,
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                },
            },
        });
        if (!creator || !creator.creatorProfile) {
            throw new common_1.NotFoundException('Creator not found');
        }
        return this.formatCreatorDetailResponse(creator);
    }
    async updateCreator(id, dto) {
        const creator = await this.prisma.user.findUnique({
            where: { id },
            include: { creatorProfile: true },
        });
        if (!creator || !creator.creatorProfile) {
            throw new common_1.NotFoundException('Creator not found');
        }
        const updateData = {};
        if (dto.displayName)
            updateData.displayName = dto.displayName;
        if (dto.payoutStatus)
            updateData.payoutStatus = dto.payoutStatus;
        if (dto.verificationStatus)
            updateData.verificationStatus = dto.verificationStatus;
        if (dto.policyStrikes !== undefined)
            updateData.policyStrikes = dto.policyStrikes;
        if (dto.verificationNotes)
            updateData.verificationNotes = dto.verificationNotes;
        const updatedProfile = await this.prisma.creatorProfile.update({
            where: { userId: id },
            data: updateData,
            include: { user: true },
        });
        return this.formatCreatorResponse({ ...updatedProfile.user, creatorProfile: updatedProfile });
    }
    async addStrike(id, reason, adminId) {
        const creator = await this.prisma.user.findUnique({
            where: { id },
            include: { creatorProfile: true },
        });
        if (!creator || !creator.creatorProfile) {
            throw new common_1.NotFoundException('Creator not found');
        }
        const newStrikes = creator.creatorProfile.policyStrikes + 1;
        const newPayoutStatus = newStrikes >= 3 ? 'SUSPENDED' : creator.creatorProfile.payoutStatus;
        const [updatedProfile] = await Promise.all([
            this.prisma.creatorProfile.update({
                where: { userId: id },
                data: {
                    policyStrikes: newStrikes,
                    payoutStatus: newPayoutStatus,
                },
                include: { user: true },
            }),
            this.prisma.adminAction.create({
                data: {
                    adminId,
                    action: 'ADD_POLICY_STRIKE',
                    targetType: 'USER',
                    targetId: id,
                    reason,
                    metadata: { newStrikeCount: newStrikes },
                },
            }),
        ]);
        return this.formatCreatorResponse({ ...updatedProfile.user, creatorProfile: updatedProfile });
    }
    async suspendCreator(id, reason, adminId) {
        const creator = await this.prisma.user.findUnique({
            where: { id },
            include: { creatorProfile: true },
        });
        if (!creator || !creator.creatorProfile) {
            throw new common_1.NotFoundException('Creator not found');
        }
        const [updatedUser] = await Promise.all([
            this.prisma.user.update({
                where: { id },
                data: {
                    isActive: false,
                    creatorProfile: {
                        update: {
                            payoutStatus: 'SUSPENDED',
                        },
                    },
                },
                include: { creatorProfile: true },
            }),
            this.prisma.adminAction.create({
                data: {
                    adminId,
                    action: 'SUSPEND_CREATOR',
                    targetType: 'USER',
                    targetId: id,
                    reason,
                },
            }),
        ]);
        return this.formatCreatorResponse(updatedUser);
    }
    async reactivateCreator(id, adminId) {
        const creator = await this.prisma.user.findUnique({
            where: { id },
            include: { creatorProfile: true },
        });
        if (!creator || !creator.creatorProfile) {
            throw new common_1.NotFoundException('Creator not found');
        }
        const [updatedUser] = await Promise.all([
            this.prisma.user.update({
                where: { id },
                data: {
                    isActive: true,
                    creatorProfile: {
                        update: {
                            payoutStatus: 'ACTIVE',
                        },
                    },
                },
                include: { creatorProfile: true },
            }),
            this.prisma.adminAction.create({
                data: {
                    adminId,
                    action: 'REACTIVATE_CREATOR',
                    targetType: 'USER',
                    targetId: id,
                },
            }),
        ]);
        return this.formatCreatorResponse(updatedUser);
    }
    async getCreatorStats() {
        const [totalCreators, payoutOnHold, kycPending, kycFailed, highStrikes,] = await Promise.all([
            this.prisma.creatorProfile.count(),
            this.prisma.creatorProfile.count({
                where: { payoutStatus: 'ON_HOLD' },
            }),
            this.prisma.creatorProfile.count({
                where: { verificationStatus: 'PENDING' },
            }),
            this.prisma.creatorProfile.count({
                where: { verificationStatus: 'REJECTED' },
            }),
            this.prisma.creatorProfile.count({
                where: { policyStrikes: { gte: 3 } },
            }),
        ]);
        return {
            totalCreators,
            payoutOnHold,
            kycPendingOrFailed: kycPending + kycFailed,
            highStrikes,
        };
    }
    formatCreatorResponse(user) {
        const kycStatusMap = {
            PENDING: 'Pending',
            IN_PROGRESS: 'In Progress',
            VERIFIED: 'Verified',
            REJECTED: 'Failed',
            EXPIRED: 'Expired',
        };
        const payoutStatusMap = {
            ACTIVE: 'Active',
            ON_HOLD: 'On Hold',
            SUSPENDED: 'Suspended',
        };
        return {
            id: user.id,
            name: user.creatorProfile?.displayName ||
                `${user.creatorProfile?.firstName || ''} ${user.creatorProfile?.lastName || ''}`.trim() ||
                'Unknown',
            email: user.email,
            kycStatus: kycStatusMap[user.creatorProfile?.verificationStatus] || user.creatorProfile?.verificationStatus,
            payoutStatus: payoutStatusMap[user.creatorProfile?.payoutStatus] || user.creatorProfile?.payoutStatus,
            policyStrikes: user.creatorProfile?.policyStrikes ?? 0,
            lifetimeEarnings: user.creatorProfile?.totalEarnings ?? 0,
            lastLogin: user.lastLogin ? this.formatLastLogin(user.lastLogin) : 'Never',
            isActive: user.isActive,
            createdAt: user.createdAt,
        };
    }
    formatCreatorDetailResponse(user) {
        const base = this.formatCreatorResponse(user);
        return {
            ...base,
            profile: {
                displayName: user.creatorProfile?.displayName,
                bio: user.creatorProfile?.bio,
                profileImage: user.creatorProfile?.profileImage,
                coverImage: user.creatorProfile?.coverImage,
                firstName: user.creatorProfile?.firstName,
                lastName: user.creatorProfile?.lastName,
                dateOfBirth: user.creatorProfile?.dateOfBirth,
                country: user.creatorProfile?.country,
            },
            verification: {
                status: user.creatorProfile?.verificationStatus,
                verifiedAt: user.creatorProfile?.verifiedAt,
                notes: user.creatorProfile?.verificationNotes,
            },
            payout: {
                status: user.creatorProfile?.payoutStatus,
                paypalEmail: user.creatorProfile?.paypalEmail,
                stripeAccountId: user.creatorProfile?.stripeAccountId,
            },
            stats: {
                totalEarnings: user.creatorProfile?.totalEarnings ?? 0,
                totalViews: user.creatorProfile?.totalViews ?? 0,
                totalPurchases: user.creatorProfile?.totalPurchases ?? 0,
                contentCount: user.creatorProfile?.content?.length ?? 0,
            },
            recentContent: user.creatorProfile?.content?.map((c) => ({
                id: c.id,
                title: c.title,
                status: c.status,
                createdAt: c.createdAt,
            })) ?? [],
            recentPayouts: user.creatorProfile?.payouts?.map((p) => ({
                id: p.id,
                amount: p.amount,
                status: p.status,
                createdAt: p.createdAt,
            })) ?? [],
        };
    }
    formatLastLogin(date) {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (hours < 1)
            return 'Just now';
        if (hours < 24)
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7)
            return `${days} day${days > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    }
};
exports.CreatorsService = CreatorsService;
exports.CreatorsService = CreatorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreatorsService);
//# sourceMappingURL=creators.service.js.map
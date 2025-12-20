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
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ContentService = class ContentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getContent(query) {
        const { search, status, creatorId, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status && status !== 'all') {
            where.status = status.toUpperCase();
        }
        if (creatorId) {
            where.creatorId = creatorId;
        }
        const [content, total] = await Promise.all([
            this.prisma.content.findMany({
                where,
                skip,
                take: limit,
                include: {
                    creator: {
                        select: {
                            id: true,
                            displayName: true,
                            user: {
                                select: {
                                    email: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.content.count({ where }),
        ]);
        const formattedContent = content.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            status: item.status,
            price: item.price,
            mediaType: item.contentType,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
            creator: {
                id: item.creator.id,
                name: item.creator.displayName,
                email: item.creator.user.email,
            },
        }));
        return {
            success: true,
            data: formattedContent,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getContentStats() {
        const [totalContent, pendingReview, approved, rejected, flagged] = await Promise.all([
            this.prisma.content.count(),
            this.prisma.content.count({
                where: { status: 'PENDING_REVIEW' },
            }),
            this.prisma.content.count({
                where: { status: 'APPROVED' },
            }),
            this.prisma.content.count({
                where: { status: 'REJECTED' },
            }),
            this.prisma.content.count({
                where: { status: 'FLAGGED' },
            }),
        ]);
        return {
            success: true,
            data: {
                totalContent,
                pendingReview,
                approved,
                rejected,
                flagged,
            },
        };
    }
    async getContentById(id) {
        const content = await this.prisma.content.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        displayName: true,
                        user: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
                purchases: {
                    select: {
                        id: true,
                        amount: true,
                        createdAt: true,
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!content) {
            return {
                success: false,
                message: 'Content not found',
            };
        }
        return {
            success: true,
            data: {
                id: content.id,
                title: content.title,
                description: content.description,
                status: content.status,
                price: content.price,
                mediaType: content.contentType,
                s3Key: content.s3Key,
                s3Bucket: content.s3Bucket,
                thumbnailUrl: content.thumbnailUrl,
                createdAt: content.createdAt.toISOString(),
                updatedAt: content.updatedAt.toISOString(),
                creator: {
                    id: content.creator.id,
                    name: content.creator.displayName,
                    email: content.creator.user.email,
                },
                recentPurchases: content.purchases,
            },
        };
    }
    async reviewContent(id, dto) {
        const content = await this.prisma.content.findUnique({
            where: { id },
        });
        if (!content) {
            return {
                success: false,
                message: 'Content not found',
            };
        }
        const updatedContent = await this.prisma.content.update({
            where: { id },
            data: {
                status: dto.status,
                updatedAt: new Date(),
            },
        });
        return {
            success: true,
            message: `Content ${dto.status.toLowerCase()} successfully`,
            data: {
                id: updatedContent.id,
                status: updatedContent.status,
            },
        };
    }
    async flagContent(id, reason) {
        const content = await this.prisma.content.findUnique({
            where: { id },
        });
        if (!content) {
            return {
                success: false,
                message: 'Content not found',
            };
        }
        const updatedContent = await this.prisma.content.update({
            where: { id },
            data: {
                status: 'FLAGGED',
                updatedAt: new Date(),
            },
        });
        return {
            success: true,
            message: 'Content flagged successfully',
            data: {
                id: updatedContent.id,
                status: updatedContent.status,
            },
        };
    }
    async removeContent(id, reason) {
        const content = await this.prisma.content.findUnique({
            where: { id },
        });
        if (!content) {
            return {
                success: false,
                message: 'Content not found',
            };
        }
        const updatedContent = await this.prisma.content.update({
            where: { id },
            data: {
                status: 'REMOVED',
                updatedAt: new Date(),
            },
        });
        return {
            success: true,
            message: 'Content removed successfully',
            data: {
                id: updatedContent.id,
                status: updatedContent.status,
            },
        };
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContentService);
//# sourceMappingURL=content.service.js.map
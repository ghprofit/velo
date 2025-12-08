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
const s3_service_1 = require("../s3/s3.service");
const nanoid_1 = require("nanoid");
let ContentService = class ContentService {
    constructor(prisma, s3Service) {
        this.prisma = prisma;
        this.s3Service = s3Service;
    }
    async createContent(userId, createContentDto) {
        const creatorProfile = await this.prisma.creatorProfile.findUnique({
            where: { userId },
        });
        if (!creatorProfile) {
            throw new common_1.ForbiddenException('Creator profile not found');
        }
        if (createContentDto.items.length === 0) {
            throw new common_1.BadRequestException('At least one content item is required');
        }
        if (createContentDto.items.length > 10) {
            throw new common_1.BadRequestException('Maximum 10 content items allowed per upload');
        }
        const contentId = (0, nanoid_1.nanoid)(10);
        const contentLink = `velo.link/c/${contentId}`;
        const thumbnailUpload = await this.s3Service.uploadFile(createContentDto.thumbnailData, `thumbnail-${contentId}.jpg`, 'image/jpeg', 'thumbnails');
        const contentItemsData = await Promise.all(createContentDto.items.map(async (item, index) => {
            const mimeType = item.fileData.split(';')[0];
            const fileExtension = mimeType?.split('/')[1] || 'bin';
            const fileName = `${contentId}-item-${index}.${fileExtension}`;
            const contentType = mimeType?.split(':')[1] || 'application/octet-stream';
            const upload = await this.s3Service.uploadFile(item.fileData, fileName, contentType, 'content');
            return {
                s3Key: upload.key,
                s3Bucket: process.env.AWS_S3_BUCKET_NAME || 'velo-content',
                fileSize: item.fileSize,
                order: index,
            };
        }));
        const totalFileSize = createContentDto.items.reduce((sum, item) => sum + item.fileSize, 0);
        const content = await this.prisma.content.create({
            data: {
                id: contentId,
                creatorId: creatorProfile.id,
                title: createContentDto.title,
                description: createContentDto.description,
                price: createContentDto.price,
                thumbnailUrl: thumbnailUpload.url,
                contentType: createContentDto.contentType,
                s3Key: thumbnailUpload.key,
                s3Bucket: process.env.AWS_S3_BUCKET_NAME || 'velo-content',
                fileSize: totalFileSize,
                status: 'PENDING_REVIEW',
                isPublished: true,
                publishedAt: new Date(),
                contentItems: {
                    create: contentItemsData,
                },
            },
            include: {
                contentItems: true,
                creator: {
                    include: {
                        user: {
                            select: {
                                displayName: true,
                                profilePicture: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            content,
            link: `https://${contentLink}`,
            shortId: contentId,
        };
    }
    async getCreatorContent(userId) {
        const creatorProfile = await this.prisma.creatorProfile.findUnique({
            where: { userId },
        });
        if (!creatorProfile) {
            throw new common_1.NotFoundException('Creator profile not found');
        }
        const content = await this.prisma.content.findMany({
            where: {
                creatorId: creatorProfile.id,
            },
            include: {
                contentItems: true,
                _count: {
                    select: {
                        purchases: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return content;
    }
    async getContentById(contentId) {
        const content = await this.prisma.content.findUnique({
            where: { id: contentId },
            include: {
                contentItems: {
                    orderBy: {
                        order: 'asc',
                    },
                },
                creator: {
                    include: {
                        user: {
                            select: {
                                displayName: true,
                                profilePicture: true,
                            },
                        },
                    },
                },
            },
        });
        if (!content) {
            throw new common_1.NotFoundException('Content not found');
        }
        return content;
    }
    async deleteContent(userId, contentId) {
        const creatorProfile = await this.prisma.creatorProfile.findUnique({
            where: { userId },
        });
        if (!creatorProfile) {
            throw new common_1.ForbiddenException('Creator profile not found');
        }
        const content = await this.prisma.content.findUnique({
            where: { id: contentId },
            include: {
                contentItems: true,
            },
        });
        if (!content) {
            throw new common_1.NotFoundException('Content not found');
        }
        if (content.creatorId !== creatorProfile.id) {
            throw new common_1.ForbiddenException('You do not have permission to delete this content');
        }
        try {
            if (content.s3Key) {
                await this.s3Service.deleteFile(content.s3Key);
            }
            const s3Keys = content.contentItems.map((item) => item.s3Key);
            if (s3Keys.length > 0) {
                await this.s3Service.deleteMultipleFiles(s3Keys);
            }
        }
        catch (error) {
            console.error('Error deleting files from S3:', error);
        }
        await this.prisma.content.delete({
            where: { id: contentId },
        });
        return { message: 'Content deleted successfully' };
    }
    async getContentStats(userId) {
        const creatorProfile = await this.prisma.creatorProfile.findUnique({
            where: { userId },
        });
        if (!creatorProfile) {
            throw new common_1.NotFoundException('Creator profile not found');
        }
        const stats = await this.prisma.content.aggregate({
            where: {
                creatorId: creatorProfile.id,
            },
            _sum: {
                viewCount: true,
                purchaseCount: true,
                totalRevenue: true,
            },
            _count: true,
        });
        return {
            totalContent: stats._count,
            totalViews: stats._sum.viewCount || 0,
            totalPurchases: stats._sum.purchaseCount || 0,
            totalRevenue: stats._sum.totalRevenue || 0,
        };
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], ContentService);
//# sourceMappingURL=content.service.js.map
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
const recognition_service_1 = require("../recognition/recognition.service");
const notifications_service_1 = require("../notifications/notifications.service");
const create_notification_dto_1 = require("../notifications/dto/create-notification.dto");
const nanoid_1 = require("nanoid");
let ContentService = class ContentService {
    constructor(prisma, s3Service, recognitionService, notificationsService) {
        this.prisma = prisma;
        this.s3Service = s3Service;
        this.recognitionService = recognitionService;
        this.notificationsService = notificationsService;
    }
    async getSignedThumbnailUrl(s3Key, thumbnailUrl) {
        if (s3Key) {
            try {
                return await this.s3Service.getSignedUrl(s3Key, 86400);
            }
            catch (error) {
                console.error('Failed to generate signed URL, using fallback:', error);
                return thumbnailUrl;
            }
        }
        return thumbnailUrl;
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
        if (createContentDto.items.length > 20) {
            throw new common_1.BadRequestException('Maximum 20 content items allowed per upload');
        }
        const MAX_TOTAL_SIZE = 10 * 1024 * 1024 * 1024;
        const totalFileSize = createContentDto.items.reduce((sum, item) => sum + item.fileSize, 0);
        if (totalFileSize > MAX_TOTAL_SIZE) {
            const totalSizeGB = (totalFileSize / (1024 * 1024 * 1024)).toFixed(2);
            throw new common_1.BadRequestException(`Total file size (${totalSizeGB}GB) exceeds maximum allowed size of 10GB`);
        }
        const contentId = (0, nanoid_1.nanoid)(10);
        const contentLink = `velolink.club/c/${contentId}`;
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
                isPublished: false,
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
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        try {
            const contentItems = content.contentItems.map((item) => ({
                id: item.id,
                content: {
                    type: 's3',
                    data: item.s3Key,
                    bucket: process.env.AWS_S3_BUCKET_NAME || 'velo-content',
                },
            }));
            const batchResults = await this.recognitionService.checkBatchSafety(contentItems, 60);
            let allSafe = true;
            const flaggedReasons = [];
            for (const result of batchResults.results) {
                await this.prisma.complianceLog.create({
                    data: {
                        contentId: content.id,
                        checkType: 'AWS_REKOGNITION',
                        status: result.isSafe ? 'PASSED' : 'FAILED',
                        flaggedReasons: result.flaggedCategories || [],
                        createdAt: new Date(),
                    },
                });
                if (!result.isSafe) {
                    allSafe = false;
                    flaggedReasons.push(...(result.flaggedCategories || []));
                }
            }
            const finalStatus = allSafe ? 'APPROVED' : 'FLAGGED';
            const updatedContent = await this.prisma.content.update({
                where: { id: content.id },
                data: {
                    status: finalStatus,
                    isPublished: allSafe,
                    publishedAt: allSafe ? new Date() : null,
                    complianceStatus: allSafe ? 'PASSED' : 'FAILED',
                },
                include: {
                    contentItems: true,
                    creator: {
                        include: {
                            user: {
                                select: {
                                    displayName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!allSafe) {
                const uniqueReasons = [...new Set(flaggedReasons)];
                const creatorDisplayName = updatedContent.creator.user.displayName || 'Unknown Creator';
                await this.notificationsService.notifyAdmins(create_notification_dto_1.NotificationType.FLAGGED_CONTENT_ALERT, 'Content Flagged for Review', `Content "${content.title}" by ${creatorDisplayName} has been flagged by AWS Rekognition for manual review.`, {
                    contentId: content.id,
                    contentTitle: content.title,
                    creatorId: updatedContent.creator.id,
                    creatorDisplayName: creatorDisplayName,
                    flaggedReasons: uniqueReasons,
                    requiresManualReview: true,
                });
            }
            return {
                content: updatedContent,
                link: `https://${contentLink}`,
                shortId: contentId,
            };
        }
        catch (rekognitionError) {
            const errorMessage = rekognitionError instanceof Error ? rekognitionError.message : 'Unknown error';
            console.error('AWS Rekognition check failed:', errorMessage);
            await this.prisma.complianceLog.create({
                data: {
                    contentId: content.id,
                    checkType: 'AWS_REKOGNITION',
                    status: 'MANUAL_REVIEW',
                    flaggedReasons: ['API_FAILURE'],
                    notes: `Rekognition API failed: ${errorMessage}`,
                    createdAt: new Date(),
                },
            });
            await this.notificationsService.notifyAdmins(create_notification_dto_1.NotificationType.FLAGGED_CONTENT_ALERT, 'Content Requires Manual Review', `Content "${content.title}" could not be automatically moderated due to API failure.`, {
                contentId: content.id,
                contentTitle: content.title,
                error: errorMessage,
            });
            return {
                content,
                link: `https://${contentLink}`,
                shortId: contentId,
            };
        }
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
        const contentWithSignedUrls = await Promise.all(content.map(async (item) => ({
            ...item,
            thumbnailUrl: await this.getSignedThumbnailUrl(item.s3Key, item.thumbnailUrl),
        })));
        return contentWithSignedUrls;
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
                            },
                        },
                    },
                },
            },
        });
        if (!content) {
            throw new common_1.NotFoundException('Content not found');
        }
        const thumbnailUrl = await this.getSignedThumbnailUrl(content.s3Key, content.thumbnailUrl);
        return {
            ...content,
            thumbnailUrl,
        };
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
        s3_service_1.S3Service,
        recognition_service_1.RecognitionService,
        notifications_service_1.NotificationsService])
], ContentService);
//# sourceMappingURL=content.service.js.map
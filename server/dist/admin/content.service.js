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
var ContentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const s3_service_1 = require("../s3/s3.service");
const notifications_service_1 = require("../notifications/notifications.service");
const create_notification_dto_1 = require("../notifications/dto/create-notification.dto");
let ContentService = ContentService_1 = class ContentService {
    constructor(prisma, emailService, s3Service, notificationsService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.s3Service = s3Service;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(ContentService_1.name);
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
                contentItems: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!content) {
            return {
                success: false,
                message: 'Content not found',
            };
        }
        let signedUrl;
        const contentItemsWithUrls = await Promise.all(content.contentItems.map(async (item) => {
            let itemSignedUrl;
            if (item.s3Key) {
                try {
                    itemSignedUrl = await this.s3Service.getSignedUrl(item.s3Key, 86400);
                }
                catch (error) {
                    this.logger.error(`Failed to generate signed URL for item ${item.id}:`, error);
                }
            }
            return {
                id: item.id,
                s3Key: item.s3Key,
                s3Bucket: item.s3Bucket,
                fileSize: item.fileSize,
                order: item.order,
                signedUrl: itemSignedUrl,
            };
        }));
        if (contentItemsWithUrls.length > 0 && contentItemsWithUrls[0]) {
            signedUrl = contentItemsWithUrls[0].signedUrl;
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
                signedUrl,
                contentItems: contentItemsWithUrls,
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
            include: {
                creator: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                displayName: true,
                            },
                        },
                    },
                },
            },
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
                complianceStatus: dto.status === 'APPROVED' ? 'PASSED' : 'FAILED',
                complianceCheckedAt: new Date(),
                updatedAt: new Date(),
            },
        });
        try {
            const creatorName = content.creator.displayName || content.creator.user.displayName || 'Creator';
            const creatorEmail = content.creator.user.email;
            if (dto.status === 'APPROVED') {
                this.logger.log(`Sending approval email for content ${id} to ${creatorEmail}`);
                await this.emailService.sendContentApproval(creatorEmail, creatorName, content.title, `${process.env.CLIENT_URL || 'https://velolink.club'}/c/${content.id}`);
            }
            else if (dto.status === 'REJECTED') {
                this.logger.log(`Sending rejection email for content ${id} to ${creatorEmail}`);
                await this.emailService.sendContentRejection(creatorEmail, creatorName, content.title, 'Content does not meet our community guidelines');
            }
        }
        catch (emailError) {
            const error = emailError;
            this.logger.error(`Failed to send email notification: ${error.message}`);
        }
        try {
            const creatorUserId = content.creator.user.id;
            const notificationType = dto.status === 'APPROVED'
                ? create_notification_dto_1.NotificationType.CONTENT_APPROVED
                : create_notification_dto_1.NotificationType.CONTENT_REJECTED;
            const notificationTitle = dto.status === 'APPROVED'
                ? 'Content Approved!'
                : 'Content Requires Changes';
            const notificationMessage = dto.status === 'APPROVED'
                ? `Your content "${content.title}" has been approved and is now live!`
                : `Your content "${content.title}" was not approved. Please review our guidelines.`;
            await this.notificationsService.notify(creatorUserId, notificationType, notificationTitle, notificationMessage, {
                contentId: content.id,
                contentTitle: content.title,
                status: dto.status,
            });
            this.logger.log(`Creator notification created for content review: ${id}`);
        }
        catch (notifError) {
            const error = notifError;
            this.logger.error(`Failed to create creator notification: ${error.message}`);
        }
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
            include: {
                creator: {
                    select: {
                        id: true,
                        displayName: true,
                    },
                },
            },
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
        try {
            await this.notificationsService.notifyAdmins(create_notification_dto_1.NotificationType.FLAGGED_CONTENT_ALERT, 'Content Flagged', `Content "${content.title}" by ${content.creator?.displayName || 'Unknown'} has been flagged. Reason: ${reason}`, {
                contentId: content.id,
                contentTitle: content.title,
                creatorId: content.creatorId,
                reason,
            });
            this.logger.log(`Admin notification sent for flagged content: ${id}`);
        }
        catch (error) {
            this.logger.error(`Failed to notify admins about flagged content:`, error);
        }
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
exports.ContentService = ContentService = ContentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        s3_service_1.S3Service,
        notifications_service_1.NotificationsService])
], ContentService);
//# sourceMappingURL=content.service.js.map
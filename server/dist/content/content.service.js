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
const s3_service_1 = require("../s3/s3.service");
const recognition_service_1 = require("../recognition/recognition.service");
const email_service_1 = require("../email/email.service");
const nanoid_1 = require("nanoid");
let ContentService = ContentService_1 = class ContentService {
    constructor(prisma, s3Service, recognitionService, emailService) {
        this.prisma = prisma;
        this.s3Service = s3Service;
        this.recognitionService = recognitionService;
        this.emailService = emailService;
        this.logger = new common_1.Logger(ContentService_1.name);
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
        const contentLink = `velolink.club/c/${contentId}`;
        const thumbnailUpload = await this.s3Service.uploadFile(createContentDto.thumbnailData, `thumbnail-${contentId}.jpg`, 'image/jpeg', 'thumbnails');
        let contentStatus = 'PENDING_REVIEW';
        let complianceStatus = 'PENDING';
        const complianceLogs = [];
        try {
            this.logger.log(`Checking content safety for ${contentId} using AWS Rekognition`);
            const safetyResult = await this.recognitionService.checkImageSafety({
                type: 's3',
                data: thumbnailUpload.key,
                bucket: process.env.AWS_S3_BUCKET_NAME || 'velo-content',
            }, 50);
            if (safetyResult.isSafe) {
                contentStatus = 'APPROVED';
                complianceStatus = 'PASSED';
                this.logger.log(`Content ${contentId} auto-approved (Rekognition: safe)`);
            }
            else {
                contentStatus = 'PENDING_REVIEW';
                complianceStatus = 'MANUAL_REVIEW';
                this.logger.warn(`Content ${contentId} flagged by Rekognition: ${safetyResult.flaggedCategories.join(', ')}`);
                complianceLogs.push({
                    checkType: 'AWS_REKOGNITION',
                    status: 'FAILED',
                    details: {
                        flaggedCategories: safetyResult.flaggedCategories,
                        moderationLabels: safetyResult.moderationLabels,
                        confidence: safetyResult.confidence,
                        reason: 'Content flagged by automated safety system',
                    },
                });
            }
        }
        catch (error) {
            const err = error;
            this.logger.error(`Rekognition check failed for ${contentId}: ${err.message}`);
            contentStatus = 'PENDING_REVIEW';
            complianceStatus = 'PENDING';
        }
        const contentItemsData = await Promise.all(createContentDto.items.map(async (item, index) => {
            const dataUriMatch = item.fileData.match(/^data:(.+);base64,/);
            if (!dataUriMatch || !dataUriMatch[1]) {
                throw new common_1.BadRequestException(`Invalid file data format for item ${index + 1}`);
            }
            const mimeType = dataUriMatch[1];
            const fileExtension = mimeType.split('/')[1] || 'bin';
            const fileName = `${contentId}-item-${index}.${fileExtension}`;
            const base64Parts = item.fileData.split(',');
            if (base64Parts.length !== 2 || !base64Parts[1]) {
                throw new common_1.BadRequestException(`Invalid base64 data format for item ${index + 1}`);
            }
            const base64Content = base64Parts[1];
            const buffer = Buffer.from(base64Content, 'base64');
            const MAX_FILE_SIZE = 524288000;
            if (buffer.length > MAX_FILE_SIZE) {
                throw new common_1.BadRequestException(`File ${index + 1} exceeds maximum size of 500MB (actual: ${Math.round(buffer.length / 1048576)}MB). Please compress your video or reduce quality.`);
            }
            const ALLOWED_TYPES = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'video/mp4',
                'video/quicktime',
                'video/x-msvideo',
                'video/webm',
            ];
            if (!ALLOWED_TYPES.includes(mimeType)) {
                throw new common_1.BadRequestException(`File type ${mimeType} is not supported. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
            }
            const upload = await this.s3Service.uploadFile(item.fileData, fileName, mimeType, 'content');
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
                status: contentStatus,
                complianceStatus: complianceStatus,
                complianceCheckedAt: new Date(),
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
        if (complianceLogs.length > 0) {
            try {
                await this.prisma.complianceLog.createMany({
                    data: complianceLogs.map((log) => ({
                        contentId: content.id,
                        checkType: log.checkType,
                        status: log.status,
                        details: log.details,
                    })),
                });
                this.logger.log(`Created ${complianceLogs.length} compliance log(s) for content ${content.id}`);
            }
            catch (logError) {
                const err = logError;
                this.logger.error(`Failed to create compliance logs: ${err.message}`);
            }
        }
        return {
            content,
            link: `https://${contentLink}`,
            shortId: contentId,
            status: contentStatus,
        };
    }
    async createContentMultipart(userId, createContentDto, files, thumbnailFile, filesMetadata) {
        const creatorProfile = await this.prisma.creatorProfile.findUnique({
            where: { userId },
        });
        if (!creatorProfile) {
            throw new common_1.ForbiddenException('Creator profile not found');
        }
        if (files.length === 0) {
            throw new common_1.BadRequestException('At least one content item is required');
        }
        if (files.length > 20) {
            throw new common_1.BadRequestException('Maximum 20 content items allowed per upload');
        }
        const contentId = (0, nanoid_1.nanoid)(10);
        const thumbnailUpload = await this.s3Service.uploadFileStream(thumbnailFile.buffer, thumbnailFile.originalname, thumbnailFile.mimetype, 'thumbnails');
        const contentItemsData = await Promise.all(files.map(async (file, index) => {
            const MAX_FILE_SIZE = 524288000;
            if (file.size > MAX_FILE_SIZE) {
                throw new common_1.BadRequestException(`File ${index + 1} exceeds maximum size of 500MB (actual: ${Math.round(file.size / 1048576)}MB)`);
            }
            const upload = await this.s3Service.uploadFileStream(file.buffer, file.originalname, file.mimetype, 'content');
            return {
                s3Key: upload.key,
                s3Bucket: process.env.AWS_S3_BUCKET_NAME || 'velo-content',
                fileSize: file.size,
                order: index,
                mimeType: file.mimetype,
            };
        }));
        const hasVideo = files.some(file => file.mimetype.startsWith('video/'));
        const videoItem = contentItemsData.find(item => item.mimeType.startsWith('video/'));
        let contentStatus = 'PENDING_REVIEW';
        let complianceStatus = 'PENDING';
        let rekognitionJobId = null;
        let moderationCheckType = 'THUMBNAIL_ONLY';
        const complianceLogs = [];
        try {
            this.logger.log(`Checking thumbnail safety for ${contentId} using AWS Rekognition`);
            const thumbnailSafetyResult = await this.recognitionService.checkImageSafety({
                type: 's3',
                data: thumbnailUpload.key,
                bucket: process.env.AWS_S3_BUCKET_NAME || 'velo-content',
            }, 50);
            if (!thumbnailSafetyResult.isSafe) {
                contentStatus = 'PENDING_REVIEW';
                complianceStatus = 'MANUAL_REVIEW';
                moderationCheckType = 'SYNC_IMAGE';
                this.logger.warn(`Content ${contentId} thumbnail flagged by Rekognition: ${thumbnailSafetyResult.flaggedCategories.join(', ')}`);
                complianceLogs.push({
                    checkType: 'AWS_REKOGNITION_THUMBNAIL',
                    status: 'FAILED',
                    details: {
                        flaggedCategories: thumbnailSafetyResult.flaggedCategories,
                        moderationLabels: thumbnailSafetyResult.moderationLabels,
                        confidence: thumbnailSafetyResult.confidence,
                        reason: 'Thumbnail flagged by automated safety system',
                    },
                });
            }
            else if (hasVideo && videoItem) {
                moderationCheckType = 'ASYNC_VIDEO';
                try {
                    this.logger.log(`Starting async video moderation for ${contentId}`);
                    const jobResult = await this.recognitionService.startVideoSafetyCheck({
                        type: 's3',
                        data: videoItem.s3Key,
                        bucket: process.env.AWS_S3_BUCKET_NAME || 'velo-content',
                    });
                    rekognitionJobId = jobResult.jobId;
                    contentStatus = 'PENDING_REVIEW';
                    complianceStatus = 'PENDING';
                    this.logger.log(`Video moderation job ${rekognitionJobId} started for content ${contentId}`);
                }
                catch (videoError) {
                    const err = videoError;
                    this.logger.error(`Failed to start video moderation for ${contentId}: ${err.message}`);
                    contentStatus = 'PENDING_REVIEW';
                    complianceStatus = 'PENDING';
                }
            }
            else {
                contentStatus = 'APPROVED';
                complianceStatus = 'PASSED';
                moderationCheckType = 'SYNC_IMAGE';
                this.logger.log(`Content ${contentId} auto-approved (image-only, thumbnail safe)`);
            }
        }
        catch (error) {
            const err = error;
            this.logger.error(`Rekognition thumbnail check failed for ${contentId}: ${err.message}`);
            contentStatus = 'PENDING_REVIEW';
            complianceStatus = 'PENDING';
        }
        const totalFileSize = files.reduce((sum, file) => sum + file.size, 0);
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
                status: contentStatus,
                complianceStatus: complianceStatus,
                complianceCheckedAt: new Date(),
                isPublished: contentStatus === 'APPROVED',
                publishedAt: contentStatus === 'APPROVED' ? new Date() : null,
                rekognitionJobId: rekognitionJobId,
                rekognitionJobStatus: rekognitionJobId ? 'IN_PROGRESS' : null,
                rekognitionJobStartedAt: rekognitionJobId ? new Date() : null,
                moderationCheckType: moderationCheckType,
                contentItems: {
                    create: contentItemsData.map(({ mimeType, ...item }) => item),
                },
            },
            include: {
                contentItems: true,
                creator: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                displayName: true,
                                profilePicture: true,
                            },
                        },
                    },
                },
            },
        });
        if (complianceLogs.length > 0) {
            try {
                await this.prisma.complianceLog.createMany({
                    data: complianceLogs.map((log) => ({
                        contentId: content.id,
                        checkType: log.checkType,
                        status: log.status,
                        details: log.details,
                    })),
                });
                this.logger.log(`Created ${complianceLogs.length} compliance log(s) for content ${content.id}`);
            }
            catch (logError) {
                const err = logError;
                this.logger.error(`Failed to create compliance logs: ${err.message}`);
            }
        }
        if (contentStatus === 'APPROVED') {
            await this.sendApprovalEmail(content, content.creator.user.id);
        }
        return {
            content,
            shortId: contentId,
            status: contentStatus,
            message: contentStatus === 'APPROVED'
                ? 'Content approved! Check your email for your shareable link.'
                : 'Content submitted for review. You will receive an email when approved.',
        };
    }
    async processVideoModerationJobs() {
        try {
            const pendingContent = await this.prisma.content.findMany({
                where: {
                    rekognitionJobStatus: 'IN_PROGRESS',
                    rekognitionJobId: { not: null },
                },
                include: {
                    creator: {
                        include: {
                            user: { select: { id: true, email: true, displayName: true } },
                        },
                    },
                },
            });
            if (pendingContent.length === 0) {
                return;
            }
            this.logger.log(`Processing ${pendingContent.length} pending video moderation job(s)`);
            for (const content of pendingContent) {
                try {
                    const jobResult = await this.recognitionService.getVideoSafetyResults(content.rekognitionJobId);
                    if (jobResult.status === 'SUCCEEDED') {
                        await this.handleModerationJobComplete(content, jobResult);
                    }
                    else if (jobResult.status === 'FAILED') {
                        await this.handleModerationJobFailed(content, jobResult);
                    }
                }
                catch (error) {
                    const err = error;
                    this.logger.error(`Failed to check job ${content.rekognitionJobId}: ${err.message}`);
                }
            }
        }
        catch (error) {
            const err = error;
            if (err.message.includes('Connection terminated') || err.message.includes('timeout')) {
                this.logger.warn('Database connection timeout in video moderation - will retry later');
                return;
            }
            throw error;
        }
    }
    async handleModerationJobComplete(content, jobResult) {
        let newStatus;
        let complianceStatus;
        if (jobResult.isSafe) {
            newStatus = 'APPROVED';
            complianceStatus = 'PASSED';
            this.logger.log(`Content ${content.id} approved by video moderation`);
        }
        else {
            newStatus = 'PENDING_REVIEW';
            complianceStatus = 'MANUAL_REVIEW';
            this.logger.warn(`Content ${content.id} flagged by video moderation`);
            await this.prisma.complianceLog.create({
                data: {
                    contentId: content.id,
                    checkType: 'AWS_REKOGNITION_VIDEO',
                    status: 'FAILED',
                    flaggedReasons: ['Video moderation flagged unsafe content'],
                    moderationLabels: jobResult.unsafeSegments || [],
                    notes: 'Flagged by async video moderation',
                },
            });
        }
        await this.prisma.content.update({
            where: { id: content.id },
            data: {
                status: newStatus,
                complianceStatus: complianceStatus,
                complianceCheckedAt: new Date(),
                rekognitionJobStatus: 'SUCCEEDED',
                rekognitionJobCompletedAt: new Date(),
                isPublished: newStatus === 'APPROVED',
                publishedAt: newStatus === 'APPROVED' ? new Date() : null,
            },
        });
        if (newStatus === 'APPROVED') {
            await this.sendApprovalEmail(content, content.creator.user.id);
        }
    }
    async handleModerationJobFailed(content, jobResult) {
        await this.prisma.content.update({
            where: { id: content.id },
            data: {
                status: 'PENDING_REVIEW',
                complianceStatus: 'PENDING',
                rekognitionJobStatus: 'FAILED',
                rekognitionJobCompletedAt: new Date(),
                complianceNotes: `Rekognition job failed: ${jobResult.statusMessage || 'Unknown error'}`,
            },
        });
        this.logger.error(`Video moderation job failed for content ${content.id}: ${jobResult.statusMessage}`);
    }
    async sendApprovalEmail(content, userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, displayName: true },
            });
            if (user?.email) {
                await this.emailService.sendContentApproved(user.email, {
                    creator_name: user.displayName || 'Creator',
                    content_title: content.title,
                    content_link: `https://velolink.club/c/${content.id}`,
                });
                this.logger.log(`Approval email sent for content ${content.id} to ${user.email}`);
            }
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to send approval email for ${content.id}: ${err.message}`);
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
        this.logger.log(`[CREATOR PREVIEW] Fetching content ${contentId}, has ${content.contentItems?.length || 0} items`);
        if (content.contentItems && content.contentItems.length > 0) {
            const contentItemsWithUrls = await Promise.all(content.contentItems.map(async (item) => {
                try {
                    const signedUrl = await this.s3Service.getSignedUrl(item.s3Key, 86400);
                    this.logger.log(`[CREATOR PREVIEW] Generated signed URL for item ${item.id}: ${signedUrl.substring(0, 100)}...`);
                    return {
                        ...item,
                        signedUrl,
                    };
                }
                catch (error) {
                    this.logger.error(`[CREATOR PREVIEW] Failed to generate signed URL for ${item.s3Key}:`, error);
                    return item;
                }
            }));
            return {
                ...content,
                contentItems: contentItemsWithUrls,
            };
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
exports.ContentService = ContentService = ContentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service,
        recognition_service_1.RecognitionService,
        email_service_1.EmailService])
], ContentService);
//# sourceMappingURL=content.service.js.map
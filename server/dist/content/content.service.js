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
        const contentStatus = 'PENDING_REVIEW';
        const complianceStatus = 'PENDING';
        const scheduledReviewAt = new Date(Date.now() + 10 * 60 * 1000);
        this.logger.log(`Content ${contentId} scheduled for review at ${scheduledReviewAt.toISOString()}`);
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
                scheduledReviewAt: scheduledReviewAt,
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
                                email: true,
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
        const contentStatus = 'PENDING_REVIEW';
        const complianceStatus = 'PENDING';
        const scheduledReviewAt = new Date(Date.now() + 10 * 60 * 1000);
        this.logger.log(`Content ${contentId} scheduled for review at ${scheduledReviewAt.toISOString()}`);
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
                scheduledReviewAt: scheduledReviewAt,
                isPublished: true,
                publishedAt: new Date(),
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
        return {
            content,
            shortId: contentId,
            status: contentStatus,
            message: 'Content submitted for review. You will receive an email when approved (usually within 10-15 minutes).',
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
        const contentWithSignedUrls = await Promise.all(content.map(async (contentItem) => {
            if (contentItem.contentItems && contentItem.contentItems.length > 0) {
                const itemsWithUrls = await Promise.all(contentItem.contentItems.map(async (item) => {
                    try {
                        const signedUrl = await this.s3Service.getSignedUrl(item.s3Key, 86400);
                        return {
                            ...item,
                            signedUrl,
                        };
                    }
                    catch (error) {
                        this.logger.error(`Failed to generate signed URL for ${item.s3Key}:`, error);
                        return item;
                    }
                }));
                return {
                    ...contentItem,
                    contentItems: itemsWithUrls,
                };
            }
            return contentItem;
        }));
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
    async processScheduledContentReviews() {
        const now = new Date();
        const contentToReview = await this.prisma.content.findMany({
            where: {
                status: 'PENDING_REVIEW',
                complianceStatus: 'PENDING',
                scheduledReviewAt: {
                    lte: now,
                },
            },
            include: {
                contentItems: true,
                creator: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                displayName: true,
                            },
                        },
                    },
                },
            },
            take: 10,
        });
        if (contentToReview.length === 0) {
            return { processed: 0, results: [] };
        }
        this.logger.log(`Processing ${contentToReview.length} scheduled content review(s)`);
        const results = await Promise.all(contentToReview.map(async (content) => {
            try {
                this.logger.log(`Running recognition check for content ${content.id} (type: ${content.contentType})`);
                let s3KeyToCheck = content.s3Key;
                if (content.contentType === 'VIDEO' && content.contentItems && content.contentItems.length > 0) {
                    const firstContentItem = content.contentItems[0];
                    if (firstContentItem) {
                        s3KeyToCheck = firstContentItem.s3Key;
                        this.logger.log(`Using video file for recognition: ${s3KeyToCheck}`);
                    }
                }
                let safetyResult;
                try {
                    safetyResult = await this.recognitionService.checkImageSafety({
                        type: 's3',
                        data: content.s3Key,
                        bucket: content.s3Bucket,
                    }, 50);
                }
                catch (recognitionError) {
                    const err = recognitionError;
                    this.logger.error(`Rekognition check failed for content ${content.id}: ${err.message}`);
                    this.logger.error('S3 Key:', content.s3Key, 'Bucket:', content.s3Bucket);
                    await this.prisma.content.update({
                        where: { id: content.id },
                        data: {
                            status: 'PENDING_REVIEW',
                            complianceStatus: 'MANUAL_REVIEW',
                            complianceCheckedAt: new Date(),
                            complianceNotes: `Automated check failed: ${err.message}. Requires manual review.`,
                        },
                    });
                    return {
                        id: content.id,
                        status: 'PENDING_REVIEW',
                        error: `Rekognition error: ${err.message}`
                    };
                }
                let newStatus;
                let newComplianceStatus;
                const complianceLogs = [];
                if (safetyResult.isSafe) {
                    newStatus = 'APPROVED';
                    newComplianceStatus = 'PASSED';
                    this.logger.log(`Content ${content.id} auto-approved (Rekognition: safe)`);
                }
                else {
                    newStatus = 'PENDING_REVIEW';
                    newComplianceStatus = 'MANUAL_REVIEW';
                    this.logger.warn(`Content ${content.id} flagged by Rekognition: ${safetyResult.flaggedCategories.join(', ')}`);
                    complianceLogs.push({
                        contentId: content.id,
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
                await this.prisma.content.update({
                    where: { id: content.id },
                    data: {
                        status: newStatus,
                        complianceStatus: newComplianceStatus,
                        complianceCheckedAt: new Date(),
                    },
                });
                if (complianceLogs.length > 0) {
                    await this.prisma.complianceLog.createMany({
                        data: complianceLogs,
                    });
                }
                try {
                    const creatorEmail = content.creator.user.email;
                    const creatorName = content.creator.user.displayName || content.creator.displayName;
                    if (newStatus === 'APPROVED') {
                        await this.emailService.sendEmail({
                            to: creatorEmail,
                            subject: '✅ Your Content Has Been Approved',
                            html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">Content Approved!</h2>
                    <p>Hi ${creatorName},</p>
                    <p>Great news! Your content "<strong>${content.title}</strong>" has been reviewed and approved.</p>
                    <p>Your content is now live and available for purchase.</p>
                    <div style="margin: 20px 0; padding: 15px; background: #f0fdf4; border-radius: 8px;">
                      <p style="margin: 0;"><strong>Content Details:</strong></p>
                      <p style="margin: 5px 0;">Title: ${content.title}</p>
                      <p style="margin: 5px 0;">Price: $${content.price.toFixed(2)}</p>
                      <p style="margin: 5px 0;">Status: Approved ✅</p>
                    </div>
                    <p>Start sharing your content link to earn!</p>
                    <p>Best regards,<br/>The VeloLink Team</p>
                  </div>
                `,
                        });
                        this.logger.log(`Approval email sent to ${creatorEmail} for content ${content.id}`);
                    }
                    else if (newComplianceStatus === 'MANUAL_REVIEW') {
                        await this.emailService.sendEmail({
                            to: creatorEmail,
                            subject: '⚠️ Your Content Requires Manual Review',
                            html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f59e0b;">Content Under Review</h2>
                    <p>Hi ${creatorName},</p>
                    <p>Your content "<strong>${content.title}</strong>" has been flagged by our automated system and requires manual review.</p>
                    <p>Our team will review your content within 24-48 hours. You'll receive an email once the review is complete.</p>
                    <div style="margin: 20px 0; padding: 15px; background: #fffbeb; border-radius: 8px;">
                      <p style="margin: 0;"><strong>What happens next?</strong></p>
                      <ul style="margin: 10px 0;">
                        <li>Our moderation team will manually review your content</li>
                        <li>We'll check for compliance with our community guidelines</li>
                        <li>You'll receive an email with the final decision</li>
                      </ul>
                    </div>
                    <p>Thank you for your patience!</p>
                    <p>Best regards,<br/>The VeloLink Team</p>
                  </div>
                `,
                        });
                        this.logger.log(`Manual review email sent to ${creatorEmail} for content ${content.id}`);
                    }
                }
                catch (emailError) {
                    const err = emailError;
                    this.logger.error(`Failed to send email for content ${content.id}: ${err.message}`);
                }
                return {
                    contentId: content.id,
                    status: newStatus,
                    complianceStatus: newComplianceStatus,
                    success: true,
                };
            }
            catch (error) {
                const err = error;
                this.logger.error(`Failed to process content ${content.id}: ${err.message}`);
                return {
                    contentId: content.id,
                    success: false,
                    error: err.message,
                };
            }
        }));
        const successCount = results.filter((r) => r.success).length;
        this.logger.log(`Processed ${successCount}/${contentToReview.length} content reviews successfully`);
        return {
            processed: contentToReview.length,
            successful: successCount,
            results,
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
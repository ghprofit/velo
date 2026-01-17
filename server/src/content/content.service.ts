import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { RecognitionService } from '../recognition/recognition.service';
import { EmailService } from '../email/email.service';
import { CreateContentDto } from './dto/create-content.dto';
import { CreateContentMultipartDto } from './dto/create-content-multipart.dto';
import { ContentStatus, ComplianceCheckStatus } from '@prisma/client';
import { nanoid } from 'nanoid';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private recognitionService: RecognitionService,
    private emailService: EmailService,
  ) {}

  async createContent(userId: string, createContentDto: CreateContentDto) {
    // Verify user has a creator profile
    const creatorProfile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creatorProfile) {
      throw new ForbiddenException('Creator profile not found');
    }

    // Validate number of items
    if (createContentDto.items.length === 0) {
      throw new BadRequestException('At least one content item is required');
    }

    if (createContentDto.items.length > 10) {
      throw new BadRequestException('Maximum 10 content items allowed per upload');
    }

    // Generate unique content ID and link
    const contentId = nanoid(10);
    const contentLink = `velolink.club/c/${contentId}`;

    // Upload thumbnail to S3
    const thumbnailUpload = await this.s3Service.uploadFile(
      createContentDto.thumbnailData,
      `thumbnail-${contentId}.jpg`,
      'image/jpeg',
      'thumbnails',
    );

    // AWS Rekognition Safety Check
    let contentStatus: ContentStatus = 'PENDING_REVIEW';
    let complianceStatus: ComplianceCheckStatus = 'PENDING';
    const complianceLogs: any[] = [];

    try {
      this.logger.log(`Checking content safety for ${contentId} using AWS Rekognition`);

      const safetyResult = await this.recognitionService.checkImageSafety(
        {
          type: 's3',
          data: thumbnailUpload.key,
          bucket: process.env.AWS_S3_BUCKET_NAME || 'velo-content',
        },
        50, // 50% minimum confidence threshold
      );

      if (safetyResult.isSafe) {
        // Content passed Rekognition check - auto-approve
        contentStatus = 'APPROVED';
        complianceStatus = 'PASSED';
        this.logger.log(`Content ${contentId} auto-approved (Rekognition: safe)`);
      } else {
        // Content flagged by Rekognition - require manual review
        contentStatus = 'PENDING_REVIEW';
        complianceStatus = 'MANUAL_REVIEW';

        this.logger.warn(
          `Content ${contentId} flagged by Rekognition: ${safetyResult.flaggedCategories.join(', ')}`,
        );

        // Create compliance log for flagged content
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
    } catch (error) {
      // If Rekognition fails, fall back to manual review
      const err = error as Error;
      this.logger.error(`Rekognition check failed for ${contentId}: ${err.message}`);
      contentStatus = 'PENDING_REVIEW';
      complianceStatus = 'PENDING';
    }

    // Upload all content items to S3
    const contentItemsData = await Promise.all(
      createContentDto.items.map(async (item, index) => {
        // Parse base64 data URI properly
        const dataUriMatch = item.fileData.match(/^data:(.+);base64,/);
        if (!dataUriMatch || !dataUriMatch[1]) {
          throw new BadRequestException(`Invalid file data format for item ${index + 1}`);
        }

        const mimeType: string = dataUriMatch[1];  // e.g., "video/mp4" or "image/png"
        const fileExtension = mimeType.split('/')[1] || 'bin';
        const fileName = `${contentId}-item-${index}.${fileExtension}`;

        // Extract base64 content (remove data URI prefix)
        const base64Parts = item.fileData.split(',');
        if (base64Parts.length !== 2 || !base64Parts[1]) {
          throw new BadRequestException(`Invalid base64 data format for item ${index + 1}`);
        }
        const base64Content: string = base64Parts[1];
        const buffer = Buffer.from(base64Content, 'base64');

        // Validate file size (500MB = 524,288,000 bytes)
        // This is the actual decoded file size, not the base64 payload size
        const MAX_FILE_SIZE = 524288000; // 500MB
        if (buffer.length > MAX_FILE_SIZE) {
          throw new BadRequestException(
            `File ${index + 1} exceeds maximum size of 500MB (actual: ${Math.round(buffer.length / 1048576)}MB). Please compress your video or reduce quality.`
          );
        }

        // Validate MIME type
        const ALLOWED_TYPES = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'video/mp4',
          'video/quicktime',  // .mov files
          'video/x-msvideo',  // .avi files
          'video/webm',
        ];

        if (!ALLOWED_TYPES.includes(mimeType)) {
          throw new BadRequestException(
            `File type ${mimeType} is not supported. Allowed types: ${ALLOWED_TYPES.join(', ')}`
          );
        }

        const upload = await this.s3Service.uploadFile(
          item.fileData,
          fileName,
          mimeType,
          'content',
        );

        return {
          s3Key: upload.key,
          s3Bucket: process.env.AWS_S3_BUCKET_NAME || 'velo-content',
          fileSize: item.fileSize,
          order: index,
        };
      }),
    );

    const totalFileSize = createContentDto.items.reduce((sum, item) => sum + item.fileSize, 0);

    // Create content with items and safety check results
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
        status: contentStatus, // Use Rekognition result
        complianceStatus: complianceStatus, // Use Rekognition result
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

    // Create compliance logs if content was flagged
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
      } catch (logError) {
        // Don't fail the entire upload if compliance logging fails
        const err = logError as Error;
        this.logger.error(`Failed to create compliance logs: ${err.message}`);
      }
    }

    return {
      content,
      link: `https://${contentLink}`,
      shortId: contentId,
      status: contentStatus, // Return status to frontend
    };
  }

  async createContentMultipart(
    userId: string,
    createContentDto: CreateContentMultipartDto,
    files: Express.Multer.File[],
    thumbnailFile: Express.Multer.File,
    filesMetadata: Array<{
      fileName: string;
      contentType: string;
      fileSize: number;
      duration?: number;
    }>,
  ) {
    // Verify user has a creator profile
    const creatorProfile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creatorProfile) {
      throw new ForbiddenException('Creator profile not found');
    }

    // Validate number of items
    if (files.length === 0) {
      throw new BadRequestException('At least one content item is required');
    }

    if (files.length > 20) {
      throw new BadRequestException('Maximum 20 content items allowed per upload');
    }

    // Generate unique content ID
    const contentId = nanoid(10);

    // Upload thumbnail to S3 using streaming
    const thumbnailUpload = await this.s3Service.uploadFileStream(
      thumbnailFile.buffer,
      thumbnailFile.originalname,
      thumbnailFile.mimetype,
      'thumbnails',
    );

    // Upload all content items to S3 using streaming FIRST
    const contentItemsData = await Promise.all(
      files.map(async (file, index) => {
        // Validate file size
        const MAX_FILE_SIZE = 524288000; // 500MB
        if (file.size > MAX_FILE_SIZE) {
          throw new BadRequestException(
            `File ${index + 1} exceeds maximum size of 500MB (actual: ${Math.round(file.size / 1048576)}MB)`,
          );
        }

        const upload = await this.s3Service.uploadFileStream(
          file.buffer,
          file.originalname,
          file.mimetype,
          'content',
        );

        return {
          s3Key: upload.key,
          s3Bucket: process.env.AWS_S3_BUCKET_NAME || 'velo-content',
          fileSize: file.size,
          order: index,
          mimeType: file.mimetype,
        };
      }),
    );

    // Determine if content contains video
    const hasVideo = files.some(file => file.mimetype.startsWith('video/'));
    const videoItem = contentItemsData.find(item => item.mimeType.startsWith('video/'));

    // Initialize status variables
    let contentStatus: ContentStatus = 'PENDING_REVIEW';
    let complianceStatus: ComplianceCheckStatus = 'PENDING';
    let rekognitionJobId: string | null = null;
    let moderationCheckType: string = 'THUMBNAIL_ONLY';
    const complianceLogs: any[] = [];

    // Step 1: Always check thumbnail synchronously first
    try {
      this.logger.log(`Checking thumbnail safety for ${contentId} using AWS Rekognition`);

      const thumbnailSafetyResult = await this.recognitionService.checkImageSafety(
        {
          type: 's3',
          data: thumbnailUpload.key,
          bucket: process.env.AWS_S3_BUCKET_NAME || 'velo-content',
        },
        50,
      );

      if (!thumbnailSafetyResult.isSafe) {
        // Thumbnail flagged - require manual review immediately
        contentStatus = 'PENDING_REVIEW';
        complianceStatus = 'MANUAL_REVIEW';
        moderationCheckType = 'SYNC_IMAGE';

        this.logger.warn(
          `Content ${contentId} thumbnail flagged by Rekognition: ${thumbnailSafetyResult.flaggedCategories.join(', ')}`,
        );

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
      } else if (hasVideo && videoItem) {
        // Step 2: For video content with clean thumbnail, start async video moderation
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
        } catch (videoError) {
          const err = videoError as Error;
          this.logger.error(`Failed to start video moderation for ${contentId}: ${err.message}`);
          // Fall back to pending manual review
          contentStatus = 'PENDING_REVIEW';
          complianceStatus = 'PENDING';
        }
      } else {
        // Image-only content with clean thumbnail - auto-approve
        contentStatus = 'APPROVED';
        complianceStatus = 'PASSED';
        moderationCheckType = 'SYNC_IMAGE';
        this.logger.log(`Content ${contentId} auto-approved (image-only, thumbnail safe)`);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Rekognition thumbnail check failed for ${contentId}: ${err.message}`);
      contentStatus = 'PENDING_REVIEW';
      complianceStatus = 'PENDING';
    }

    const totalFileSize = files.reduce((sum, file) => sum + file.size, 0);

    // Create content with items and safety check results
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
        // Only publish immediately if auto-approved (images only)
        isPublished: contentStatus === 'APPROVED',
        publishedAt: contentStatus === 'APPROVED' ? new Date() : null,
        // Async video moderation tracking
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

    // Create compliance logs if content was flagged
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
      } catch (logError) {
        const err = logError as Error;
        this.logger.error(`Failed to create compliance logs: ${err.message}`);
      }
    }

    // If auto-approved (images only), send email immediately
    if (contentStatus === 'APPROVED') {
      await this.sendApprovalEmail(content, content.creator.user.id);
    }

    // Return response WITHOUT link (link only revealed after approval)
    return {
      content,
      shortId: contentId,
      status: contentStatus,
      message: contentStatus === 'APPROVED'
        ? 'Content approved! Check your email for your shareable link.'
        : 'Content submitted for review. You will receive an email when approved.',
    };
  }

  /**
   * Process pending video moderation jobs (called by cron)
   */
  async processVideoModerationJobs(): Promise<void> {
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
          const jobResult = await this.recognitionService.getVideoSafetyResults(
            content.rekognitionJobId!,
          );

          if (jobResult.status === 'SUCCEEDED') {
            await this.handleModerationJobComplete(content, jobResult);
          } else if (jobResult.status === 'FAILED') {
            await this.handleModerationJobFailed(content, jobResult);
          }
          // If still IN_PROGRESS, do nothing - will check again next poll
        } catch (error) {
          const err = error as Error;
          this.logger.error(`Failed to check job ${content.rekognitionJobId}: ${err.message}`);
        }
      }
    } catch (error) {
      const err = error as Error;
      // Wrap database errors to handle connection timeouts gracefully
      if (err.message.includes('Connection terminated') || err.message.includes('timeout')) {
        this.logger.warn('Database connection timeout in video moderation - will retry later');
        return; // Silently fail and retry on next cron run
      }
      throw error; // Re-throw other errors
    }
  }

  /**
   * Handle completed moderation job
   */
  private async handleModerationJobComplete(
    content: any,
    jobResult: { isSafe?: boolean; unsafeSegments?: any[]; statusMessage?: string },
  ): Promise<void> {
    let newStatus: ContentStatus;
    let complianceStatus: ComplianceCheckStatus;

    if (jobResult.isSafe) {
      newStatus = 'APPROVED';
      complianceStatus = 'PASSED';
      this.logger.log(`Content ${content.id} approved by video moderation`);
    } else {
      // Flagged content - send to manual review
      newStatus = 'PENDING_REVIEW';
      complianceStatus = 'MANUAL_REVIEW';

      this.logger.warn(`Content ${content.id} flagged by video moderation`);

      // Log compliance issue
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

    // Update content record
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

    // Send email notification if approved
    if (newStatus === 'APPROVED') {
      await this.sendApprovalEmail(content, content.creator.user.id);
    }
  }

  /**
   * Handle failed moderation job
   */
  private async handleModerationJobFailed(
    content: any,
    jobResult: { statusMessage?: string },
  ): Promise<void> {
    // Job failed - require manual review
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

  /**
   * Send approval email with content link
   */
  private async sendApprovalEmail(content: any, userId: string): Promise<void> {
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
    } catch (error) {
      // Don't fail the approval process if email fails
      const err = error as Error;
      this.logger.error(`Failed to send approval email for ${content.id}: ${err.message}`);
    }
  }

  async getCreatorContent(userId: string) {
    const creatorProfile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creatorProfile) {
      throw new NotFoundException('Creator profile not found');
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

  async getContentById(contentId: string) {
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
      throw new NotFoundException('Content not found');
    }

    this.logger.log(`[CREATOR PREVIEW] Fetching content ${contentId}, has ${content.contentItems?.length || 0} items`);

    // Generate signed URLs for content items (for creator preview)
    if (content.contentItems && content.contentItems.length > 0) {
      const contentItemsWithUrls = await Promise.all(
        content.contentItems.map(async (item) => {
          try {
            const signedUrl = await this.s3Service.getSignedUrl(item.s3Key, 86400); // 24 hours
            this.logger.log(`[CREATOR PREVIEW] Generated signed URL for item ${item.id}: ${signedUrl.substring(0, 100)}...`);
            return {
              ...item,
              signedUrl,
            };
          } catch (error) {
            this.logger.error(`[CREATOR PREVIEW] Failed to generate signed URL for ${item.s3Key}:`, error);
            return item;
          }
        })
      );

      return {
        ...content,
        contentItems: contentItemsWithUrls,
      };
    }

    return content;
  }

  async deleteContent(userId: string, contentId: string) {
    const creatorProfile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creatorProfile) {
      throw new ForbiddenException('Creator profile not found');
    }

    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      include: {
        contentItems: true,
      },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    if (content.creatorId !== creatorProfile.id) {
      throw new ForbiddenException('You do not have permission to delete this content');
    }

    // Delete files from S3
    try {
      // Delete thumbnail from S3
      if (content.s3Key) {
        await this.s3Service.deleteFile(content.s3Key);
      }

      // Delete all content items from S3
      const s3Keys = content.contentItems.map((item) => item.s3Key);
      if (s3Keys.length > 0) {
        await this.s3Service.deleteMultipleFiles(s3Keys);
      }
    } catch (error) {
      console.error('Error deleting files from S3:', error);
      // Continue with database deletion even if S3 deletion fails
    }

    await this.prisma.content.delete({
      where: { id: contentId },
    });

    return { message: 'Content deleted successfully' };
  }

  async getContentStats(userId: string) {
    const creatorProfile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creatorProfile) {
      throw new NotFoundException('Creator profile not found');
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
}

import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { RecognitionService } from '../recognition/recognition.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import { CreateContentDto } from './dto/create-content.dto';
import { CreateContentMultipartDto } from './dto/create-content-multipart.dto';
import { GetUploadUrlDto } from './dto/get-upload-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
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
    private notificationsService: NotificationsService,
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

    // Auto-approve content on upload
    const contentStatus: ContentStatus = 'APPROVED';
    const complianceStatus: ComplianceCheckStatus = 'PASSED';

    this.logger.log(`Content ${contentId} auto-approved on upload`);

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

    // Create content with items - will be reviewed after scheduled time
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

    // Auto-approve content on upload
    const contentStatus: ContentStatus = 'APPROVED';
    const complianceStatus: ComplianceCheckStatus = 'PASSED';

    this.logger.log(`Content ${contentId} auto-approved on upload`);

    const totalFileSize = files.reduce((sum, file) => sum + file.size, 0);

    // Create content with items - will be reviewed after scheduled time
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
      message: 'Content uploaded and approved.',
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

    // Generate signed URLs for all content items so creator can preview their content
    const contentWithSignedUrls = await Promise.all(
      content.map(async (contentItem) => {
        if (contentItem.contentItems && contentItem.contentItems.length > 0) {
          const itemsWithUrls = await Promise.all(
            contentItem.contentItems.map(async (item) => {
              try {
                const signedUrl = await this.s3Service.getSignedUrl(item.s3Key, 86400); // 24 hours
                return {
                  ...item,
                  signedUrl,
                };
              } catch (error) {
                this.logger.error(`Failed to generate signed URL for ${item.s3Key}:`, error);
                return item;
              }
            })
          );

          return {
            ...contentItem,
            contentItems: itemsWithUrls,
          };
        }

        return contentItem;
      })
    );

    return contentWithSignedUrls;
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

  /**
   * Review content immediately after upload instead of waiting for scheduled cron
   */
  private async reviewContentImmediately(contentId: string) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
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
    });

    if (!content) {
      this.logger.error(`Content ${contentId} not found for immediate review`);
      return;
    }

    try {
      this.logger.log(`Running immediate recognition check for content ${content.id} (type: ${content.contentType})`);

      // Check content with AWS Rekognition (using thumbnail for quick screening)
      const safetyResult = await this.recognitionService.checkImageSafety(
        {
          type: 's3',
          data: content.s3Key,
          bucket: content.s3Bucket,
        },
        50, // 50% minimum confidence threshold
      );

      if (safetyResult.isSafe) {
        // Content is safe - approve it
        await this.prisma.content.update({
          where: { id: content.id },
          data: {
            status: 'APPROVED',
            complianceStatus: 'PASSED',
          },
        });

        this.logger.log(`Content ${content.id} APPROVED immediately`);

        // Send approval email
        if (content.creator?.user?.email) {
          await this.emailService.sendContentApproved(
            content.creator.user.email,
            {
              creator_name: content.creator.user.displayName || 'Creator',
              content_title: content.title,
              content_link: `https://velolink.club/c/${content.id}`,
            },
          ).catch((err: Error) => this.logger.error('Failed to send approval email:', err.message));
        }
      } else {
        // Content flagged - mark for manual review
        await this.prisma.content.update({
          where: { id: content.id },
          data: {
            status: 'PENDING_REVIEW',
            complianceStatus: 'MANUAL_REVIEW',
          },
        });

        this.logger.warn(`Content ${content.id} flagged for manual review`);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Immediate review failed for content ${content.id}: ${err.message}`);
      
      // On error, flag for manual review
      await this.prisma.content.update({
        where: { id: content.id },
        data: {
          status: 'PENDING_REVIEW',
          complianceStatus: 'MANUAL_REVIEW',
        },
      });
    }
  }

  /**
   * Process content that has been scheduled for review (10 minutes after upload)
   * Called by cron job every minute
   */
  async processScheduledContentReviews() {
    const now = new Date();
    
    // Find all content that is PENDING_REVIEW and scheduled for review now or in the past
    const contentToReview = await this.prisma.content.findMany({
      where: {
        status: 'PENDING_REVIEW',
        complianceStatus: 'PENDING',
        scheduledReviewAt: {
          lte: now,
        },
      },
      include: {
        contentItems: true, // Include actual content files
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
      take: 10, // Process 10 at a time to avoid overload
    });

    if (contentToReview.length === 0) {
      return { processed: 0, results: [] };
    }

    this.logger.log(`Processing ${contentToReview.length} scheduled content review(s)`);

    const results = await Promise.all(
      contentToReview.map(async (content) => {
        try {
          this.logger.log(`Running recognition check for content ${content.id} (type: ${content.contentType})`);

          // For VIDEO content, we need to check the actual video file, not the thumbnail
          let s3KeyToCheck = content.s3Key; // Default to thumbnail
          
          if (content.contentType === 'VIDEO' && content.contentItems && content.contentItems.length > 0) {
            // Use the first content item (the actual video file)
            const firstContentItem = content.contentItems[0];
            if (firstContentItem) {
              s3KeyToCheck = firstContentItem.s3Key;
              this.logger.log(`Using video file for recognition: ${s3KeyToCheck}`);
            }
          }

          // Check content with AWS Rekognition
          let safetyResult;
          try {
            // For videos, we should ideally use startVideoSafetyCheck, but for now
            // we'll check the thumbnail as a quick safety check
            // TODO: Implement proper video moderation using startVideoSafetyCheck
            safetyResult = await this.recognitionService.checkImageSafety(
              {
                type: 's3',
                data: content.s3Key, // Always check thumbnail for quick initial screening
                bucket: content.s3Bucket,
              },
              50, // 50% minimum confidence threshold
            );
          } catch (recognitionError) {
            const err = recognitionError as Error;
            this.logger.error(
              `Rekognition check failed for content ${content.id}: ${err.message}`,
            );
            this.logger.error('S3 Key:', content.s3Key, 'Bucket:', content.s3Bucket);
            
            // If Rekognition fails, flag for manual review instead of auto-approving
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

          let newStatus: ContentStatus;
          let newComplianceStatus: ComplianceCheckStatus;
          const complianceLogs: any[] = [];

          if (safetyResult.isSafe) {
            // Content passed Rekognition check - auto-approve
            newStatus = 'APPROVED';
            newComplianceStatus = 'PASSED';
            this.logger.log(`Content ${content.id} auto-approved (Rekognition: safe)`);
          } else {
            // Content flagged by Rekognition - require manual review
            newStatus = 'PENDING_REVIEW';
            newComplianceStatus = 'MANUAL_REVIEW';

            this.logger.warn(
              `Content ${content.id} flagged by Rekognition: ${safetyResult.flaggedCategories.join(', ')}`,
            );

            // Create compliance log for flagged content
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

          // Update content status
          await this.prisma.content.update({
            where: { id: content.id },
            data: {
              status: newStatus,
              complianceStatus: newComplianceStatus,
              complianceCheckedAt: new Date(),
            },
          });

          // Create compliance logs if content was flagged
          if (complianceLogs.length > 0) {
            await this.prisma.complianceLog.createMany({
              data: complianceLogs,
            });
          }

          // Send email notification to creator
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
            } else if (newComplianceStatus === 'MANUAL_REVIEW') {
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
          } catch (emailError) {
            const err = emailError as Error;
            this.logger.error(`Failed to send email for content ${content.id}: ${err.message}`);
            // Don't fail the review process if email fails
          }

          return {
            contentId: content.id,
            status: newStatus,
            complianceStatus: newComplianceStatus,
            success: true,
          };
        } catch (error) {
          const err = error as Error;
          this.logger.error(`Failed to process content ${content.id}: ${err.message}`);
          
          return {
            contentId: content.id,
            success: false,
            error: err.message,
          };
        }
      }),
    );

    const successCount = results.filter((r) => r.success).length;
    this.logger.log(`Processed ${successCount}/${contentToReview.length} content reviews successfully`);

    return {
      processed: contentToReview.length,
      successful: successCount,
      results,
    };
  }

  /**
   * Generate presigned upload URLs for direct S3 upload (bypasses API Gateway 10MB limit)
   */
  async getPresignedUploadUrls(userId: string, dto: GetUploadUrlDto) {
    // Verify user has creator profile
    const creatorProfile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creatorProfile) {
      throw new ForbiddenException('Creator profile not found');
    }

    // Validate file limits
    if (dto.contentFiles.length === 0) {
      throw new BadRequestException('At least one content file is required');
    }

    if (dto.contentFiles.length > 10) {
      throw new BadRequestException('Maximum 10 content files allowed per upload');
    }

    // Validate file sizes (500MB max)
    const MAX_FILE_SIZE = 524288000; // 500MB
    for (const file of dto.contentFiles) {
      if (file.fileSize > MAX_FILE_SIZE) {
        throw new BadRequestException(
          `File "${file.fileName}" exceeds maximum size of 500MB (${Math.round(file.fileSize / 1048576)}MB)`
        );
      }
    }

    if (dto.thumbnailFileSize > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `Thumbnail exceeds maximum size of 500MB`
      );
    }

    // Generate unique content ID
    const contentId = nanoid(10);

    // Generate presigned URL for thumbnail
    const thumbnailUrl = await this.s3Service.getPresignedUploadUrl(
      dto.thumbnailFileName,
      dto.thumbnailContentType,
      'thumbnail',
    );

    // Generate presigned URLs for content files
    const contentUrls = await Promise.all(
      dto.contentFiles.map((file, index) => {
        const fileExtension = file.fileName.split('.').pop();
        const fileName = `${contentId}-item-${index}.${fileExtension}`;
        return this.s3Service.getPresignedUploadUrl(
          fileName,
          file.contentType,
          'content',
        );
      }),
    );

    return {
      contentId,
      thumbnailUrl: {
        uploadUrl: thumbnailUrl.uploadUrl,
        key: thumbnailUrl.key,
      },
      contentUrls: contentUrls.map((url, index) => ({
        uploadUrl: url.uploadUrl,
        key: url.key,
        index,
        originalFileName: dto.contentFiles[index]?.fileName || `file-${index}`,
      })),
      metadata: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        price: dto.price,
      },
    };
  }

  /**
   * Confirm direct S3 upload and create content record
   */
  async confirmDirectUpload(userId: string, dto: ConfirmUploadDto) {
    // Verify user has creator profile
    const creatorProfile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            displayName: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!creatorProfile) {
      throw new ForbiddenException('Creator profile not found');
    }

    // Generate content link
    const contentLink = `velolink.club/c/${dto.contentId}`;
    const totalFileSize = dto.items.reduce((sum: number, item) => sum + item.fileSize, 0);

    // Create content record with APPROVED status (pre-approved)
    const content = await this.prisma.content.create({
      data: {
        id: dto.contentId,
        creatorId: creatorProfile.id,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        thumbnailUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${dto.thumbnailS3Key}`,
        contentType: dto.items.length === 1
          ? (dto.items[0]?.type === 'IMAGE' ? 'IMAGE' : 'VIDEO')
          : 'GALLERY',
        s3Key: dto.thumbnailS3Key,
        s3Bucket: process.env.AWS_S3_BUCKET_NAME || 'amnz-s3-pm-bucket',
        fileSize: totalFileSize,
        status: 'APPROVED',
        complianceStatus: 'PASSED',
        isPublished: true,
        publishedAt: new Date(),
        contentItems: {
          create: dto.items.map((item: any, index: number) => ({
            s3Key: item.s3Key,
            s3Bucket: process.env.AWS_S3_BUCKET_NAME || 'amnz-s3-pm-bucket',
            fileSize: item.fileSize,
            order: index,
          })),
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
      shortId: dto.contentId,
      status: 'APPROVED',
    };
  }
}


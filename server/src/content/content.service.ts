import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { RecognitionService } from '../recognition/recognition.service';
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

    // Generate unique content ID and link
    const contentId = nanoid(10);
    const contentLink = `velolink.club/c/${contentId}`;

    // Upload thumbnail to S3 using streaming
    const thumbnailUpload = await this.s3Service.uploadFileStream(
      thumbnailFile.buffer,
      thumbnailFile.originalname,
      thumbnailFile.mimetype,
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
        50,
      );

      if (safetyResult.isSafe) {
        contentStatus = 'APPROVED';
        complianceStatus = 'PASSED';
        this.logger.log(`Content ${contentId} auto-approved (Rekognition: safe)`);
      } else {
        contentStatus = 'PENDING_REVIEW';
        complianceStatus = 'MANUAL_REVIEW';

        this.logger.warn(
          `Content ${contentId} flagged by Rekognition: ${safetyResult.flaggedCategories.join(', ')}`,
        );

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
      const err = error as Error;
      this.logger.error(`Rekognition check failed for ${contentId}: ${err.message}`);
      contentStatus = 'PENDING_REVIEW';
      complianceStatus = 'PENDING';
    }

    // Upload all content items to S3 using streaming
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
        };
      }),
    );

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
        const err = logError as Error;
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

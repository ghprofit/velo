import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CreateContentDto } from './dto/create-content.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  /**
   * Helper to generate signed URL for thumbnail
   */
  private async getSignedThumbnailUrl(s3Key: string, thumbnailUrl: string): Promise<string> {
    if (s3Key) {
      try {
        return await this.s3Service.getSignedUrl(s3Key, 86400); // 24 hours
      } catch (error) {
        console.error('Failed to generate signed URL, using fallback:', error);
        return thumbnailUrl;
      }
    }
    return thumbnailUrl;
  }

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

    // Upload all content items to S3
    const contentItemsData = await Promise.all(
      createContentDto.items.map(async (item, index) => {
        const mimeType = item.fileData.split(';')[0];
        const fileExtension = mimeType?.split('/')[1] || 'bin';
        const fileName = `${contentId}-item-${index}.${fileExtension}`;
        const contentType = mimeType?.split(':')[1] || 'application/octet-stream';

        const upload = await this.s3Service.uploadFile(
          item.fileData,
          fileName,
          contentType,
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

    // Create content with items
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
        status: 'APPROVED',
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

    // Add signed URLs to all content thumbnails
    const contentWithSignedUrls = await Promise.all(
      content.map(async (item) => ({
        ...item,
        thumbnailUrl: await this.getSignedThumbnailUrl(item.s3Key, item.thumbnailUrl),
      })),
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
              },
            },
          },
        },
      },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    // Add signed URL for thumbnail
    const thumbnailUrl = await this.getSignedThumbnailUrl(content.s3Key, content.thumbnailUrl);

    return {
      ...content,
      thumbnailUrl,
    };
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

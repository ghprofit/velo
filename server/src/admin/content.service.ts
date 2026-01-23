import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { S3Service } from '../s3/s3.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import { QueryContentDto, ReviewContentDto, ContentStatsDto } from './dto/content.dto';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private s3Service: S3Service,
    private notificationsService: NotificationsService,
  ) {}

  async getContent(query: QueryContentDto) {
    const { search, status, creatorId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

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

    // Get content with pagination
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

  async getContentStats(): Promise<{ success: boolean; data: ContentStatsDto }> {
    const [totalContent, pendingReview, approved, rejected, flagged] =
      await Promise.all([
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

  async getContentById(id: string) {
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

    // Generate signed URLs for all content items
    let signedUrl: string | undefined;
    const contentItemsWithUrls = await Promise.all(
      content.contentItems.map(async (item) => {
        let itemSignedUrl: string | undefined;
        if (item.s3Key) {
          try {
            itemSignedUrl = await this.s3Service.getSignedUrl(item.s3Key, 86400); // 24 hours
          } catch (error) {
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
      })
    );

    // For backward compatibility, set signedUrl to first item's URL
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

  async reviewContent(id: string, dto: ReviewContentDto) {
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

    // Send email notification to creator
    try {
      const creatorName = content.creator.displayName || content.creator.user.displayName || 'Creator';
      const creatorEmail = content.creator.user.email;

      if (dto.status === 'APPROVED') {
        this.logger.log(`Sending approval email for content ${id} to ${creatorEmail}`);
        await this.emailService.sendContentApproval(
          creatorEmail,
          creatorName,
          content.title,
          `${process.env.CLIENT_URL || 'https://velolink.club'}/c/${content.id}`,
        );
      } else if (dto.status === 'REJECTED') {
        this.logger.log(`Sending rejection email for content ${id} to ${creatorEmail}`);
        await this.emailService.sendContentRejection(
          creatorEmail,
          creatorName,
          content.title,
          'Content does not meet our community guidelines',
        );
      }
    } catch (emailError) {
      // Don't fail the review if email fails - just log it
      const error = emailError as Error;
      this.logger.error(`Failed to send email notification: ${error.message}`);
    }

    // Create in-app notification for creator
    try {
      const creatorUserId = content.creator.user.id;
      const notificationType = dto.status === 'APPROVED'
        ? NotificationType.CONTENT_APPROVED
        : NotificationType.CONTENT_REJECTED;

      const notificationTitle = dto.status === 'APPROVED'
        ? 'Content Approved!'
        : 'Content Requires Changes';

      const notificationMessage = dto.status === 'APPROVED'
        ? `Your content "${content.title}" has been approved and is now live!`
        : `Your content "${content.title}" was not approved. Please review our guidelines.`;

      await this.notificationsService.notify(
        creatorUserId,
        notificationType,
        notificationTitle,
        notificationMessage,
        {
          contentId: content.id,
          contentTitle: content.title,
          status: dto.status,
        },
      );
      this.logger.log(`Creator notification created for content review: ${id}`);
    } catch (notifError) {
      const error = notifError as Error;
      this.logger.error(`Failed to create creator notification: ${error.message}`);
      // Don't fail the review if notification fails
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

  async flagContent(id: string, reason: string) {
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

    // Notify admins about flagged content
    try {
      await this.notificationsService.notifyAdmins(
        NotificationType.FLAGGED_CONTENT_ALERT,
        'Content Flagged',
        `Content "${content.title}" by ${content.creator?.displayName || 'Unknown'} has been flagged. Reason: ${reason}`,
        {
          contentId: content.id,
          contentTitle: content.title,
          creatorId: content.creatorId,
          reason,
        },
      );
      this.logger.log(`Admin notification sent for flagged content: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to notify admins about flagged content:`, error);
      // Don't fail the flag operation if notification fails
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

  async removeContent(id: string, reason: string) {
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
}

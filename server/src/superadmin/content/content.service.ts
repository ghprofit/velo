import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../email/email.service';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../../s3/s3.service';
import { QueryContentDto } from './dto/query-content.dto';
import { UpdateContentDto, ReviewContentDto, RemoveContentDto } from './dto/update-content.dto';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private config: ConfigService,
    private s3Service: S3Service,
  ) {}

  async getContent(query: QueryContentDto) {
    const { search, status, complianceStatus, contentType, severity, page = 1, limit = 20 } = query;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
        { creator: { displayName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Compliance status filter
    if (complianceStatus && complianceStatus !== 'all') {
      where.complianceStatus = complianceStatus;
    }

    // Content type filter
    if (contentType && contentType !== 'all') {
      where.contentType = contentType;
    }

    // Severity filter (based on compliance logs)
    if (severity && severity !== 'all') {
      // This is a simplified approach - in production you'd calculate severity from compliance logs
      where.status = 'FLAGGED';
    }

    const [content, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        include: {
          creator: {
            select: {
              displayName: true,
              userId: true,
            },
          },
          complianceLogs: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.content.count({ where }),
    ]);

    return {
      data: content.map((item) => this.formatContentResponse(item)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getContentStats() {
    const [
      totalContent,
      pendingReview,
      flagged,
      approved,
      rejected,
      highSeverity,
    ] = await Promise.all([
      this.prisma.content.count(),
      this.prisma.content.count({
        where: { status: 'PENDING_REVIEW' },
      }),
      this.prisma.content.count({
        where: { status: 'FLAGGED' },
      }),
      this.prisma.content.count({
        where: { status: 'APPROVED' },
      }),
      this.prisma.content.count({
        where: { status: 'REJECTED' },
      }),
      this.prisma.content.count({
        where: {
          status: 'FLAGGED',
          complianceStatus: 'FAILED',
        },
      }),
    ]);

    return {
      totalContent,
      pendingReview,
      flagged,
      approved,
      rejected,
      highSeverity,
    };
  }

  async getContentById(id: string) {
    const content = await this.prisma.content.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            displayName: true,
            userId: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        complianceLogs: {
          orderBy: { createdAt: 'desc' },
        },
        contentItems: true,
        purchases: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    return this.formatContentDetailResponse(content);
  }

  async updateContent(id: string, dto: UpdateContentDto) {
    const content = await this.prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    const updateData: any = {};

    if (dto.status) updateData.status = dto.status;
    if (dto.complianceStatus) updateData.complianceStatus = dto.complianceStatus;
    if (dto.complianceNotes !== undefined) updateData.complianceNotes = dto.complianceNotes;
    if (dto.isPublished !== undefined) {
      updateData.isPublished = dto.isPublished;
      if (dto.isPublished && !content.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updatedContent = await this.prisma.content.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            displayName: true,
            userId: true,
          },
        },
      },
    });

    return this.formatContentResponse(updatedContent);
  }

  async reviewContent(id: string, dto: ReviewContentDto, adminId: string) {
    const content = await this.prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    const updateData: any = {
      status: dto.decision,
      complianceStatus: dto.decision === 'APPROVED' ? 'PASSED' : 'FAILED',
      complianceNotes: dto.notes,
      complianceCheckedAt: new Date(),
    };

    if (dto.decision === 'APPROVED') {
      updateData.isPublished = true;
      updateData.publishedAt = content.publishedAt || new Date();
    } else {
      updateData.isPublished = false;
    }

    const [updatedContent] = await Promise.all([
      this.prisma.content.update({
        where: { id },
        data: updateData,
        include: {
          creator: {
            include: {
              user: true,
            },
          },
        },
      }),
      this.prisma.complianceLog.create({
        data: {
          contentId: id,
          checkType: 'MANUAL_REVIEW',
          status: dto.decision === 'APPROVED' ? 'PASSED' : 'FAILED',
          reviewedBy: adminId,
          notes: dto.notes || dto.reason,
          flaggedReasons: dto.reason ? [dto.reason] : [],
        },
      }),
      this.prisma.adminAction.create({
        data: {
          adminId,
          action: `CONTENT_${dto.decision}`,
          targetType: 'CONTENT',
          targetId: id,
          reason: dto.notes || dto.reason,
        },
      }),
    ]);

    // Send email notification to creator
    try {
      const clientUrl = this.config.get<string>('CLIENT_URL') || 'http://localhost:3000';

      if (dto.decision === 'APPROVED') {
        await this.emailService.sendContentApproved(
          updatedContent.creator.user.email,
          {
            creator_name: updatedContent.creator.displayName,
            content_title: updatedContent.title,
            content_link: `${clientUrl}/c/${updatedContent.id}`,
          },
        );
      } else if (dto.decision === 'REJECTED') {
        await this.emailService.sendContentRejected(
          updatedContent.creator.user.email,
          {
            creator_name: updatedContent.creator.displayName,
            content_title: updatedContent.title,
            rejection_reason: dto.notes || dto.reason || 'Content does not meet platform guidelines',
          },
        );
      }
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to send content review email:', error);
    }

    return this.formatContentResponse(updatedContent);
  }

  async removeContent(id: string, dto: RemoveContentDto, adminId: string) {
    const content = await this.prisma.content.findUnique({
      where: { id },
      include: {
        creator: true,
      },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    const [updatedContent] = await Promise.all([
      this.prisma.content.update({
        where: { id },
        data: {
          status: 'REMOVED',
          isPublished: false,
          complianceStatus: 'FAILED',
          complianceNotes: dto.reason,
        },
        include: {
          creator: {
            include: {
              user: true,
            },
          },
        },
      }),
      this.prisma.adminAction.create({
        data: {
          adminId,
          action: 'CONTENT_REMOVED',
          targetType: 'CONTENT',
          targetId: id,
          reason: dto.reason,
        },
      }),
    ]);

    // Send notification to creator if notifyCreator is true
    if (dto.notifyCreator) {
      try {
        await this.emailService.sendEmail({
          to: updatedContent.creator.user.email,
          subject: 'Content Removed - Action Required',
          html: `Your content "${updatedContent.title}" has been removed from the platform. Reason: ${dto.reason}`,
        });
      } catch (error) {
        console.error('Failed to send content removal email:', error);
      }
    }

    return this.formatContentResponse(updatedContent);
  }

  private formatContentResponse(content: any) {
    const statusMap: Record<string, string> = {
      PENDING_REVIEW: 'Pending Review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      FLAGGED: 'Flagged',
      REMOVED: 'Removed',
    };

    const complianceStatusMap: Record<string, string> = {
      PENDING: 'Pending',
      PASSED: 'Passed',
      FAILED: 'Failed',
      MANUAL_REVIEW: 'Manual Review',
    };

    return {
      id: content.id,
      title: content.title,
      description: content.description,
      creatorName: content.creator?.displayName || 'Unknown',
      creatorId: content.creator?.userId,
      contentType: content.contentType,
      thumbnailUrl: content.thumbnailUrl,
      price: content.price,
      status: statusMap[content.status] || content.status,
      complianceStatus: complianceStatusMap[content.complianceStatus] || content.complianceStatus,
      complianceNotes: content.complianceNotes,
      isPublished: content.isPublished,
      viewCount: content.viewCount,
      purchaseCount: content.purchaseCount,
      totalRevenue: content.totalRevenue,
      createdAt: content.createdAt,
      publishedAt: content.publishedAt,
    };
  }

  private async formatContentDetailResponse(content: any) {
    const base = this.formatContentResponse(content);

    // Generate signed URLs for content items (24-hour expiry for superadmin viewing)
    const contentItemsWithUrls = await Promise.all(
      (content.contentItems || []).map(async (item: any) => {
        const signedUrl = await this.s3Service.getSignedUrl(item.s3Key, 86400); // 24 hours
        return {
          id: item.id,
          s3Key: item.s3Key,
          s3Bucket: this.config.get<string>('AWS_S3_BUCKET_NAME') || 'velo-content',
          fileSize: item.fileSize,
          order: item.order,
          signedUrl,
        };
      })
    );

    return {
      ...base,
      creatorEmail: content.creator?.user?.email,
      fileSize: content.fileSize,
      duration: content.duration,
      s3Key: content.s3Key,
      s3Bucket: this.config.get<string>('AWS_S3_BUCKET_NAME') || 'velo-content',
      mediaType: content.contentType,
      updatedAt: content.updatedAt,
      complianceLogs: content.complianceLogs?.map((log: any) => ({
        id: log.id,
        checkType: log.checkType,
        status: log.status,
        confidence: log.confidence,
        flaggedReasons: log.flaggedReasons,
        reviewedBy: log.reviewedBy,
        notes: log.notes,
        createdAt: log.createdAt,
      })) || [],
      contentItems: contentItemsWithUrls,
      recentPurchases: content.purchases?.map((purchase: any) => ({
        id: purchase.id,
        amount: purchase.amount,
        createdAt: purchase.createdAt,
      })) || [],
    };
  }
}

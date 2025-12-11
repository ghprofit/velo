import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryContentDto } from './dto/query-content.dto';
import { UpdateContentDto, ReviewContentDto, RemoveContentDto } from './dto/update-content.dto';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

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
            select: {
              displayName: true,
              userId: true,
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
            select: {
              displayName: true,
              userId: true,
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

    // TODO: Send notification to creator if notifyCreator is true

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

  private formatContentDetailResponse(content: any) {
    const base = this.formatContentResponse(content);
    return {
      ...base,
      creatorEmail: content.creator?.user?.email,
      fileSize: content.fileSize,
      duration: content.duration,
      s3Key: content.s3Key,
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
      contentItems: content.contentItems?.map((item: any) => ({
        id: item.id,
        s3Key: item.s3Key,
        fileSize: item.fileSize,
        order: item.order,
      })) || [],
    };
  }
}

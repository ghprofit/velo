import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryContentDto, ReviewContentDto, ContentStatsDto } from './dto/content.dto';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

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
      },
    });

    if (!content) {
      return {
        success: false,
        message: 'Content not found',
      };
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
        updatedAt: new Date(),
      },
    });

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

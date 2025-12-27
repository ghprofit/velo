import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryCreatorsDto, CreatorStatsDto } from './dto/creators.dto';

@Injectable()
export class CreatorsService {
  constructor(private prisma: PrismaService) {}

  async getCreators(query: QueryCreatorsDto) {
    const { search, kycStatus, accountStatus, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (kycStatus && kycStatus !== 'all') {
      where.verificationStatus = kycStatus.toUpperCase();
    }

    if (accountStatus && accountStatus !== 'all') {
      if (accountStatus.toLowerCase() === 'active') {
        where.user = { ...where.user, isActive: true };
      } else if (accountStatus.toLowerCase() === 'suspended') {
        where.user = { ...where.user, isActive: false };
      }
    }

    // Get creators with pagination
    const [creators, total] = await Promise.all([
      this.prisma.creatorProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
              lastLogin: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.creatorProfile.count({ where }),
    ]);

    const formattedCreators = creators.map((creator) => ({
      id: creator.id,
      name: creator.displayName,
      email: creator.user.email,
      kycStatus: creator.verificationStatus,
      accountStatus: creator.user.isActive ? 'ACTIVE' : 'SUSPENDED',
      joinDate: creator.createdAt.toISOString(),
      lastLogin: creator.user.lastLogin?.toISOString() || null,
      isActive: creator.user.isActive,
      totalEarnings: creator.totalEarnings,
      totalViews: creator.totalViews,
      totalPurchases: creator.totalPurchases,
    }));

    return {
      success: true,
      data: formattedCreators,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCreatorStats(): Promise<{ success: boolean; data: CreatorStatsDto }> {
    const [
      totalCreators,
      activeCreators,
      suspendedCreators,
      kycPending,
      kycVerified,
      kycFailed,
    ] = await Promise.all([
      this.prisma.creatorProfile.count(),
      this.prisma.creatorProfile.count({
        where: { user: { isActive: true } },
      }),
      this.prisma.creatorProfile.count({
        where: { user: { isActive: false } },
      }),
      this.prisma.creatorProfile.count({
        where: { verificationStatus: 'PENDING' },
      }),
      this.prisma.creatorProfile.count({
        where: { verificationStatus: 'VERIFIED' },
      }),
      this.prisma.creatorProfile.count({
        where: { verificationStatus: 'REJECTED' },
      }),
    ]);

    return {
      success: true,
      data: {
        totalCreators,
        activeCreators,
        suspendedCreators,
        kycPending,
        kycVerified,
        kycFailed,
      },
    };
  }

  async getCreatorById(id: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
          },
        },
        content: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        payouts: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!creator) {
      return {
        success: false,
        message: 'Creator not found',
      };
    }

    return {
      success: true,
      data: {
        id: creator.id,
        name: creator.displayName,
        email: creator.user.email,
        profileImage: creator.profileImage,
        coverImage: creator.coverImage,
        kycStatus: creator.verificationStatus,
        accountStatus: creator.user.isActive ? 'ACTIVE' : 'SUSPENDED',
        joinDate: creator.createdAt.toISOString(),
        lastLogin: creator.user.lastLogin?.toISOString() || null,
        totalEarnings: creator.totalEarnings,
        totalViews: creator.totalViews,
        totalPurchases: creator.totalPurchases,
        payoutStatus: creator.payoutStatus,
        policyStrikes: creator.policyStrikes,
        recentContent: creator.content,
        recentPayouts: creator.payouts,
      },
    };
  }
}

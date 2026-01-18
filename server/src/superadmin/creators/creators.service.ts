import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryCreatorsDto } from './dto/query-creators.dto';
import { UpdateCreatorDto } from './dto/update-creator.dto';

@Injectable()
export class CreatorsService {
  constructor(private prisma: PrismaService) {}

  async getCreators(query: QueryCreatorsDto) {
    const { search, kycStatus, payoutStatus, strikes, page = 1, limit = 20 } = query;

    const where: any = {
      role: 'CREATOR',
      creatorProfile: {
        isNot: null,
      },
    };

    // Build creatorProfile filter conditions (without isNot)
    const profileConditions: any = {};

    // KYC Status filter
    if (kycStatus && kycStatus !== 'all') {
      profileConditions.verificationStatus = kycStatus;
    }

    // Payout Status filter
    if (payoutStatus && payoutStatus !== 'all') {
      profileConditions.payoutStatus = payoutStatus;
    }

    // Policy strikes filter
    if (strikes && strikes !== 'all') {
      if (strikes === '3+') {
        profileConditions.policyStrikes = { gte: 3 };
      } else {
        profileConditions.policyStrikes = parseInt(strikes, 10);
      }
    }

    // Apply profile conditions to the where clause
    if (Object.keys(profileConditions).length > 0) {
      where.creatorProfile = {
        ...where.creatorProfile,
        ...profileConditions,
      };
    }

    // Search filter
    if (search) {
      const searchConditions: any[] = [
        { email: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];

      // Add profile-based search conditions
      if (Object.keys(profileConditions).length > 0) {
        searchConditions.push(
          { 
            creatorProfile: { 
              displayName: { contains: search, mode: 'insensitive' },
              ...profileConditions
            }
          } as any,
          { 
            creatorProfile: { 
              firstName: { contains: search, mode: 'insensitive' },
              ...profileConditions
            }
          } as any,
          { 
            creatorProfile: { 
              lastName: { contains: search, mode: 'insensitive' },
              ...profileConditions
            }
          } as any
        );
      } else {
        searchConditions.push(
          { 
            creatorProfile: { 
              displayName: { contains: search, mode: 'insensitive' }
            }
          } as any,
          { 
            creatorProfile: { 
              firstName: { contains: search, mode: 'insensitive' }
            }
          } as any,
          { 
            creatorProfile: { 
              lastName: { contains: search, mode: 'insensitive' }
            }
          } as any
        );
      }

      where.OR = searchConditions;
    }

    const [creators, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          creatorProfile: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: creators.map((creator) => this.formatCreatorResponse(creator)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCreatorById(id: string) {
    const creator = await this.prisma.user.findUnique({
      where: { id },
      include: {
        creatorProfile: {
          include: {
            content: {
              take: 10,
              orderBy: { createdAt: 'desc' },
            },
            payouts: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!creator || !creator.creatorProfile) {
      throw new NotFoundException('Creator not found');
    }

    return this.formatCreatorDetailResponse(creator);
  }

  async updateCreator(id: string, dto: UpdateCreatorDto) {
    const creator = await this.prisma.user.findUnique({
      where: { id },
      include: { creatorProfile: true },
    });

    if (!creator || !creator.creatorProfile) {
      throw new NotFoundException('Creator not found');
    }

    const updateData: any = {};

    if (dto.displayName) updateData.displayName = dto.displayName;
    if (dto.payoutStatus) updateData.payoutStatus = dto.payoutStatus;
    if (dto.verificationStatus) updateData.verificationStatus = dto.verificationStatus;
    if (dto.policyStrikes !== undefined) updateData.policyStrikes = dto.policyStrikes;
    if (dto.verificationNotes) updateData.verificationNotes = dto.verificationNotes;

    const updatedProfile = await this.prisma.creatorProfile.update({
      where: { userId: id },
      data: updateData,
      include: { user: true },
    });

    return this.formatCreatorResponse({ ...updatedProfile.user, creatorProfile: updatedProfile });
  }

  async addStrike(id: string, reason: string, adminId: string) {
    const creator = await this.prisma.user.findUnique({
      where: { id },
      include: { creatorProfile: true },
    });

    if (!creator || !creator.creatorProfile) {
      throw new NotFoundException('Creator not found');
    }

    const newStrikes = creator.creatorProfile.policyStrikes + 1;

    // Auto-suspend if 3+ strikes
    const newPayoutStatus = newStrikes >= 3 ? 'SUSPENDED' : creator.creatorProfile.payoutStatus;

    const [updatedProfile] = await Promise.all([
      this.prisma.creatorProfile.update({
        where: { userId: id },
        data: {
          policyStrikes: newStrikes,
          payoutStatus: newPayoutStatus,
        },
        include: { user: true },
      }),
      this.prisma.adminAction.create({
        data: {
          adminId,
          action: 'ADD_POLICY_STRIKE',
          targetType: 'USER',
          targetId: id,
          reason,
          metadata: { newStrikeCount: newStrikes },
        },
      }),
    ]);

    return this.formatCreatorResponse({ ...updatedProfile.user, creatorProfile: updatedProfile });
  }

  async suspendCreator(id: string, reason: string, adminId: string) {
    const creator = await this.prisma.user.findUnique({
      where: { id },
      include: { creatorProfile: true },
    });

    if (!creator || !creator.creatorProfile) {
      throw new NotFoundException('Creator not found');
    }

    const [updatedUser] = await Promise.all([
      this.prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          creatorProfile: {
            update: {
              payoutStatus: 'SUSPENDED',
            },
          },
        },
        include: { creatorProfile: true },
      }),
      this.prisma.adminAction.create({
        data: {
          adminId,
          action: 'SUSPEND_CREATOR',
          targetType: 'USER',
          targetId: id,
          reason,
        },
      }),
    ]);

    return this.formatCreatorResponse(updatedUser);
  }

  async reactivateCreator(id: string, adminId: string) {
    const creator = await this.prisma.user.findUnique({
      where: { id },
      include: { creatorProfile: true },
    });

    if (!creator || !creator.creatorProfile) {
      throw new NotFoundException('Creator not found');
    }

    const [updatedUser] = await Promise.all([
      this.prisma.user.update({
        where: { id },
        data: {
          isActive: true,
          creatorProfile: {
            update: {
              payoutStatus: 'ACTIVE',
            },
          },
        },
        include: { creatorProfile: true },
      }),
      this.prisma.adminAction.create({
        data: {
          adminId,
          action: 'REACTIVATE_CREATOR',
          targetType: 'USER',
          targetId: id,
        },
      }),
    ]);

    return this.formatCreatorResponse(updatedUser);
  }

  async getCreatorStats() {
    const [
      totalCreators,
      payoutOnHold,
      kycPending,
      kycFailed,
      highStrikes,
    ] = await Promise.all([
      this.prisma.creatorProfile.count(),
      this.prisma.creatorProfile.count({
        where: { payoutStatus: 'ON_HOLD' },
      }),
      this.prisma.creatorProfile.count({
        where: { verificationStatus: 'PENDING' },
      }),
      this.prisma.creatorProfile.count({
        where: { verificationStatus: 'REJECTED' },
      }),
      this.prisma.creatorProfile.count({
        where: { policyStrikes: { gte: 3 } },
      }),
    ]);

    return {
      totalCreators,
      payoutOnHold,
      kycPendingOrFailed: kycPending + kycFailed,
      highStrikes,
    };
  }

  private formatCreatorResponse(user: any) {
    const kycStatusMap: Record<string, string> = {
      PENDING: 'Pending',
      IN_PROGRESS: 'In Progress',
      VERIFIED: 'Verified',
      REJECTED: 'Failed',
      EXPIRED: 'Expired',
    };

    const payoutStatusMap: Record<string, string> = {
      ACTIVE: 'Active',
      ON_HOLD: 'On Hold',
      SUSPENDED: 'Suspended',
    };

    return {
      id: user.id,
      name: user.creatorProfile?.displayName ||
            `${user.creatorProfile?.firstName || ''} ${user.creatorProfile?.lastName || ''}`.trim() ||
            'Unknown',
      email: user.email,
      kycStatus: kycStatusMap[user.creatorProfile?.verificationStatus] || user.creatorProfile?.verificationStatus,
      payoutStatus: payoutStatusMap[user.creatorProfile?.payoutStatus] || user.creatorProfile?.payoutStatus,
      policyStrikes: user.creatorProfile?.policyStrikes ?? 0,
      lifetimeEarnings: user.creatorProfile?.totalEarnings ?? 0,
      lastLogin: user.lastLogin ? this.formatLastLogin(user.lastLogin) : 'Never',
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  private formatCreatorDetailResponse(user: any) {
    const base = this.formatCreatorResponse(user);
    return {
      ...base,
      profile: {
        displayName: user.creatorProfile?.displayName,
        bio: user.creatorProfile?.bio,
        profileImage: user.creatorProfile?.profileImage,
        coverImage: user.creatorProfile?.coverImage,
        firstName: user.creatorProfile?.firstName,
        lastName: user.creatorProfile?.lastName,
        dateOfBirth: user.creatorProfile?.dateOfBirth,
        country: user.creatorProfile?.country,
      },
      verification: {
        status: user.creatorProfile?.verificationStatus,
        verifiedAt: user.creatorProfile?.verifiedAt,
        notes: user.creatorProfile?.verificationNotes,
      },
      payout: {
        status: user.creatorProfile?.payoutStatus,
        paypalEmail: user.creatorProfile?.paypalEmail,
        stripeAccountId: user.creatorProfile?.stripeAccountId,
      },
      stats: {
        totalEarnings: user.creatorProfile?.totalEarnings ?? 0,
        totalViews: user.creatorProfile?.totalViews ?? 0,
        totalPurchases: user.creatorProfile?.totalPurchases ?? 0,
        contentCount: user.creatorProfile?.content?.length ?? 0,
      },
      recentContent: user.creatorProfile?.content?.map((c: any) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        createdAt: c.createdAt,
      })) ?? [],
      recentPayouts: user.creatorProfile?.payouts?.map((p: any) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        createdAt: p.createdAt,
      })) ?? [],
    };
  }

  private formatLastLogin(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }
}

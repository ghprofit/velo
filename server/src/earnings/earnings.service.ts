import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface BalanceResponse {
  lifetimeEarnings: number;
  pendingBalance: number;
  availableBalance: number;
  totalPayouts: number;
  currency: string;
  lockedBonus?: number;       // Waitlist bonus that's locked until 5 sales
  salesToUnlock?: number;     // Number of sales needed to unlock bonus
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'payout';
  amount: number;
  currency: string;
  status: string;
  date: Date;
  description: string;
  contentTitle?: string;
  buyerSessionId?: string;
  paymentMethod?: string;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedPayouts {
  payouts: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class EarningsService {
  constructor(private prisma: PrismaService) {}

  private async getCreatorProfile(userId: string) {
    const creatorProfile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creatorProfile) {
      throw new NotFoundException('Creator profile not found');
    }

    return creatorProfile;
  }

  async getBalance(userId: string): Promise<BalanceResponse> {
    const creatorProfile = await this.getCreatorProfile(userId);

    // Use totalEarnings from profile (correctly tracks 90%/85% of purchases)
    // This is maintained by Stripe webhook handlers when purchases are completed
    const lifetimeEarnings = creatorProfile.totalEarnings || 0;

    // Calculate pending balance (recent earnings within last 7 days)
    // Note: We approximate with 85% multiplier since we don't track per-purchase earnings
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pendingPurchasesAggregation = await this.prisma.purchase.aggregate({
      where: {
        content: {
          creatorId: creatorProfile.id,
        },
        status: 'COMPLETED',
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Apply 85% multiplier to approximate creator earnings (conservative estimate)
    const pendingBalance = (pendingPurchasesAggregation._sum.amount || 0) * 0.85;

    // Calculate total completed payouts
    const payoutsAggregation = await this.prisma.payout.aggregate({
      where: {
        creatorId: creatorProfile.id,
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    });

    const totalPayouts = payoutsAggregation._sum.amount || 0;

    // Calculate available balance
    let availableBalance = lifetimeEarnings - pendingBalance - totalPayouts;

    // Check if waitlist bonus is locked
    let lockedBonus = 0;
    let salesToUnlock = 0;

    if (creatorProfile.waitlistBonus > 0 && !creatorProfile.bonusWithdrawn) {
      if (creatorProfile.totalPurchases < 5) {
        // Bonus is locked - subtract from available balance
        lockedBonus = creatorProfile.waitlistBonus;
        salesToUnlock = 5 - creatorProfile.totalPurchases;
        availableBalance = Math.max(0, availableBalance - lockedBonus);
      }
    }

    return {
      lifetimeEarnings,
      pendingBalance,
      availableBalance: Math.max(0, availableBalance), // Ensure non-negative
      totalPayouts,
      currency: 'USD',
      lockedBonus: lockedBonus > 0 ? lockedBonus : undefined,
      salesToUnlock: salesToUnlock > 0 ? salesToUnlock : undefined,
    };
  }

  async getPayouts(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedPayouts> {
    const creatorProfile = await this.getCreatorProfile(userId);

    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.payout.count({
      where: {
        creatorId: creatorProfile.id,
      },
    });

    // Get paginated payouts
    const payouts = await this.prisma.payout.findMany({
      where: {
        creatorId: creatorProfile.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      payouts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getTransactions(
    userId: string,
    page: number = 1,
    limit: number = 10,
    type?: 'purchase' | 'payout',
    search?: string,
  ): Promise<PaginatedTransactions> {
    const creatorProfile = await this.getCreatorProfile(userId);

    // Fetch purchases if type is not 'payout'
    const purchases =
      type !== 'payout'
        ? await this.prisma.purchase.findMany({
            where: {
              content: {
                creatorId: creatorProfile.id,
                ...(search && {
                  title: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                }),
              },
              status: 'COMPLETED',
            },
            include: {
              content: {
                select: {
                  title: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          })
        : [];

    // Fetch payouts if type is not 'purchase'
    const payouts =
      type !== 'purchase'
        ? await this.prisma.payout.findMany({
            where: {
              creatorId: creatorProfile.id,
            },
            orderBy: {
              createdAt: 'desc',
            },
          })
        : [];

    // Transform to unified transaction format
    const purchaseTransactions: Transaction[] = purchases.map((purchase) => ({
      id: purchase.id,
      type: 'purchase' as const,
      amount: purchase.amount,
      currency: purchase.currency,
      status: purchase.status,
      date: purchase.createdAt,
      description: `Purchase of "${purchase.content.title}"`,
      contentTitle: purchase.content.title,
      buyerSessionId: purchase.buyerSessionId,
    }));

    const payoutTransactions: Transaction[] = payouts.map((payout) => ({
      id: payout.id,
      type: 'payout' as const,
      amount: payout.amount,
      currency: payout.currency,
      status: payout.status,
      date: payout.createdAt,
      description: `Payout via ${payout.paymentMethod}`,
      paymentMethod: payout.paymentMethod,
    }));

    // Combine and sort all transactions by date
    let allTransactions = [...purchaseTransactions, ...payoutTransactions].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );

    // Apply search filter if provided
    if (search) {
      allTransactions = allTransactions.filter(
        (transaction) =>
          transaction.description
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          transaction.contentTitle?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Calculate pagination
    const total = allTransactions.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Apply pagination
    const paginatedTransactions = allTransactions.slice(skip, skip + limit);

    return {
      transactions: paginatedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}

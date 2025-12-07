import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface BalanceResponse {
  lifetimeEarnings: number;
  pendingBalance: number;
  availableBalance: number;
  totalPayouts: number;
  currency: string;
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

    // Calculate lifetime earnings from completed purchases
    const purchasesAggregation = await this.prisma.purchase.aggregate({
      where: {
        content: {
          creatorId: creatorProfile.id,
        },
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    });

    const lifetimeEarnings = purchasesAggregation._sum.amount || 0;

    // Calculate pending balance (purchases within last 7 days)
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

    const pendingBalance = pendingPurchasesAggregation._sum.amount || 0;

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
    const availableBalance = lifetimeEarnings - pendingBalance - totalPayouts;

    return {
      lifetimeEarnings,
      pendingBalance,
      availableBalance: Math.max(0, availableBalance), // Ensure non-negative
      totalPayouts,
      currency: 'USD',
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

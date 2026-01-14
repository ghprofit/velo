import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import {
  QueryPaymentsDto,
  QueryPayoutsDto,
  PaymentStatsDto,
  RevenueChartDto,
} from './dto/payments.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getPaymentStats(): Promise<PaymentStatsDto> {
    // Get total revenue from completed purchases
    const completedPurchases = await this.prisma.purchase.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
      _count: true,
    });

    // Get total payouts
    const completedPayouts = await this.prisma.payout.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    });

    // Get pending payouts
    const pendingPayouts = await this.prisma.payout.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true },
    });

    // Get failed transactions count
    const failedTransactions = await this.prisma.purchase.count({
      where: { status: 'FAILED' },
    });

    return {
      totalRevenue: completedPurchases._sum.amount || 0,
      totalPayouts: completedPayouts._sum.amount || 0,
      pendingPayouts: pendingPayouts._sum.amount || 0,
      failedTransactions,
    };
  }

  async getTransactions(query: QueryPaymentsDto) {
    const { search, status, paymentMethod, startDate, endDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { transactionId: { contains: search, mode: 'insensitive' } },
        {
          content: {
            creator: {
              displayName: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (paymentMethod) {
      where.paymentProvider = paymentMethod;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          content: {
            include: {
              creator: {
                select: {
                  displayName: true,
                  user: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
          },
          buyerSession: {
            select: {
              email: true,
              fingerprint: true,
            },
          },
        },
      }),
      this.prisma.purchase.count({ where }),
    ]);

    return {
      success: true,
      data: transactions.map((t) => ({
        id: t.id,
        transactionId: t.transactionId,
        creator: t.content.creator.displayName,
        creatorEmail: t.content.creator.user.email,
        buyer: t.buyerSession.email || 'Anonymous',
        contentTitle: t.content.title,
        amount: t.amount,
        currency: t.currency,
        paymentMethod: t.paymentProvider,
        status: t.status,
        createdAt: t.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionById(id: string) {
    const transaction = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        content: {
          include: {
            creator: {
              select: {
                id: true,
                displayName: true,
                profileImage: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
        buyerSession: true,
      },
    });

    if (!transaction) {
      return {
        success: false,
        message: 'Transaction not found',
      };
    }

    return {
      success: true,
      data: {
        id: transaction.id,
        transactionId: transaction.transactionId,
        paymentIntentId: transaction.paymentIntentId,
        creator: {
          id: transaction.content.creator.id,
          name: transaction.content.creator.displayName,
          email: transaction.content.creator.user.email,
          profileImage: transaction.content.creator.profileImage,
        },
        buyer: {
          email: transaction.buyerSession.email,
          sessionId: transaction.buyerSession.id,
          fingerprint: transaction.buyerSession.fingerprint,
          ipAddress: transaction.buyerSession.ipAddress,
        },
        content: {
          id: transaction.content.id,
          title: transaction.content.title,
          thumbnailUrl: transaction.content.thumbnailUrl,
        },
        amount: transaction.amount,
        currency: transaction.currency,
        paymentProvider: transaction.paymentProvider,
        status: transaction.status,
        accessToken: transaction.accessToken,
        viewCount: transaction.viewCount,
        lastViewedAt: transaction.lastViewedAt,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
    };
  }

  async getPayouts(query: QueryPayoutsDto) {
    const { search, status, startDate, endDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        {
          creator: {
            displayName: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [payouts, total] = await Promise.all([
      this.prisma.payout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              displayName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.payout.count({ where }),
    ]);

    return {
      success: true,
      data: payouts.map((p) => ({
        id: p.id,
        creatorName: p.creator.displayName,
        creatorEmail: p.creator.user.email,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paymentMethod: p.paymentMethod,
        paymentId: p.paymentId,
        processedAt: p.processedAt,
        notes: p.notes,
        createdAt: p.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async processPayout(payoutId: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId },
      include: {
        creator: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!payout) {
      return {
        success: false,
        message: 'Payout not found',
      };
    }

    if (payout.status !== 'PENDING') {
      return {
        success: false,
        message: `Cannot process payout with status: ${payout.status}`,
      };
    }

    // Update payout status to PROCESSING and mark waitlist bonus as withdrawn if applicable
    const updatedPayout = await this.prisma.$transaction(async (tx) => {
      // If creator has waitlist bonus and hasn't withdrawn it yet, and has 5+ sales
      if (
        payout.creator.waitlistBonus > 0 &&
        !payout.creator.bonusWithdrawn &&
        payout.creator.totalPurchases >= 5
      ) {
        // Mark bonus as withdrawn
        await tx.creatorProfile.update({
          where: { id: payout.creator.id },
          data: { bonusWithdrawn: true },
        });
      }

      // Update payout status
      return tx.payout.update({
        where: { id: payoutId },
        data: {
          status: 'PROCESSING',
        },
      });
    });

    // Send payout processing email
    try {
      await this.emailService.sendPayoutProcessed(
        payout.creator.user.email,
        {
          creator_name: payout.creator.displayName,
          amount: payout.amount.toFixed(2),
          payout_date: new Date().toLocaleDateString(),
          transaction_id: payout.id,
        },
      );
    } catch (error) {
      console.error('Failed to send payout email:', error);
    }

    // In a real application, you would integrate with payment processors here
    // For now, we'll just mark it as processing

    return {
      success: true,
      message: 'Payout is being processed',
      data: updatedPayout,
    };
  }

  async getRevenueChart(period: 'weekly' | 'monthly' | 'yearly'): Promise<RevenueChartDto[]> {
    const now = new Date();
    let startDate: Date;
    let groupBy: string;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case 'yearly':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupBy = 'month';
        break;
    }

    const purchases = await this.prisma.purchase.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Group by period
    const grouped: { [key: string]: { revenue: number; count: number } } = {};

    purchases.forEach((purchase) => {
      const key: string = groupBy === 'day'
        ? (purchase.createdAt.toISOString().split('T')[0] || '')
        : `${purchase.createdAt.getFullYear()}-${String(purchase.createdAt.getMonth() + 1).padStart(2, '0')}`;

      if (!grouped[key]) {
        grouped[key] = { revenue: 0, count: 0 };
      }

      grouped[key]!.revenue += purchase.amount;
      grouped[key]!.count += 1;
    });

    return Object.entries(grouped)
      .map(([period, data]) => ({
        period,
        revenue: data.revenue,
        count: data.count,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Get payout requests with filters
   */
  async getPayoutRequests(query: {
    status?: string;
    creatorId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query.creatorId) {
      where.creatorId = query.creatorId;
    }

    const [requests, total] = await Promise.all([
      this.prisma.payoutRequest.findMany({
        where,
        include: {
          creator: {
            include: {
              user: {
                select: {
                  email: true,
                  displayName: true,
                },
              },
            },
          },
          payout: true, // Include linked payout if exists
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payoutRequest.count({ where }),
    ]);

    return {
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get payout request details
   */
  async getPayoutRequestDetails(requestId: string) {
    const request = await this.prisma.payoutRequest.findUnique({
      where: { id: requestId },
      include: {
        creator: {
          include: {
            user: {
              select: {
                email: true,
                displayName: true,
              },
            },
          },
        },
        payout: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Payout request not found');
    }

    return {
      success: true,
      data: request,
    };
  }

  /**
   * Approve payout request - creates Payout for Stripe processing
   */
  async approvePayoutRequest(
    requestId: string,
    adminUserId: string,
    reviewNotes?: string,
  ) {
    const request = await this.prisma.payoutRequest.findUnique({
      where: { id: requestId },
      include: {
        creator: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Payout request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot approve payout request with status: ${request.status}`,
      );
    }

    // Validate creator still has sufficient balance
    if (request.creator.totalEarnings < request.requestedAmount) {
      throw new BadRequestException(
        'Creator no longer has sufficient balance',
      );
    }

    // Create transaction: Update PayoutRequest + Create Payout
    const result = await this.prisma.$transaction(async (tx) => {
      // Update payout request
      const updatedRequest = await tx.payoutRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
          reviewNotes: reviewNotes || 'Approved for processing',
        },
      });

      // Create Payout object for Stripe processing
      const payout = await tx.payout.create({
        data: {
          creatorId: request.creatorId,
          amount: request.requestedAmount,
          currency: request.currency,
          status: 'PENDING', // Will be processed by Stripe
          paymentMethod: 'STRIPE',
          notes: `Approved by admin - Request ID: ${requestId}`,
        },
      });

      // Link payout to request
      await tx.payoutRequest.update({
        where: { id: requestId },
        data: { payoutId: payout.id },
      });

      return { request: updatedRequest, payout };
    });

    // Notify creator
    await this.notificationsService.createNotification({
      userId: request.creator.userId,
      type: NotificationType.PAYOUT_APPROVED,
      title: 'Payout Request Approved',
      message: `Your payout request for $${request.requestedAmount.toFixed(2)} has been approved and will be processed shortly.`,
      metadata: {
        requestId: requestId,
        payoutId: result.payout.id,
        amount: request.requestedAmount,
      },
    });

    // Send email
    await this.emailService.sendPayoutApproved(request.creator.user.email, {
      creator_name: request.creator.displayName,
      amount: `$${request.requestedAmount.toFixed(2)}`,
      request_id: requestId,
    });

    return {
      success: true,
      message: 'Payout request approved',
      data: result,
    };
  }

  /**
   * Reject payout request
   */
  async rejectPayoutRequest(
    requestId: string,
    adminUserId: string,
    reviewNotes: string,
  ) {
    const request = await this.prisma.payoutRequest.findUnique({
      where: { id: requestId },
      include: {
        creator: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Payout request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot reject payout request with status: ${request.status}`,
      );
    }

    // Update payout request
    const updatedRequest = await this.prisma.payoutRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes,
      },
    });

    // Notify creator
    await this.notificationsService.createNotification({
      userId: request.creator.userId,
      type: NotificationType.PAYOUT_REJECTED,
      title: 'Payout Request Rejected',
      message: `Your payout request for $${request.requestedAmount.toFixed(2)} has been rejected. Reason: ${reviewNotes}`,
      metadata: {
        requestId: requestId,
        amount: request.requestedAmount,
        reason: reviewNotes,
      },
    });

    // Send email
    await this.emailService.sendPayoutRejected(request.creator.user.email, {
      creator_name: request.creator.displayName,
      amount: `$${request.requestedAmount.toFixed(2)}`,
      reason: reviewNotes,
    });

    return {
      success: true,
      message: 'Payout request rejected',
      data: updatedRequest,
    };
  }
}

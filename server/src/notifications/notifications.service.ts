import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Category mapping from UI to database types
  private mapCategoryToTypes(category?: string): string[] | undefined {
    if (!category) return undefined;

    const mapping: Record<string, string[]> = {
      'Earnings': ['PURCHASE_MADE', 'PAYOUT_SENT'],
      'Uploads': ['CONTENT_APPROVED', 'CONTENT_REJECTED', 'UPLOAD_SUCCESSFUL', 'CONTENT_UNDER_REVIEW'],
      'Platform Updates': ['PLATFORM_UPDATE', 'NEW_FEATURE'],
      'Warnings / Policy': ['CONTENT_FLAGGED', 'POLICY_WARNING'],
      'Support': ['SUPPORT_TICKET_RESOLVED', 'SUPPORT_REPLY'],
    };

    return mapping[category];
  }

  async getNotifications(userId: string, category?: string) {
    const types = this.mapCategoryToTypes(category);

    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        ...(types && { type: { in: types } }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications;
  }

  async getStats(userId: string) {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get unread count
    const unreadCount = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    // Get recent unread (since yesterday)
    const recentUnread = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
        createdAt: {
          gte: yesterday,
        },
      },
    });

    // Get reports awaiting action (content flagged or policy warnings)
    const reportsAwaiting = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
        type: {
          in: ['CONTENT_FLAGGED', 'POLICY_WARNING'],
        },
      },
    });

    // Get payment alerts (payout notifications)
    const paymentAlerts = await this.prisma.notification.count({
      where: {
        userId,
        type: 'PAYOUT_SENT',
      },
    });

    // Get system updates
    const systemUpdates = await this.prisma.notification.count({
      where: {
        userId,
        type: {
          in: ['PLATFORM_UPDATE', 'NEW_FEATURE'],
        },
      },
    });

    return {
      unreadCount,
      recentUnread,
      reportsAwaiting,
      paymentAlerts,
      systemUpdates,
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return this.prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });
  }

  async clearAllRead(userId: string) {
    return this.prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });
  }
}

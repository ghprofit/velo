import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, NotificationType } from './dto/create-notification.dto';
import { BroadcastNotificationDto, SendToMultipleUsersDto, TargetRole } from './dto/broadcast-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Category mapping from UI to database types
  private mapCategoryToTypes(category?: string): string[] | undefined {
    if (!category) return undefined;

    const mapping: Record<string, string[]> = {
      'Earnings': ['PURCHASE_MADE', 'PAYOUT_SENT', 'PAYOUT_FAILED'],
      'Uploads': ['CONTENT_APPROVED', 'CONTENT_REJECTED', 'UPLOAD_SUCCESSFUL', 'CONTENT_UNDER_REVIEW'],
      'Platform Updates': ['PLATFORM_UPDATE', 'NEW_FEATURE', 'SYSTEM_MAINTENANCE', 'ANNOUNCEMENT'],
      'Warnings / Policy': ['CONTENT_FLAGGED', 'POLICY_WARNING', 'POLICY_UPDATE'],
      'Support': ['SUPPORT_TICKET_CREATED', 'SUPPORT_TICKET_RESOLVED', 'SUPPORT_REPLY'],
      'Verification': ['VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'VERIFICATION_PENDING'],
      'Admin': ['NEW_CREATOR_SIGNUP', 'CONTENT_PENDING_REVIEW', 'PAYOUT_REQUEST', 'FLAGGED_CONTENT_ALERT'],
    };

    return mapping[category];
  }

  // ============ USER METHODS ============

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
        type: {
          in: ['PAYOUT_SENT', 'PAYOUT_FAILED', 'PURCHASE_MADE'],
        },
      },
    });

    // Get system updates
    const systemUpdates = await this.prisma.notification.count({
      where: {
        userId,
        type: {
          in: ['PLATFORM_UPDATE', 'NEW_FEATURE', 'SYSTEM_MAINTENANCE', 'ANNOUNCEMENT'],
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
      throw new NotFoundException('Notification not found');
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
      throw new NotFoundException('Notification not found');
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

  // ============ ADMIN METHODS ============

  /**
   * Create a notification for a specific user
   */
  async createNotification(dto: CreateNotificationDto) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        metadata: dto.metadata || {},
      },
    });
  }

  /**
   * Create notifications for multiple specific users
   */
  async sendToMultipleUsers(dto: SendToMultipleUsersDto) {
    // Verify all users exist
    const users = await this.prisma.user.findMany({
      where: { id: { in: dto.userIds } },
      select: { id: true },
    });

    const foundUserIds = users.map(u => u.id);
    const notFoundUserIds = dto.userIds.filter(id => !foundUserIds.includes(id));

    if (notFoundUserIds.length > 0) {
      throw new BadRequestException(`Users not found: ${notFoundUserIds.join(', ')}`);
    }

    // Create notifications for all users
    const notifications = await this.prisma.notification.createMany({
      data: dto.userIds.map(userId => ({
        userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        metadata: dto.metadata || {},
      })),
    });

    return {
      count: notifications.count,
      userIds: dto.userIds,
    };
  }

  /**
   * Broadcast notification to all users with specific roles
   */
  async broadcastNotification(dto: BroadcastNotificationDto) {
    // Build role filter
    let roleFilter: any = {};

    if (dto.targetRoles.includes(TargetRole.ALL)) {
      // No role filter needed - send to all
      roleFilter = {};
    } else {
      roleFilter = {
        role: {
          in: dto.targetRoles,
        },
      };
    }

    // Get all users matching the role filter
    const users = await this.prisma.user.findMany({
      where: {
        ...roleFilter,
        isActive: true, // Only active users
      },
      select: { id: true },
    });

    if (users.length === 0) {
      throw new BadRequestException('No users found matching the target roles');
    }

    // Create notifications for all matching users
    const notifications = await this.prisma.notification.createMany({
      data: users.map(user => ({
        userId: user.id,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        metadata: dto.metadata || {},
      })),
    });

    return {
      count: notifications.count,
      targetRoles: dto.targetRoles,
      recipientCount: users.length,
    };
  }

  /**
   * Get all notifications with pagination and filters (admin view)
   */
  async getAllNotifications(options: {
    page?: number;
    limit?: number;
    type?: string;
    userId?: string;
    isRead?: boolean;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { page = 1, limit = 20, type, userId, isRead, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (userId) {
      where.userId = userId;
    }

    if (typeof isRead === 'boolean') {
      where.isRead = isRead;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get admin dashboard notification stats
   */
  async getAdminStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalNotifications,
      todayCount,
      weekCount,
      monthCount,
      unreadCount,
      byTypeRaw,
    ] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.notification.count({
        where: { createdAt: { gte: thisWeek } },
      }),
      this.prisma.notification.count({
        where: { createdAt: { gte: thisMonth } },
      }),
      this.prisma.notification.count({
        where: { isRead: false },
      }),
      this.prisma.notification.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
    ]);

    const byType = byTypeRaw.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalNotifications,
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      unread: unreadCount,
      byType,
    };
  }

  /**
   * Delete a notification by ID (admin)
   */
  async adminDeleteNotification(notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Bulk delete notifications (admin)
   */
  async bulkDeleteNotifications(notificationIds: string[]) {
    const result = await this.prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
      },
    });

    return {
      deletedCount: result.count,
    };
  }

  /**
   * Delete all notifications for a specific user (admin)
   */
  async deleteUserNotifications(userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: { userId },
    });

    return {
      deletedCount: result.count,
    };
  }

  // ============ HELPER METHODS (for other services) ============

  /**
   * Quick method to create a notification (used by other services)
   */
  async notify(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: metadata || {},
      },
    });
  }

  /**
   * Notify all admins about an event
   */
  async notifyAdmins(
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>,
  ) {
    const admins = await this.prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        isActive: true,
      },
      select: { id: true },
    });

    if (admins.length === 0) return { count: 0 };

    const result = await this.prisma.notification.createMany({
      data: admins.map(admin => ({
        userId: admin.id,
        type,
        title,
        message,
        metadata: metadata || {},
      })),
    });

    return { count: result.count };
  }

  /**
   * Notify all creators about an event
   */
  async notifyCreators(
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>,
  ) {
    const creators = await this.prisma.user.findMany({
      where: {
        role: 'CREATOR',
        isActive: true,
      },
      select: { id: true },
    });

    if (creators.length === 0) return { count: 0 };

    const result = await this.prisma.notification.createMany({
      data: creators.map(creator => ({
        userId: creator.id,
        type,
        title,
        message,
        metadata: metadata || {},
      })),
    });

    return { count: result.count };
  }
}

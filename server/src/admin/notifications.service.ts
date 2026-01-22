import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  QueryNotificationsDto,
  CreateNotificationDto,
  BroadcastNotificationDto,
  NotificationStatsDto,
} from './dto/notifications.dto';

@Injectable()
export class AdminNotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotificationStats(): Promise<NotificationStatsDto> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalNotifications, unreadNotifications, notificationsByType, recentNotifications] =
      await Promise.all([
        this.prisma.notification.count(),
        this.prisma.notification.count({ where: { isRead: false } }),
        this.prisma.notification.groupBy({
          by: ['type'],
          _count: { type: true },
          orderBy: { _count: { type: 'desc' } },
          take: 10,
        }),
        this.prisma.notification.count({
          where: { createdAt: { gte: last24Hours } },
        }),
      ]);

    // Convert byType array to object format as expected by client
    const byType = notificationsByType.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalNotifications,
      unread: unreadNotifications,
      byType,
      recent: recentNotifications,
    };
  }

  async getAllNotifications(query: QueryNotificationsDto) {
    const { search, type, isRead, userId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (typeof isRead === 'boolean') {
      where.isRead = isRead;
    }

    if (userId) {
      where.userId = userId;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      success: true,
      data: notifications.map((notification) => ({
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        metadata: notification.metadata,
        createdAt: notification.createdAt,
        user: notification.user ? {
          id: notification.user.id,
          email: notification.user.email,
          role: notification.user.role,
        } : undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getNotificationById(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!notification) {
      return {
        success: false,
        message: 'Notification not found',
      };
    }

    return {
      success: true,
      data: {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        metadata: notification.metadata,
        createdAt: notification.createdAt,
        user: notification.user ? {
          id: notification.user.id,
          email: notification.user.email,
          role: notification.user.role,
        } : undefined,
      },
    };
  }

  async createNotification(createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: createNotificationDto.userId,
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        metadata: createNotificationDto.metadata,
      },
    });

    return {
      success: true,
      message: 'Notification created successfully',
      data: notification,
    };
  }

  async broadcastNotification(broadcastDto: BroadcastNotificationDto) {
    // Find users based on role filter
    const where: any = {};
    if (broadcastDto.userRole) {
      where.role = broadcastDto.userRole;
    }

    const users = await this.prisma.user.findMany({
      where,
      select: { id: true },
    });

    if (users.length === 0) {
      return {
        success: false,
        message: 'No users found matching the criteria',
      };
    }

    // Create notifications for all matching users
    const notifications = await this.prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type: broadcastDto.type,
        title: broadcastDto.title,
        message: broadcastDto.message,
        metadata: broadcastDto.metadata,
      })),
    });

    return {
      success: true,
      message: `Broadcast sent to ${notifications.count} users`,
      data: { count: notifications.count },
    };
  }

  async markAsRead(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return {
        success: false,
        message: 'Notification not found',
      };
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return {
      success: true,
      message: 'Notification marked as read',
      data: updatedNotification,
    };
  }

  async markAllAsRead(userId?: string) {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const result = await this.prisma.notification.updateMany({
      where: {
        ...where,
        isRead: false,
      },
      data: { isRead: true },
    });

    return {
      success: true,
      message: `Marked ${result.count} notifications as read`,
      data: { count: result.count },
    };
  }

  async deleteNotification(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return {
        success: false,
        message: 'Notification not found',
      };
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Notification deleted successfully',
    };
  }

  async deleteAllNotifications(userId?: string) {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const result = await this.prisma.notification.deleteMany({
      where,
    });

    return {
      success: true,
      message: `Deleted ${result.count} notifications`,
      data: { count: result.count },
    };
  }
}

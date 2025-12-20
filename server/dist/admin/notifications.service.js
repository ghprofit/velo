"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getNotificationStats() {
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const [totalNotifications, unreadNotifications, notificationsByType, recentNotifications] = await Promise.all([
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
        return {
            totalNotifications,
            unreadNotifications,
            notificationsByType: notificationsByType.map((item) => ({
                type: item.type,
                count: item._count.type,
            })),
            recentNotifications,
        };
    }
    async getAllNotifications(query) {
        const { search, type, isRead, userId, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const where = {};
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
                userEmail: notification.user.email,
                userRole: notification.user.role,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                isRead: notification.isRead,
                metadata: notification.metadata,
                createdAt: notification.createdAt,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getNotificationById(id) {
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
                userEmail: notification.user.email,
                userRole: notification.user.role,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                isRead: notification.isRead,
                metadata: notification.metadata,
                createdAt: notification.createdAt,
            },
        };
    }
    async createNotification(createNotificationDto) {
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
    async broadcastNotification(broadcastDto) {
        const where = {};
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
    async markAsRead(id) {
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
    async markAllAsRead(userId) {
        const where = {};
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
    async deleteNotification(id) {
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
    async deleteAllNotifications(userId) {
        const where = {};
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
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map
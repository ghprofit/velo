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
const broadcast_notification_dto_1 = require("./dto/broadcast-notification.dto");
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapCategoryToTypes(category) {
        if (!category)
            return undefined;
        const mapping = {
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
    async getNotifications(userId, category) {
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
    async getStats(userId) {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const unreadCount = await this.prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
        const recentUnread = await this.prisma.notification.count({
            where: {
                userId,
                isRead: false,
                createdAt: {
                    gte: yesterday,
                },
            },
        });
        const reportsAwaiting = await this.prisma.notification.count({
            where: {
                userId,
                isRead: false,
                type: {
                    in: ['CONTENT_FLAGGED', 'POLICY_WARNING'],
                },
            },
        });
        const paymentAlerts = await this.prisma.notification.count({
            where: {
                userId,
                type: {
                    in: ['PAYOUT_SENT', 'PAYOUT_FAILED', 'PURCHASE_MADE'],
                },
            },
        });
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
    async markAsRead(userId, notificationId) {
        const notification = await this.prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId,
            },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
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
    async markAllAsRead(userId) {
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
    async deleteNotification(userId, notificationId) {
        const notification = await this.prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId,
            },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return this.prisma.notification.delete({
            where: {
                id: notificationId,
            },
        });
    }
    async clearAllRead(userId) {
        return this.prisma.notification.deleteMany({
            where: {
                userId,
                isRead: true,
            },
        });
    }
    async createNotification(dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
    async sendToMultipleUsers(dto) {
        const users = await this.prisma.user.findMany({
            where: { id: { in: dto.userIds } },
            select: { id: true },
        });
        const foundUserIds = users.map(u => u.id);
        const notFoundUserIds = dto.userIds.filter(id => !foundUserIds.includes(id));
        if (notFoundUserIds.length > 0) {
            throw new common_1.BadRequestException(`Users not found: ${notFoundUserIds.join(', ')}`);
        }
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
    async broadcastNotification(dto) {
        let roleFilter = {};
        if (dto.targetRoles.includes(broadcast_notification_dto_1.TargetRole.ALL)) {
            roleFilter = {};
        }
        else {
            roleFilter = {
                role: {
                    in: dto.targetRoles,
                },
            };
        }
        const users = await this.prisma.user.findMany({
            where: {
                ...roleFilter,
                isActive: true,
            },
            select: { id: true },
        });
        if (users.length === 0) {
            throw new common_1.BadRequestException('No users found matching the target roles');
        }
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
    async getAllNotifications(options) {
        const { page = 1, limit = 20, type, userId, isRead, startDate, endDate } = options;
        const skip = (page - 1) * limit;
        const where = {};
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
    async getAdminStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalNotifications, todayCount, weekCount, monthCount, unreadCount, byTypeRaw,] = await Promise.all([
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
        }, {});
        return {
            total: totalNotifications,
            today: todayCount,
            thisWeek: weekCount,
            thisMonth: monthCount,
            unread: unreadCount,
            byType,
        };
    }
    async adminDeleteNotification(notificationId) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return this.prisma.notification.delete({
            where: { id: notificationId },
        });
    }
    async bulkDeleteNotifications(notificationIds) {
        const result = await this.prisma.notification.deleteMany({
            where: {
                id: { in: notificationIds },
            },
        });
        return {
            deletedCount: result.count,
        };
    }
    async deleteUserNotifications(userId) {
        const result = await this.prisma.notification.deleteMany({
            where: { userId },
        });
        return {
            deletedCount: result.count,
        };
    }
    async notify(userId, type, title, message, metadata) {
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
    async notifyAdmins(type, title, message, metadata) {
        const admins = await this.prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'SUPER_ADMIN'] },
                isActive: true,
            },
            select: { id: true },
        });
        if (admins.length === 0)
            return { count: 0 };
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
    async notifyCreators(type, title, message, metadata) {
        const creators = await this.prisma.user.findMany({
            where: {
                role: 'CREATOR',
                isActive: true,
            },
            select: { id: true },
        });
        if (creators.length === 0)
            return { count: 0 };
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
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map
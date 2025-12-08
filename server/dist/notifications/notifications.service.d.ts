import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, NotificationType } from './dto/create-notification.dto';
import { BroadcastNotificationDto, SendToMultipleUsersDto, TargetRole } from './dto/broadcast-notification.dto';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    private mapCategoryToTypes;
    getNotifications(userId: string, category?: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        message: string;
        userId: string;
        title: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isRead: boolean;
    }[]>;
    getStats(userId: string): Promise<{
        unreadCount: number;
        recentUnread: number;
        reportsAwaiting: number;
        paymentAlerts: number;
        systemUpdates: number;
    }>;
    markAsRead(userId: string, notificationId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        message: string;
        userId: string;
        title: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isRead: boolean;
    }>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    deleteNotification(userId: string, notificationId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        message: string;
        userId: string;
        title: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isRead: boolean;
    }>;
    clearAllRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createNotification(dto: CreateNotificationDto): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        message: string;
        userId: string;
        title: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isRead: boolean;
    }>;
    sendToMultipleUsers(dto: SendToMultipleUsersDto): Promise<{
        count: number;
        userIds: string[];
    }>;
    broadcastNotification(dto: BroadcastNotificationDto): Promise<{
        count: number;
        targetRoles: TargetRole[];
        recipientCount: number;
    }>;
    getAllNotifications(options: {
        page?: number;
        limit?: number;
        type?: string;
        userId?: string;
        isRead?: boolean;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                displayName: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            type: string;
            message: string;
            userId: string;
            title: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            isRead: boolean;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAdminStats(): Promise<{
        total: number;
        today: number;
        thisWeek: number;
        thisMonth: number;
        unread: number;
        byType: Record<string, number>;
    }>;
    adminDeleteNotification(notificationId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        message: string;
        userId: string;
        title: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isRead: boolean;
    }>;
    bulkDeleteNotifications(notificationIds: string[]): Promise<{
        deletedCount: number;
    }>;
    deleteUserNotifications(userId: string): Promise<{
        deletedCount: number;
    }>;
    notify(userId: string, type: NotificationType, title: string, message: string, metadata?: Record<string, any>): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        message: string;
        userId: string;
        title: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isRead: boolean;
    }>;
    notifyAdmins(type: NotificationType, title: string, message: string, metadata?: Record<string, any>): Promise<{
        count: number;
    }>;
    notifyCreators(type: NotificationType, title: string, message: string, metadata?: Record<string, any>): Promise<{
        count: number;
    }>;
}
//# sourceMappingURL=notifications.service.d.ts.map
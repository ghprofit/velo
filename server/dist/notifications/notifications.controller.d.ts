import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { BroadcastNotificationDto, SendToMultipleUsersDto } from './dto/broadcast-notification.dto';
interface AuthenticatedRequest {
    user: {
        id: string;
        email: string;
        role: string;
    };
}
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: AuthenticatedRequest, category?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            type: string;
            title: string;
            message: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            isRead: boolean;
        }[];
    }>;
    getStats(req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            unreadCount: number;
            recentUnread: number;
            reportsAwaiting: number;
            paymentAlerts: number;
            systemUpdates: number;
        };
    }>;
    markAsRead(req: AuthenticatedRequest, id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            type: string;
            title: string;
            message: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            isRead: boolean;
        };
    }>;
    markAllAsRead(req: AuthenticatedRequest): Promise<{
        success: boolean;
        message: string;
    }>;
    clearAllRead(req: AuthenticatedRequest): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteNotification(req: AuthenticatedRequest, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllNotifications(page: number, limit: number, type?: string, userId?: string, isRead?: string, startDate?: string, endDate?: string): Promise<{
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
            userId: string;
            type: string;
            title: string;
            message: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            isRead: boolean;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        success: boolean;
    }>;
    getAdminStats(): Promise<{
        success: boolean;
        data: {
            total: number;
            today: number;
            thisWeek: number;
            thisMonth: number;
            unread: number;
            byType: Record<string, number>;
        };
    }>;
    createNotification(dto: CreateNotificationDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            type: string;
            title: string;
            message: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            isRead: boolean;
        };
        message: string;
    }>;
    sendToMultipleUsers(dto: SendToMultipleUsersDto): Promise<{
        success: boolean;
        data: {
            count: number;
            userIds: string[];
        };
        message: string;
    }>;
    broadcastNotification(dto: BroadcastNotificationDto): Promise<{
        success: boolean;
        data: {
            count: number;
            targetRoles: import("./dto/broadcast-notification.dto").TargetRole[];
            recipientCount: number;
        };
        message: string;
    }>;
    adminDeleteNotification(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    bulkDeleteNotifications(ids: string[]): Promise<{
        success: boolean;
        data: {
            deletedCount: number;
        };
        message: string;
    }>;
    deleteUserNotifications(userId: string): Promise<{
        success: boolean;
        data: {
            deletedCount: number;
        };
        message: string;
    }>;
    getUserNotifications(userId: string, category?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            type: string;
            title: string;
            message: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            isRead: boolean;
        }[];
    }>;
    getNotificationTypes(): Promise<{
        success: boolean;
        data: {
            notificationTypes: import("./dto/create-notification.dto").NotificationType[];
            targetRoles: import("./dto/broadcast-notification.dto").TargetRole[];
        };
    }>;
}
export {};
//# sourceMappingURL=notifications.controller.d.ts.map
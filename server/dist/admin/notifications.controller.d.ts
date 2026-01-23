import { AdminNotificationsService } from './notifications.service';
import { QueryNotificationsDto, CreateNotificationDto, BroadcastNotificationDto } from './dto/notifications.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: AdminNotificationsService);
    getNotificationStats(): Promise<import("./dto/notifications.dto").NotificationStatsDto>;
    getAllNotifications(query: QueryNotificationsDto): Promise<{
        success: boolean;
        data: {
            id: string;
            userId: string;
            type: string;
            title: string;
            message: string;
            isRead: boolean;
            metadata: import("@prisma/client/runtime/client").JsonValue;
            createdAt: Date;
            user: {
                id: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
            } | undefined;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getNotificationById(id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            userId: string;
            type: string;
            title: string;
            message: string;
            isRead: boolean;
            metadata: import("@prisma/client/runtime/client").JsonValue;
            createdAt: Date;
            user: {
                id: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
            } | undefined;
        };
        message?: undefined;
    }>;
    createNotification(createNotificationDto: CreateNotificationDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            message: string;
            userId: string;
            title: string;
            type: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            isRead: boolean;
        };
    }>;
    broadcastNotification(broadcastDto: BroadcastNotificationDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            count: number;
        };
    }>;
    markAsRead(id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            message: string;
            userId: string;
            title: string;
            type: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            isRead: boolean;
        };
    }>;
    markAllAsRead(body?: {
        userId?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            count: number;
        };
    }>;
    deleteNotification(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteAllNotifications(userId?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            count: number;
        };
    }>;
}
//# sourceMappingURL=notifications.controller.d.ts.map
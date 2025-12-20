import { PrismaService } from '../prisma/prisma.service';
import { QueryNotificationsDto, CreateNotificationDto, BroadcastNotificationDto, NotificationStatsDto } from './dto/notifications.dto';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getNotificationStats(): Promise<NotificationStatsDto>;
    getAllNotifications(query: QueryNotificationsDto): Promise<{
        success: boolean;
        data: {
            id: string;
            userId: string;
            userEmail: string;
            userRole: import(".prisma/client").$Enums.UserRole;
            type: string;
            title: string;
            message: string;
            isRead: boolean;
            metadata: import("@prisma/client/runtime/client").JsonValue;
            createdAt: Date;
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
            userEmail: string;
            userRole: import(".prisma/client").$Enums.UserRole;
            type: string;
            title: string;
            message: string;
            isRead: boolean;
            metadata: import("@prisma/client/runtime/client").JsonValue;
            createdAt: Date;
        };
        message?: undefined;
    }>;
    createNotification(createNotificationDto: CreateNotificationDto): Promise<{
        success: boolean;
        message: string;
        data: {
            message: string;
            id: string;
            createdAt: Date;
            type: string;
            userId: string;
            title: string;
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
            message: string;
            id: string;
            createdAt: Date;
            type: string;
            userId: string;
            title: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            isRead: boolean;
        };
    }>;
    markAllAsRead(userId?: string): Promise<{
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
//# sourceMappingURL=notifications.service.d.ts.map
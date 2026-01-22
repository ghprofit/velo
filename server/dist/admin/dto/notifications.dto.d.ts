export declare class QueryNotificationsDto {
    search?: string;
    type?: string;
    isRead?: boolean;
    userId?: string;
    page?: number;
    limit?: number;
}
export declare class CreateNotificationDto {
    userId: string;
    type: string;
    title: string;
    message: string;
    metadata?: any;
}
export declare class BroadcastNotificationDto {
    type: string;
    title: string;
    message: string;
    userRole?: string;
    metadata?: any;
}
export interface NotificationStatsDto {
    total: number;
    unread: number;
    byType: Record<string, number>;
    recent: number;
}
//# sourceMappingURL=notifications.dto.d.ts.map
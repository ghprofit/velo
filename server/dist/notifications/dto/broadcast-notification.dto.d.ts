import { NotificationType } from './create-notification.dto';
export declare enum TargetRole {
    CREATOR = "CREATOR",
    ADMIN = "ADMIN",
    SUPPORT = "SUPPORT",
    SUPER_ADMIN = "SUPER_ADMIN",
    ALL = "ALL"
}
export declare class BroadcastNotificationDto {
    targetRoles: TargetRole[];
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
}
export declare class SendToMultipleUsersDto {
    userIds: string[];
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
}
//# sourceMappingURL=broadcast-notification.dto.d.ts.map
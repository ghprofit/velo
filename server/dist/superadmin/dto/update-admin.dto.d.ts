import { AdminRoleDto } from './create-admin.dto';
export declare enum AdminStatusDto {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    INVITED = "INVITED"
}
export declare class PermissionsDto {
    dashboard?: boolean;
    creatorManagement?: boolean;
    contentReview?: boolean;
    financialReports?: boolean;
    systemSettings?: boolean;
    supportTickets?: boolean;
}
export declare class UpdateAdminDto {
    fullName?: string;
    role?: AdminRoleDto;
    status?: AdminStatusDto;
    isActive?: boolean;
    permissions?: PermissionsDto;
}
//# sourceMappingURL=update-admin.dto.d.ts.map
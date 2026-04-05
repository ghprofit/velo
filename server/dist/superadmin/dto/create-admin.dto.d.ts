export declare enum AdminRoleDto {
    FINANCIAL_ADMIN = "FINANCIAL_ADMIN",
    CONTENT_ADMIN = "CONTENT_ADMIN",
    SUPPORT_SPECIALIST = "SUPPORT_SPECIALIST",
    ANALYTICS_ADMIN = "ANALYTICS_ADMIN"
}
export declare class CreateAdminDto {
    fullName: string;
    email: string;
    password: string;
    role: AdminRoleDto;
}
//# sourceMappingURL=create-admin.dto.d.ts.map
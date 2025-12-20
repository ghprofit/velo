export declare enum SettingCategory {
    GENERAL = "general",
    PAYMENTS = "payments",
    CONTENT = "content",
    SECURITY = "security"
}
export declare class UpdateSettingDto {
    value: string;
    description?: string;
    isPublic?: boolean;
}
export declare class CreateSettingDto {
    key: string;
    value: string;
    description?: string;
    category?: SettingCategory;
    isPublic?: boolean;
}
export declare class BulkUpdateSettingsDto {
    platformName?: string;
    platformDescription?: string;
    platformFeePercentage?: number;
    minPayoutAmount?: number;
    maxContentSize?: number;
    allowedContentTypes?: string;
    requireEmailVerification?: boolean;
    requireKYC?: boolean;
    maintenanceMode?: boolean;
    supportEmail?: string;
    maxLoginAttempts?: number;
    sessionTimeout?: number;
}
//# sourceMappingURL=settings.dto.d.ts.map
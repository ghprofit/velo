import { SettingsService } from './settings.service';
import { CreateSettingDto, UpdateSettingDto, BulkUpdateSettingsDto, SettingCategory } from './dto/settings.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    initializeSettings(): Promise<{
        message: string;
    }>;
    getAllSettings(category?: SettingCategory): Promise<{
        settings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            category: string;
            key: string;
            value: string;
            isPublic: boolean;
            updatedBy: string | null;
        }[];
        grouped: Record<string, any[]>;
    }>;
    getPublicSettings(): Promise<Record<string, string>>;
    getSetting(key: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        key: string;
        value: string;
        isPublic: boolean;
        updatedBy: string | null;
    }>;
    createSetting(dto: CreateSettingDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        key: string;
        value: string;
        isPublic: boolean;
        updatedBy: string | null;
    }>;
    bulkUpdateSettings(dto: BulkUpdateSettingsDto, req: any): Promise<{
        settings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            category: string;
            key: string;
            value: string;
            isPublic: boolean;
            updatedBy: string | null;
        }[];
        grouped: Record<string, any[]>;
    }>;
    updateSetting(key: string, dto: UpdateSettingDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        key: string;
        value: string;
        isPublic: boolean;
        updatedBy: string | null;
    }>;
    deleteSetting(key: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        key: string;
        value: string;
        isPublic: boolean;
        updatedBy: string | null;
    }>;
    resetToDefaults(req: any): Promise<{
        settings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            category: string;
            key: string;
            value: string;
            isPublic: boolean;
            updatedBy: string | null;
        }[];
        grouped: Record<string, any[]>;
    }>;
}
//# sourceMappingURL=settings.controller.d.ts.map
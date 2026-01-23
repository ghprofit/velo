import { PrismaService } from '../../prisma/prisma.service';
import { CreateSettingDto, UpdateSettingDto, BulkUpdateSettingsDto, SettingCategory } from './dto/settings.dto';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    initializeDefaultSettings(): Promise<void>;
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
    getSettingValue(key: string, defaultValue?: string): Promise<string>;
    createSetting(dto: CreateSettingDto, adminId: string): Promise<{
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
    updateSetting(key: string, dto: UpdateSettingDto, adminId: string): Promise<{
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
    bulkUpdateSettings(dto: BulkUpdateSettingsDto, adminId: string): Promise<{
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
    resetToDefaults(adminId: string): Promise<{
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
//# sourceMappingURL=settings.service.d.ts.map
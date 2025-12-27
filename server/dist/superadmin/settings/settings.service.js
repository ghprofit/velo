"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const settings_dto_1 = require("./dto/settings.dto");
let SettingsService = class SettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async initializeDefaultSettings() {
        const defaultSettings = [
            {
                key: 'platform_name',
                value: 'Velo',
                description: 'Platform name displayed across the application',
                category: settings_dto_1.SettingCategory.GENERAL,
                isPublic: true,
            },
            {
                key: 'platform_description',
                value: 'Premium content marketplace',
                description: 'Platform description for SEO and branding',
                category: settings_dto_1.SettingCategory.GENERAL,
                isPublic: true,
            },
            {
                key: 'platform_fee_percentage',
                value: '20',
                description: 'Platform fee percentage (0-100)',
                category: settings_dto_1.SettingCategory.PAYMENTS,
                isPublic: false,
            },
            {
                key: 'min_payout_amount',
                value: '50',
                description: 'Minimum payout amount in USD',
                category: settings_dto_1.SettingCategory.PAYMENTS,
                isPublic: false,
            },
            {
                key: 'max_content_size',
                value: '524288000',
                description: 'Maximum content file size in bytes (500MB)',
                category: settings_dto_1.SettingCategory.CONTENT,
                isPublic: false,
            },
            {
                key: 'allowed_content_types',
                value: 'video/mp4,image/jpeg,image/png,image/webp',
                description: 'Comma-separated list of allowed MIME types',
                category: settings_dto_1.SettingCategory.CONTENT,
                isPublic: false,
            },
            {
                key: 'require_email_verification',
                value: 'true',
                description: 'Require email verification for new users',
                category: settings_dto_1.SettingCategory.SECURITY,
                isPublic: false,
            },
            {
                key: 'require_kyc',
                value: 'true',
                description: 'Require KYC verification for creators',
                category: settings_dto_1.SettingCategory.SECURITY,
                isPublic: false,
            },
            {
                key: 'maintenance_mode',
                value: 'false',
                description: 'Enable maintenance mode (disable public access)',
                category: settings_dto_1.SettingCategory.GENERAL,
                isPublic: true,
            },
            {
                key: 'support_email',
                value: 'support@velo.com',
                description: 'Support email address',
                category: settings_dto_1.SettingCategory.GENERAL,
                isPublic: true,
            },
            {
                key: 'max_login_attempts',
                value: '5',
                description: 'Maximum login attempts before lockout',
                category: settings_dto_1.SettingCategory.SECURITY,
                isPublic: false,
            },
            {
                key: 'session_timeout',
                value: '3600',
                description: 'Session timeout in seconds',
                category: settings_dto_1.SettingCategory.SECURITY,
                isPublic: false,
            },
        ];
        for (const setting of defaultSettings) {
            await this.prisma.platformSettings.upsert({
                where: { key: setting.key },
                update: {},
                create: setting,
            });
        }
    }
    async getAllSettings(category) {
        const where = category ? { category } : {};
        const settings = await this.prisma.platformSettings.findMany({
            where,
            orderBy: [{ category: 'asc' }, { key: 'asc' }],
        });
        const grouped = settings.reduce((acc, setting) => {
            if (!acc[setting.category]) {
                acc[setting.category] = [];
            }
            acc[setting.category].push(setting);
            return acc;
        }, {});
        return {
            settings,
            grouped,
        };
    }
    async getPublicSettings() {
        const settings = await this.prisma.platformSettings.findMany({
            where: { isPublic: true },
            select: {
                key: true,
                value: true,
                description: true,
            },
        });
        return settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
    }
    async getSetting(key) {
        const setting = await this.prisma.platformSettings.findUnique({
            where: { key },
        });
        if (!setting) {
            throw new common_1.NotFoundException(`Setting with key "${key}" not found`);
        }
        return setting;
    }
    async getSettingValue(key, defaultValue) {
        try {
            const setting = await this.getSetting(key);
            return setting.value;
        }
        catch {
            return defaultValue || '';
        }
    }
    async createSetting(dto, adminId) {
        return this.prisma.platformSettings.create({
            data: {
                ...dto,
                updatedBy: adminId,
            },
        });
    }
    async updateSetting(key, dto, adminId) {
        const setting = await this.getSetting(key);
        return this.prisma.platformSettings.update({
            where: { key },
            data: {
                ...dto,
                updatedBy: adminId,
            },
        });
    }
    async bulkUpdateSettings(dto, adminId) {
        const updates = [];
        const settingsMap = {
            platformName: 'platform_name',
            platformDescription: 'platform_description',
            platformFeePercentage: 'platform_fee_percentage',
            minPayoutAmount: 'min_payout_amount',
            maxContentSize: 'max_content_size',
            allowedContentTypes: 'allowed_content_types',
            requireEmailVerification: 'require_email_verification',
            requireKYC: 'require_kyc',
            maintenanceMode: 'maintenance_mode',
            supportEmail: 'support_email',
            maxLoginAttempts: 'max_login_attempts',
            sessionTimeout: 'session_timeout',
        };
        for (const [dtoKey, settingKey] of Object.entries(settingsMap)) {
            if (dto[dtoKey] !== undefined) {
                updates.push(this.prisma.platformSettings.update({
                    where: { key: settingKey },
                    data: {
                        value: String(dto[dtoKey]),
                        updatedBy: adminId,
                    },
                }));
            }
        }
        await Promise.all(updates);
        return this.getAllSettings();
    }
    async deleteSetting(key) {
        const setting = await this.getSetting(key);
        return this.prisma.platformSettings.delete({
            where: { key },
        });
    }
    async resetToDefaults(adminId) {
        await this.prisma.platformSettings.deleteMany({});
        await this.initializeDefaultSettings();
        return this.getAllSettings();
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map
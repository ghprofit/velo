import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSettingDto,
  UpdateSettingDto,
  BulkUpdateSettingsDto,
  SettingCategory,
} from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Initialize default settings if they don't exist
   */
  async initializeDefaultSettings() {
    const defaultSettings = [
      {
        key: 'platform_name',
        value: 'Velo',
        description: 'Platform name displayed across the application',
        category: SettingCategory.GENERAL,
        isPublic: true,
      },
      {
        key: 'platform_description',
        value: 'Premium content marketplace',
        description: 'Platform description for SEO and branding',
        category: SettingCategory.GENERAL,
        isPublic: true,
      },
      {
        key: 'platform_fee_percentage',
        value: '20',
        description: 'Platform fee percentage (0-100)',
        category: SettingCategory.PAYMENTS,
        isPublic: false,
      },
      {
        key: 'min_payout_amount',
        value: '50',
        description: 'Minimum payout amount in USD',
        category: SettingCategory.PAYMENTS,
        isPublic: false,
      },
      {
        key: 'max_content_size',
        value: '524288000',
        description: 'Maximum content file size in bytes (500MB)',
        category: SettingCategory.CONTENT,
        isPublic: false,
      },
      {
        key: 'allowed_content_types',
        value: 'video/mp4,image/jpeg,image/png,image/webp',
        description: 'Comma-separated list of allowed MIME types',
        category: SettingCategory.CONTENT,
        isPublic: false,
      },
      {
        key: 'require_email_verification',
        value: 'true',
        description: 'Require email verification for new users',
        category: SettingCategory.SECURITY,
        isPublic: false,
      },
      {
        key: 'require_kyc',
        value: 'true',
        description: 'Require KYC verification for creators',
        category: SettingCategory.SECURITY,
        isPublic: false,
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        description: 'Enable maintenance mode (disable public access)',
        category: SettingCategory.GENERAL,
        isPublic: true,
      },
      {
        key: 'support_email',
        value: 'support@velolink.club',
        description: 'Support email address',
        category: SettingCategory.GENERAL,
        isPublic: true,
      },
      {
        key: 'max_login_attempts',
        value: '5',
        description: 'Maximum login attempts before lockout',
        category: SettingCategory.SECURITY,
        isPublic: false,
      },
      {
        key: 'session_timeout',
        value: '3600',
        description: 'Session timeout in seconds',
        category: SettingCategory.SECURITY,
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

  /**
   * Get all settings or filter by category
   */
  async getAllSettings(category?: SettingCategory) {
    const where = category ? { category } : {};

    const settings = await this.prisma.platformSettings.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    // Group by category
    const grouped = settings.reduce((acc: Record<string, any[]>, setting: any) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category]!.push(setting);
      return acc;
    }, {} as Record<string, any[]>);

    return {
      settings,
      grouped,
    };
  }

  /**
   * Get public settings (for frontend display)
   */
  async getPublicSettings() {
    const settings = await this.prisma.platformSettings.findMany({
      where: { isPublic: true },
      select: {
        key: true,
        value: true,
        description: true,
      },
    });

    return settings.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Get a single setting by key
   */
  async getSetting(key: string) {
    const setting = await this.prisma.platformSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }

    return setting;
  }

  /**
   * Get setting value by key
   */
  async getSettingValue(key: string, defaultValue?: string): Promise<string> {
    try {
      const setting = await this.getSetting(key);
      return setting.value;
    } catch {
      return defaultValue || '';
    }
  }

  /**
   * Create a new setting
   */
  async createSetting(dto: CreateSettingDto, adminId: string) {
    return this.prisma.platformSettings.create({
      data: {
        ...dto,
        updatedBy: adminId,
      },
    });
  }

  /**
   * Update a setting
   */
  async updateSetting(key: string, dto: UpdateSettingDto, adminId: string) {
    const setting = await this.getSetting(key);

    return this.prisma.platformSettings.update({
      where: { key },
      data: {
        ...dto,
        updatedBy: adminId,
      },
    });
  }

  /**
   * Bulk update settings
   */
  async bulkUpdateSettings(dto: BulkUpdateSettingsDto, adminId: string) {
    const updates = [];

    // Map DTO fields to setting keys
    const settingsMap: Record<string, any> = {
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
      if ((dto as any)[dtoKey] !== undefined) {
        updates.push(
          this.prisma.platformSettings.update({
            where: { key: settingKey },
            data: {
              value: String((dto as any)[dtoKey]),
              updatedBy: adminId,
            },
          }),
        );
      }
    }

    await Promise.all(updates);

    return this.getAllSettings();
  }

  /**
   * Delete a setting
   */
  async deleteSetting(key: string) {
    const setting = await this.getSetting(key);

    return this.prisma.platformSettings.delete({
      where: { key },
    });
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(adminId: string) {
    await this.prisma.platformSettings.deleteMany({});
    await this.initializeDefaultSettings();
    return this.getAllSettings();
  }
}

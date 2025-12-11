import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum SettingCategory {
  GENERAL = 'general',
  PAYMENTS = 'payments',
  CONTENT = 'content',
  SECURITY = 'security',
}

export class UpdateSettingDto {
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class CreateSettingDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(SettingCategory)
  category?: SettingCategory;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class BulkUpdateSettingsDto {
  @IsOptional()
  platformName?: string;

  @IsOptional()
  platformDescription?: string;

  @IsOptional()
  platformFeePercentage?: number;

  @IsOptional()
  minPayoutAmount?: number;

  @IsOptional()
  maxContentSize?: number;

  @IsOptional()
  allowedContentTypes?: string;

  @IsOptional()
  requireEmailVerification?: boolean;

  @IsOptional()
  requireKYC?: boolean;

  @IsOptional()
  maintenanceMode?: boolean;

  @IsOptional()
  supportEmail?: string;

  @IsOptional()
  maxLoginAttempts?: number;

  @IsOptional()
  sessionTimeout?: number;
}

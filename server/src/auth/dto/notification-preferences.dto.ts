import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsBoolean()
  @IsOptional()
  payoutUpdates?: boolean;

  @IsBoolean()
  @IsOptional()
  contentEngagement?: boolean;

  @IsBoolean()
  @IsOptional()
  platformAnnouncements?: boolean;

  @IsBoolean()
  @IsOptional()
  marketingEmails?: boolean;
}

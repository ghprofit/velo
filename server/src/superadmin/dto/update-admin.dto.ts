import { IsString, IsEnum, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AdminRoleDto } from './create-admin.dto';

export enum AdminStatusDto {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INVITED = 'INVITED',
}

export class PermissionsDto {
  @IsBoolean()
  @IsOptional()
  dashboard?: boolean;

  @IsBoolean()
  @IsOptional()
  creatorManagement?: boolean;

  @IsBoolean()
  @IsOptional()
  contentReview?: boolean;

  @IsBoolean()
  @IsOptional()
  financialReports?: boolean;

  @IsBoolean()
  @IsOptional()
  systemSettings?: boolean;

  @IsBoolean()
  @IsOptional()
  supportTickets?: boolean;
}

export class UpdateAdminDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEnum(AdminRoleDto)
  @IsOptional()
  role?: AdminRoleDto;

  @IsEnum(AdminStatusDto)
  @IsOptional()
  status?: AdminStatusDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ValidateNested()
  @Type(() => PermissionsDto)
  @IsOptional()
  permissions?: PermissionsDto;
}

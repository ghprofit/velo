import { IsEmail, IsString, IsEnum, MinLength, IsOptional } from 'class-validator';

export enum AdminRoleDto {
  FINANCIAL_ADMIN = 'FINANCIAL_ADMIN',
  CONTENT_ADMIN = 'CONTENT_ADMIN',
  SUPPORT_SPECIALIST = 'SUPPORT_SPECIALIST',
  ANALYTICS_ADMIN = 'ANALYTICS_ADMIN',
}

export class CreateAdminDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(AdminRoleDto)
  role: AdminRoleDto;
}

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsObject } from 'class-validator';
import { NotificationType } from './create-notification.dto';

export enum TargetRole {
  CREATOR = 'CREATOR',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ALL = 'ALL',
}

export class BroadcastNotificationDto {
  @IsArray()
  @IsEnum(TargetRole, { each: true })
  @IsNotEmpty()
  targetRoles: TargetRole[];

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class SendToMultipleUsersDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  userIds: string[];

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

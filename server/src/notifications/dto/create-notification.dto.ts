import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';

export enum NotificationType {
  // Creator notifications
  VERIFICATION_APPROVED = 'VERIFICATION_APPROVED',
  VERIFICATION_REJECTED = 'VERIFICATION_REJECTED',
  CONTENT_APPROVED = 'CONTENT_APPROVED',
  CONTENT_REJECTED = 'CONTENT_REJECTED',
  CONTENT_FLAGGED = 'CONTENT_FLAGGED',
  CONTENT_UNDER_REVIEW = 'CONTENT_UNDER_REVIEW',
  UPLOAD_SUCCESSFUL = 'UPLOAD_SUCCESSFUL',
  PURCHASE_MADE = 'PURCHASE_MADE',
  PAYOUT_SENT = 'PAYOUT_SENT',
  PAYOUT_FAILED = 'PAYOUT_FAILED',

  // Admin/System notifications
  PLATFORM_UPDATE = 'PLATFORM_UPDATE',
  NEW_FEATURE = 'NEW_FEATURE',
  POLICY_WARNING = 'POLICY_WARNING',
  POLICY_UPDATE = 'POLICY_UPDATE',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',

  // Support notifications
  SUPPORT_TICKET_CREATED = 'SUPPORT_TICKET_CREATED',
  SUPPORT_TICKET_RESOLVED = 'SUPPORT_TICKET_RESOLVED',
  SUPPORT_REPLY = 'SUPPORT_REPLY',

  // Admin-specific notifications
  NEW_CREATOR_SIGNUP = 'NEW_CREATOR_SIGNUP',
  CONTENT_PENDING_REVIEW = 'CONTENT_PENDING_REVIEW',
  VERIFICATION_PENDING = 'VERIFICATION_PENDING',
  PAYOUT_REQUEST = 'PAYOUT_REQUEST',
  FLAGGED_CONTENT_ALERT = 'FLAGGED_CONTENT_ALERT',

  // General
  WELCOME = 'WELCOME',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

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

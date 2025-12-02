import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EmailAttachment {
  @IsNotEmpty()
  @IsString()
  content: string; // Base64 encoded content

  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  @IsString()
  type: string; // MIME type

  @IsOptional()
  @IsString()
  disposition?: 'attachment' | 'inline'; // 'attachment' or 'inline'

  @IsOptional()
  @IsString()
  content_id?: string; // For inline images
}

export class SendEmailDto {
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  text?: string; // Plain text content

  @IsOptional()
  @IsString()
  html?: string; // HTML content

  @IsOptional()
  @IsEmail()
  from?: string; // Override default from

  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsEmail()
  replyTo?: string;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAttachment)
  attachments?: EmailAttachment[];

  @IsOptional()
  @IsObject()
  customArgs?: Record<string, string>; // Custom tracking data
}

export class SendEmailResponseDto {
  success: boolean;
  messageId?: string;
  message: string;
  timestamp: Date;
}

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BulkEmailRecipient {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsObject()
  templateData?: Record<string, any>; // Personalization data per recipient
}

export class SendBulkEmailDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkEmailRecipient)
  @ArrayMinSize(1)
  recipients: BulkEmailRecipient[];

  @IsOptional()
  @IsString()
  subject?: string; // For non-template emails

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsString()
  templateId?: string; // SendGrid template ID

  @IsOptional()
  @IsObject()
  commonTemplateData?: Record<string, any>; // Data shared across all recipients

  @IsOptional()
  @IsEmail()
  from?: string;

  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsEmail()
  replyTo?: string;

  @IsOptional()
  @IsObject()
  customArgs?: Record<string, string>;
}

export class SendBulkEmailResponseDto {
  success: boolean;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  failures?: Array<{
    email: string;
    error: string;
  }>;
  message: string;
  timestamp: Date;
}

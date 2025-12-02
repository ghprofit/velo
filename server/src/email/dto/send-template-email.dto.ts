import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
  IsArray,
} from 'class-validator';

export class SendTemplateEmailDto {
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @IsNotEmpty()
  @IsString()
  templateId: string; // SendGrid dynamic template ID

  @IsNotEmpty()
  @IsObject()
  templateData: Record<string, any>; // Dynamic template data

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
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @IsOptional()
  @IsObject()
  customArgs?: Record<string, string>;
}

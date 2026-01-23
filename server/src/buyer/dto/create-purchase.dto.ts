import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreatePurchaseDto {
  @IsNotEmpty()
  @IsString()
  contentId: string;

  @IsNotEmpty()
  @IsString()
  sessionToken: string;

  @IsNotEmpty() // Email is required for invoice sending
  @IsEmail()
  email: string;

  @IsNotEmpty() // Bug #13 fix: Make fingerprint REQUIRED
  @IsString()
  fingerprint: string;
}

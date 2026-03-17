import { IsString, IsNotEmpty, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreatePurchaseDto {
  @IsNotEmpty()
  @IsString()
  contentId: string;

  @IsOptional()
  @IsString()
  paymentProvider?: string;

  @IsNotEmpty()
  @IsString()
  sessionToken: string;

  @IsNotEmpty() // Email is required for invoice sending
  @IsEmail()
  @MinLength(5)
  @MaxLength(254)
  email: string;

  @IsNotEmpty() // Bug #13 fix: Make fingerprint REQUIRED
  @IsString()
  fingerprint: string;
}

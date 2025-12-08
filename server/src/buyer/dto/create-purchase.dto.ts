import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreatePurchaseDto {
  @IsNotEmpty()
  @IsString()
  contentId: string;

  @IsNotEmpty()
  @IsString()
  sessionToken: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

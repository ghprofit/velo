import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  fingerprint?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
